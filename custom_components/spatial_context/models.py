"""3D models for furniture items (a car, an appliance) in Spatial Context.

A layout item can wear a real model instead of the frontend's own drawing
of it: a .glb uploaded here (from Sketchfab, a maker's site…). Models run
to tens of megabytes, so like room scans the files live on disk under
<config>/.storage/spatial_context/models/, named by a random id; the item
keeps only that id (`model_id`, see websocket_api.py) and a label.

Files are uploaded and fetched over two authenticated HTTP views.
"""

from __future__ import annotations

import json
import re
import struct
import uuid
from pathlib import Path
from typing import Any

from aiohttp import BodyPartReader, web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN

# Detailed vehicle models run 20-80 MB.
MAX_MODEL_BYTES = 200 * 1024 * 1024

_ID_RE = re.compile(r"^[0-9a-f]{32}$")


def models_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(".storage", DOMAIN, "models"))


def _credit(data: bytes) -> dict[str, Any]:
    """A .glb's own title, author and licence (Sketchfab writes them into
    its asset's extras), when it carries them."""
    try:
        length, kind = struct.unpack_from("<I4s", data, 12)
        if kind != b"JSON":
            return {}
        doc = json.loads(data[20 : 20 + length])
    except (struct.error, ValueError, UnicodeDecodeError):
        return {}
    extras = (doc.get("asset") or {}).get("extras") or {}
    return {
        key: str(extras[key])[:300]
        for key in ("title", "author", "license", "source")
        if isinstance(extras.get(key), str)
    }


class ModelUploadView(HomeAssistantView):
    """POST a .glb model for an item (multipart, field "file")."""

    url = "/api/spatial_context/model_upload"
    name = "api:spatial_context:model_upload"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        reader = await request.multipart()
        field = await reader.next()
        while field is not None and getattr(field, "name", None) != "file":
            field = await reader.next()
        if field is None or not isinstance(field, BodyPartReader):
            return self.json_message("No file", 400)
        filename = field.filename or "model.glb"
        # Streamed: HA caps a whole request body at 16 MB.
        buf = bytearray()
        while chunk := await field.read_chunk(1024 * 1024):
            buf.extend(chunk)
            if len(buf) > MAX_MODEL_BYTES:
                return self.json_message("Model is too large", 413)
        data = bytes(buf)
        if data[:4] != b"glTF":
            return self.json_message(
                "Not a .glb model: download it as glTF Binary (.glb)", 415
            )
        model_id = uuid.uuid4().hex
        path = models_dir(hass) / f"{model_id}.glb"

        def _write() -> None:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

        await hass.async_add_executor_job(_write)
        return self.json(
            {
                "id": model_id,
                "name": Path(filename).stem[:120] or "Model",
                "size": len(data),
                **_credit(data),
            }
        )


class ModelFileView(HomeAssistantView):
    """GET a model's file back."""

    url = "/api/spatial_context/model/{model_id}"
    name = "api:spatial_context:model"
    requires_auth = True

    async def get(self, request: web.Request, model_id: str) -> web.StreamResponse:
        if not _ID_RE.match(model_id):
            return self.json_message("Bad model id", 400)
        hass: HomeAssistant = request.app["hass"]
        path = models_dir(hass) / f"{model_id}.glb"
        if not await hass.async_add_executor_job(path.is_file):
            return self.json_message("Model not found", 404)
        return web.FileResponse(
            path,
            headers={
                "Content-Type": "model/gltf-binary",
                # The id is unique to these bytes: cached for good.
                "Cache-Control": "private, max-age=31536000, immutable",
            },
        )


def async_register_model_views(hass: HomeAssistant) -> None:
    hass.http.register_view(ModelUploadView())
    hass.http.register_view(ModelFileView())
