"""3D view settings and room scans for Spatial Context.

A floor's 3D view keeps two things apart from its 2D layout: the wall
height its walls are extruded to, and any phone room scans (glTF / GLB)
laid over the plan. Scans can run to tens of megabytes, so the files live
on disk under <config>/.storage/spatial_context/scans/ — never in a JSON
store or a WebSocket payload. Only their small metadata (name, size, and
the transform that lines each scan up with the plan) is kept in the
`spatial_context.view3d` store, keyed by floor_id.

Files are uploaded and fetched over two authenticated HTTP views; the
metadata is read and updated over WebSocket (see websocket_api.py).
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import uuid
from pathlib import Path
from typing import Any

from aiohttp import BodyPartReader, web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_STORE_VERSION = 1
_STORE_KEY = f"{DOMAIN}.view3d"

# Room scans from phone LiDAR apps are typically 2-40 MB; this leaves
# plenty of room while stopping a runaway upload from filling the disk.
MAX_SCAN_BYTES = 200 * 1024 * 1024
DEFAULT_WALL_HEIGHT_M = 2.4

_ID_RE = re.compile(r"^[0-9a-f]{32}$")
_CONTENT_TYPES = {"glb": "model/gltf-binary", "gltf": "model/gltf+json"}


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    return Store(hass, _STORE_VERSION, _STORE_KEY)


def _lock(hass: HomeAssistant) -> asyncio.Lock:
    key = f"{DOMAIN}_view3d_lock"
    if key not in hass.data:
        hass.data[key] = asyncio.Lock()
    return hass.data[key]


def scans_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(".storage", DOMAIN, "scans"))


def _empty_floor() -> dict[str, Any]:
    return {"wall_height_m": None, "scans": []}


async def _async_load(hass: HomeAssistant) -> dict[str, Any]:
    data = await _store(hass).async_load()
    if not data or "floors" not in data:
        return {"floors": {}}
    return data


async def async_get_view3d(hass: HomeAssistant, floor_id: str) -> dict[str, Any]:
    """A floor's 3D settings and scan list (an empty skeleton if none)."""
    data = await _async_load(hass)
    floor = data["floors"].get(floor_id) or _empty_floor()
    return {
        "wall_height_m": floor.get("wall_height_m"),
        "scans": floor.get("scans", []),
    }


def _new_scan(scan_id: str, name: str, ext: str, size: int) -> dict[str, Any]:
    return {
        "id": scan_id,
        "name": name,
        "ext": ext,
        "size_bytes": size,
        "uploaded_at": time.time(),
        # Where the scan's origin sits on the plan, in the floor's stored
        # units (like everything else on the plan); None until first placed
        # — the panel then centres it on the plan.
        "x": None,
        "y": None,
        # Metres above the floor's level, degrees clockwise as seen from
        # above, and a uniform scale (scans are in metres already, so 1).
        "elevation_m": 0.0,
        "rotation_deg": 0.0,
        "scale": 1.0,
        "visible": True,
        "opacity": 1.0,
        # Hide the floor's extruded walls while this scan shows, so the
        # scan stands in for them instead of overlaying them.
        "hide_walls": False,
    }


async def async_add_scan(
    hass: HomeAssistant, floor_id: str, name: str, ext: str, data: bytes
) -> dict[str, Any]:
    """Write an uploaded scan's file and add its metadata to the floor."""
    scan_id = uuid.uuid4().hex
    path = scans_dir(hass) / f"{scan_id}.{ext}"

    def _write() -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    await hass.async_add_executor_job(_write)
    scan = _new_scan(scan_id, name, ext, len(data))
    async with _lock(hass):
        all_data = await _async_load(hass)
        floor = all_data["floors"].setdefault(floor_id, _empty_floor())
        floor.setdefault("scans", []).append(scan)
        await _store(hass).async_save(all_data)
    return scan


# What a save may change on an existing scan — never its id, file or size.
_EDITABLE = (
    "name",
    "x",
    "y",
    "elevation_m",
    "rotation_deg",
    "scale",
    "visible",
    "opacity",
    "hide_walls",
)


async def async_save_view3d(
    hass: HomeAssistant,
    floor_id: str,
    wall_height_m: float | None,
    scans: list[dict[str, Any]],
) -> dict[str, Any]:
    """Update a floor's wall height and its scans' placement/look.

    Scans are matched by id: listed ones are updated, unknown ids ignored
    (a file only ever arrives through the upload view), and scans left out
    are kept — deleting one is its own explicit command, so a save sent
    from a tab that hasn't seen a just-uploaded scan can't lose it.
    """
    async with _lock(hass):
        data = await _async_load(hass)
        floor = data["floors"].setdefault(floor_id, _empty_floor())
        floor["wall_height_m"] = wall_height_m
        by_id = {scan["id"]: scan for scan in scans}
        for scan in floor.setdefault("scans", []):
            patch = by_id.get(scan["id"])
            if patch:
                for key in _EDITABLE:
                    if key in patch:
                        scan[key] = patch[key]
        await _store(hass).async_save(data)
        return {"wall_height_m": floor["wall_height_m"], "scans": floor["scans"]}


async def async_delete_scan(hass: HomeAssistant, scan_id: str) -> bool:
    """Remove a scan's metadata (from whichever floor has it) and file."""
    removed: dict[str, Any] | None = None
    async with _lock(hass):
        data = await _async_load(hass)
        for floor in data["floors"].values():
            for scan in floor.get("scans", []):
                if scan["id"] == scan_id:
                    removed = scan
                    floor["scans"].remove(scan)
                    break
            if removed:
                break
        if removed:
            await _store(hass).async_save(data)
    if not removed:
        return False
    path = scans_dir(hass) / f"{scan_id}.{removed.get('ext', 'glb')}"
    await hass.async_add_executor_job(lambda: path.unlink(missing_ok=True))
    return True


def _scan_ext(filename: str, data: bytes) -> str | None:
    """'glb' or 'gltf' when the bytes really are one, else None."""
    if data[:4] == b"glTF":
        return "glb"
    if filename.lower().endswith(".gltf"):
        try:
            doc = json.loads(data)
        except (ValueError, UnicodeDecodeError):
            return None
        if isinstance(doc, dict) and "asset" in doc:
            return "gltf"
    return None


class ScanUploadView(HomeAssistantView):
    """POST a .glb/.gltf room scan for a floor (multipart, field "file")."""

    url = "/api/spatial_context/scan_upload/{floor_id}"
    name = "api:spatial_context:scan_upload"
    requires_auth = True

    async def post(self, request: web.Request, floor_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        reader = await request.multipart()
        field = await reader.next()
        while field is not None and getattr(field, "name", None) != "file":
            field = await reader.next()
        if field is None or not isinstance(field, BodyPartReader):
            return self.json_message("No file", 400)
        filename = field.filename or "scan.glb"
        # Streamed, not request.post(): HA caps a whole request body at
        # 16 MB, smaller than many scans.
        buf = bytearray()
        while chunk := await field.read_chunk(1024 * 1024):
            buf.extend(chunk)
            if len(buf) > MAX_SCAN_BYTES:
                return self.json_message("Scan is too large", 413)
        data = bytes(buf)
        ext = _scan_ext(filename, data)
        if ext is None:
            return self.json_message(
                "Not a glTF scan — export it from the scanning app as .glb or .gltf",
                415,
            )
        name = Path(filename).stem[:120] or "Scan"
        scan = await async_add_scan(hass, floor_id, name, ext, data)
        return self.json(scan)


class ScanFileView(HomeAssistantView):
    """GET a scan's file back."""

    url = "/api/spatial_context/scan/{scan_id}"
    name = "api:spatial_context:scan"
    requires_auth = True

    async def get(self, request: web.Request, scan_id: str) -> web.StreamResponse:
        if not _ID_RE.match(scan_id):
            return self.json_message("Bad scan id", 400)
        hass: HomeAssistant = request.app["hass"]
        for ext, content_type in _CONTENT_TYPES.items():
            path = scans_dir(hass) / f"{scan_id}.{ext}"
            if await hass.async_add_executor_job(path.is_file):
                return web.FileResponse(
                    path,
                    headers={
                        "Content-Type": content_type,
                        # The id is unique to these bytes, so it can be
                        # cached for good.
                        "Cache-Control": "private, max-age=31536000, immutable",
                    },
                )
        return self.json_message("Scan not found", 404)


def async_register_scan_views(hass: HomeAssistant) -> None:
    hass.http.register_view(ScanUploadView())
    hass.http.register_view(ScanFileView())
