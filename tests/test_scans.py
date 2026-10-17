"""Tests for room scan storage (`scans.py`): the upload and file views over a
real aiohttp server, and the 3D settings store.

Runs without Home Assistant installed: the HA modules scans.py imports are
replaced by small stubs (an in-memory Store, a minimal HomeAssistantView).

    python3 -m unittest discover -s tests
"""

from __future__ import annotations

import asyncio
import copy
import importlib.util
import json
import struct
import sys
import tempfile
import types
import unittest
import warnings
from pathlib import Path
from typing import Any

from aiohttp import FormData, web
from aiohttp.test_utils import TestClient, TestServer

SCANS = (
    Path(__file__).resolve().parent.parent
    / "custom_components"
    / "spatial_context"
    / "scans.py"
)

# Every Store's saved data, by key — shared by Store instances like HA's
# own files on disk would be.
_STORES: dict[str, Any] = {}


def _load_scans() -> types.ModuleType:
    pkg = types.ModuleType("sc_scans_test")
    pkg.__path__ = []  # type: ignore[attr-defined]
    sys.modules["sc_scans_test"] = pkg

    const = types.ModuleType("sc_scans_test.const")
    const.DOMAIN = "spatial_context"  # type: ignore[attr-defined]
    sys.modules["sc_scans_test.const"] = const

    ha = types.ModuleType("homeassistant")
    core = types.ModuleType("homeassistant.core")
    core.HomeAssistant = object  # type: ignore[attr-defined]
    helpers = types.ModuleType("homeassistant.helpers")
    storage = types.ModuleType("homeassistant.helpers.storage")

    class Store:
        def __init__(self, hass: Any, version: int, key: str) -> None:
            self.key = key

        async def async_load(self) -> Any:
            return copy.deepcopy(_STORES.get(self.key))

        async def async_save(self, data: Any) -> None:
            _STORES[self.key] = copy.deepcopy(data)

    storage.Store = Store  # type: ignore[attr-defined]
    components = types.ModuleType("homeassistant.components")
    http = types.ModuleType("homeassistant.components.http")

    class HomeAssistantView:
        def json(self, result: Any, status_code: int = 200) -> web.Response:
            return web.json_response(result, status=status_code)

        def json_message(self, message: str, status_code: int = 200) -> web.Response:
            return web.json_response({"message": message}, status=status_code)

    http.HomeAssistantView = HomeAssistantView  # type: ignore[attr-defined]
    for name, module in {
        "homeassistant": ha,
        "homeassistant.core": core,
        "homeassistant.helpers": helpers,
        "homeassistant.helpers.storage": storage,
        "homeassistant.components": components,
        "homeassistant.components.http": http,
    }.items():
        sys.modules[name] = module

    spec = importlib.util.spec_from_file_location("sc_scans_test.scans", SCANS)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules["sc_scans_test.scans"] = module
    spec.loader.exec_module(module)
    return module


class FakeHass:
    def __init__(self, config_dir: str) -> None:
        self.data: dict[str, Any] = {}
        self.config = types.SimpleNamespace(
            path=lambda *parts: str(Path(config_dir, *parts))
        )

    async def async_add_executor_job(self, fn: Any, *args: Any) -> Any:
        return await asyncio.get_running_loop().run_in_executor(None, fn, *args)


def _glb() -> bytes:
    """A minimal valid GLB: a header and an empty JSON chunk."""
    doc = json.dumps({"asset": {"version": "2.0"}}).encode()
    doc += b" " * (-len(doc) % 4)
    return (
        struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(doc))
        + struct.pack("<I4s", len(doc), b"JSON")
        + doc
    )


class ScansTest(unittest.TestCase):
    def setUp(self) -> None:
        _STORES.clear()
        self.scans = _load_scans()
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.hass = FakeHass(self.tmp.name)

    def _run(self, coro: Any) -> Any:
        return asyncio.run(coro)

    async def _client(self) -> TestClient:
        upload = self.scans.ScanUploadView()
        fetch = self.scans.ScanFileView()
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            app = web.Application()
            app["hass"] = self.hass

        async def post(request: web.Request) -> web.StreamResponse:
            return await upload.post(request, request.match_info["floor_id"])

        async def get(request: web.Request) -> web.StreamResponse:
            return await fetch.get(request, request.match_info["scan_id"])

        app.router.add_post(upload.url, post)
        app.router.add_get(fetch.url, get)
        client = TestClient(TestServer(app))
        await client.start_server()
        return client

    def test_upload_fetch_and_list(self) -> None:
        async def run() -> None:
            client = await self._client()
            try:
                form = FormData()
                form.add_field("file", _glb(), filename="Bedroom.glb")
                resp = await client.post(
                    "/api/spatial_context/scan_upload/ground", data=form
                )
                self.assertEqual(resp.status, 200)
                scan = await resp.json()
                self.assertEqual(scan["name"], "Bedroom")
                self.assertEqual(scan["ext"], "glb")
                self.assertEqual(scan["size_bytes"], len(_glb()))
                self.assertIsNone(scan["x"])
                self.assertEqual(scan["scale"], 1.0)

                path = Path(self.tmp.name, ".storage", "spatial_context", "scans")
                self.assertTrue((path / f"{scan['id']}.glb").is_file())
                # Only metadata in the store, never the bytes.
                self.assertNotIn("glTF", json.dumps(_STORES))

                resp = await client.get(f"/api/spatial_context/scan/{scan['id']}")
                self.assertEqual(resp.status, 200)
                self.assertEqual(await resp.read(), _glb())
                self.assertEqual(resp.headers["Content-Type"], "model/gltf-binary")

                resp = await client.get("/api/spatial_context/scan/../../secrets")
                self.assertIn(resp.status, (400, 404))
                resp = await client.get(f"/api/spatial_context/scan/{'0' * 32}")
                self.assertEqual(resp.status, 404)

                view = await self.scans.async_get_view3d(self.hass, "ground")
                self.assertEqual([s["id"] for s in view["scans"]], [scan["id"]])
                self.assertIsNone(view["wall_height_m"])
                self.assertIsNone(view["floor_elevation_m"])
            finally:
                await client.close()

        self._run(run())

    def test_rejects_files_that_are_not_gltf(self) -> None:
        async def run() -> None:
            client = await self._client()
            try:
                form = FormData()
                form.add_field("file", b"solid cube\nendsolid", filename="room.stl")
                resp = await client.post(
                    "/api/spatial_context/scan_upload/ground", data=form
                )
                self.assertEqual(resp.status, 415)
                view = await self.scans.async_get_view3d(self.hass, "ground")
                self.assertEqual(view["scans"], [])

                form = FormData()
                form.add_field(
                    "file",
                    json.dumps({"asset": {"version": "2.0"}}).encode(),
                    filename="room.gltf",
                )
                resp = await client.post(
                    "/api/spatial_context/scan_upload/ground", data=form
                )
                self.assertEqual(resp.status, 200)
                self.assertEqual((await resp.json())["ext"], "gltf")
            finally:
                await client.close()

        self._run(run())

    def test_save_updates_placement_only(self) -> None:
        async def run() -> None:
            a = await self.scans.async_add_scan(self.hass, "ground", "A", "glb", _glb())
            b = await self.scans.async_add_scan(self.hass, "ground", "B", "glb", _glb())
            result = await self.scans.async_save_view3d(
                self.hass,
                "ground",
                2.7,
                [
                    {
                        "id": a["id"],
                        "x": 120.5,
                        "y": 80.0,
                        "rotation_deg": 12.0,
                        "elevation_m": 1.2,
                        "opacity": 0.5,
                        "hide_walls": True,
                        # Not editable: ignored.
                        "size_bytes": 1,
                        "ext": "obj",
                    },
                    {"id": "not-a-scan", "x": 1.0},
                ],
            )
            self.assertEqual(result["wall_height_m"], 2.7)
            by_id = {s["id"]: s for s in result["scans"]}
            # B was left out of the save, and is kept as it was.
            self.assertEqual(set(by_id), {a["id"], b["id"]})
            self.assertEqual(by_id[b["id"]], b)
            saved = by_id[a["id"]]
            self.assertEqual(saved["x"], 120.5)
            self.assertEqual(saved["rotation_deg"], 12.0)
            self.assertEqual(saved["elevation_m"], 1.2)
            self.assertTrue(saved["hide_walls"])
            self.assertEqual(saved["size_bytes"], len(_glb()))
            self.assertEqual(saved["ext"], "glb")

            again = await self.scans.async_get_view3d(self.hass, "ground")
            self.assertEqual(again, result)

        self._run(run())

    def test_floor_elevation_saved_and_kept_when_left_out(self) -> None:
        async def run() -> None:
            # Never saved: automatic stacking.
            view = await self.scans.async_get_view3d(self.hass, "upstairs")
            self.assertIsNone(view["floor_elevation_m"])

            result = await self.scans.async_save_view3d(
                self.hass, "upstairs", None, [], floor_elevation_m=3.91
            )
            self.assertEqual(result["floor_elevation_m"], 3.91)
            self.assertIsNone(result["wall_height_m"])

            # A save without the field (an older frontend) keeps it.
            result = await self.scans.async_save_view3d(
                self.hass, "upstairs", 2.4, []
            )
            self.assertEqual(result["floor_elevation_m"], 3.91)
            self.assertEqual(result["wall_height_m"], 2.4)
            again = await self.scans.async_get_view3d(self.hass, "upstairs")
            self.assertEqual(again["floor_elevation_m"], 3.91)

            # Explicit None goes back to automatic stacking.
            result = await self.scans.async_save_view3d(
                self.hass, "upstairs", 2.4, [], floor_elevation_m=None
            )
            self.assertIsNone(result["floor_elevation_m"])

            # Other floors are untouched.
            other = await self.scans.async_get_view3d(self.hass, "ground")
            self.assertIsNone(other["floor_elevation_m"])

        self._run(run())

    def test_delete_removes_file_and_metadata(self) -> None:
        async def run() -> None:
            scan = await self.scans.async_add_scan(
                self.hass, "upstairs", "Loft", "glb", _glb()
            )
            path = Path(
                self.tmp.name,
                ".storage",
                "spatial_context",
                "scans",
                f"{scan['id']}.glb",
            )
            self.assertTrue(path.is_file())
            self.assertTrue(await self.scans.async_delete_scan(self.hass, scan["id"]))
            self.assertFalse(path.exists())
            view = await self.scans.async_get_view3d(self.hass, "upstairs")
            self.assertEqual(view["scans"], [])
            self.assertFalse(await self.scans.async_delete_scan(self.hass, scan["id"]))

        self._run(run())


if __name__ == "__main__":
    unittest.main()
