"""Export data helpers for Spatial Context."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from homeassistant.core import HomeAssistant

from . import registry_snapshot
from .storage import (
    async_get_all_layouts,
    async_get_floor_layout,
    async_get_property_layout,
    live_layouts,
    live_placements,
    meters_per_unit,
    property_meters_per_unit,
)

# Mirrors frontend/src/canvas/materials.ts — keep both in sync if this list
# changes. attenuation_db_per_cm is an approximate 2.4GHz RF signal loss
# *per centimetre* of that material — a wall's total attenuation is that
# rate times its actual thickness_cm (see _wall_attenuation_db), not a
# single flat number, since a thicker wall of the same material blocks
# more. default_thickness_cm is only the fallback for a wall saved before
# thickness_cm existed at all.
_WALL_MATERIALS = {
    "timber_frame": {
        "label": "Timber framed (drywall)",
        "attenuation_db_per_cm": 0.3,
        "default_thickness_cm": 10,
    },
    "brick_veneer": {
        "label": "Brick veneer",
        "attenuation_db_per_cm": 0.55,
        "default_thickness_cm": 11,
    },
    "concrete_block": {
        "label": "Concrete / block",
        "attenuation_db_per_cm": 0.6,
        "default_thickness_cm": 20,
    },
    "aerated_concrete_block": {
        "label": "Aerated/foam concrete block (plastered)",
        "attenuation_db_per_cm": 0.37,
        "default_thickness_cm": 13,
    },
    "ceramic_poroton_block": {
        "label": "Ceramic / Poroton block",
        "attenuation_db_per_cm": 0.42,
        "default_thickness_cm": 25,
    },
    "glass": {
        "label": "Glass",
        "attenuation_db_per_cm": 2,
        "default_thickness_cm": 1,
    },
    "steel_frame": {
        "label": "Steel frame",
        "attenuation_db_per_cm": 1,
        "default_thickness_cm": 10,
    },
}
_DEFAULT_WALL_MATERIAL = "timber_frame"


def _wall_thickness_cm(wall: dict) -> float:
    """A wall's effective thickness — its own stored value, or its
    material's default when missing (a wall saved before thickness_cm
    existed)."""
    material = _WALL_MATERIALS.get(
        wall.get("material", _DEFAULT_WALL_MATERIAL),
        _WALL_MATERIALS[_DEFAULT_WALL_MATERIAL],
    )
    return wall.get("thickness_cm") or material["default_thickness_cm"]


def _wall_attenuation_db(wall: dict) -> float:
    material = _WALL_MATERIALS.get(
        wall.get("material", _DEFAULT_WALL_MATERIAL),
        _WALL_MATERIALS[_DEFAULT_WALL_MATERIAL],
    )
    return material["attenuation_db_per_cm"] * _wall_thickness_cm(wall)


async def async_get_map_data(hass: HomeAssistant) -> dict[str, Any]:
    """Denormalized export: floors -> rooms -> devices, plus outdoor
    devices placed on the Property tab.

    Every device carries both its raw stored x/y and, when the floor has
    been calibrated (see `scale`/`meters_per_unit`), real-world x_m/y_m and
    height_m — enough for a consumer to compute actual distances between
    devices without needing to know anything about the editor's internal
    coordinate space.
    """
    floors_meta = await registry_snapshot.async_list_floors(hass)
    placeable_entities = await registry_snapshot.async_list_placeable_entities(hass)

    exported_floors = []
    for floor_meta in floors_meta:
        layout = await async_get_floor_layout(hass, floor_meta["floor_id"])
        floor_mpu = meters_per_unit(layout.get("scale"))

        rooms_by_id = {room["id"]: room for room in layout["rooms"]}
        room_devices: dict[str | None, list[dict]] = {
            room_id: [] for room_id in rooms_by_id
        }
        room_devices[None] = []

        for pin in layout.get("pins", []):
            device = _export_device(pin, placeable_entities, floor_mpu)
            room_devices.setdefault(pin.get("room_id"), []).append(device)

        exported_rooms = [
            {
                "id": room["id"],
                "name": room["name"],
                "area_id": room.get("area_id"),
                # What the room's live light shading follows (see
                # types.ts's Room) — besides its own area_id.
                "linked_area_ids": room.get("linked_area_ids", []),
                "linked_room_ids": room.get("linked_room_ids", []),
                "light_entity_ids": room.get("light_entity_ids", []),
                "outdoor": room.get("outdoor", False),
                "devices": room_devices.get(room["id"], []),
            }
            for room in layout.get("rooms", [])
        ]
        unplaced = room_devices.get(None, [])
        if unplaced:
            exported_rooms.append({"id": None, "name": "Unassigned", "devices": unplaced})

        openings_by_wall: dict[str, list[dict]] = {}
        for opening in layout.get("openings", []):
            openings_by_wall.setdefault(opening["wallId"], []).append(
                {
                    "type": opening["type"],
                    "x": opening["x"],
                    "y": opening["y"],
                    "width": opening["width"],
                    "x_m": opening["x"] * floor_mpu if floor_mpu else None,
                    "y_m": opening["y"] * floor_mpu if floor_mpu else None,
                    "width_m": opening["width"] * floor_mpu if floor_mpu else None,
                    "cover_entity_id": opening.get("cover_entity_id"),
                    "cover_right_entity_id": opening.get("cover_right_entity_id"),
                    "garage": opening.get("garage", False),
                }
            )

        exported_walls = [
            {
                "id": wall["id"],
                "material": wall.get("material", _DEFAULT_WALL_MATERIAL),
                "material_label": _WALL_MATERIALS.get(
                    wall.get("material", _DEFAULT_WALL_MATERIAL),
                    _WALL_MATERIALS[_DEFAULT_WALL_MATERIAL],
                )["label"],
                "thickness_cm": _wall_thickness_cm(wall),
                "attenuation_db": _wall_attenuation_db(wall),
                "points": wall["points"],
                "points_m": (
                    [[px * floor_mpu, py * floor_mpu] for px, py in wall["points"]]
                    if floor_mpu
                    else None
                ),
                "openings": openings_by_wall.get(wall["id"], []),
            }
            for wall in layout.get("walls", [])
        ]

        exported_floors.append(
            {
                "floor_id": floor_meta["floor_id"],
                "name": floor_meta["name"],
                "meters_per_unit": floor_mpu,
                # Compass bearing the plan's +y-up direction faces (0 = north).
                "north_deg": layout.get("north_deg"),
                "rooms": exported_rooms,
                "walls": exported_walls,
                "furniture": [
                    _export_furniture(item, layout.get("rooms", []), floor_mpu)
                    for item in layout.get("furniture", [])
                ],
            }
        )

    # Placed on the Property tab's site photo rather than any floor (garden
    # lights, say). x/y are site-photo units; x_m/y_m come from the scale
    # of a placed, calibrated building (see property_meters_per_unit).
    property_layout = await async_get_property_layout(hass)
    floors = live_layouts(
        await async_get_all_layouts(hass), {f["floor_id"] for f in floors_meta}
    )
    property_mpu = property_meters_per_unit(
        floors, live_placements(floors, property_layout.get("placements", []))
    )
    outdoor_devices = [
        _export_device(pin, placeable_entities, property_mpu)
        for pin in property_layout.get("pins", [])
    ]

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "floors": exported_floors,
        "property_meters_per_unit": property_mpu,
        "outdoor_devices": outdoor_devices,
    }


def _point_in_polygon(x: float, y: float, points: list) -> bool:
    inside = False
    j = len(points) - 1
    for i, (xi, yi) in enumerate(points):
        xj, yj = points[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def _export_furniture(item: dict, rooms: list, mpu: float | None) -> dict:
    """A furniture/household item with the room it stands in. `kind` is the
    frontend catalog id; `label` the user's own name for it, if any."""
    room = next(
        (
            r
            for r in rooms
            if len(r.get("points", [])) >= 3
            and _point_in_polygon(item["x"], item["y"], r["points"])
        ),
        None,
    )
    return {
        "kind": item["kind"],
        "label": item.get("label"),
        "room_id": room["id"] if room else None,
        "room_name": room["name"] if room else None,
        "x": item["x"],
        "y": item["y"],
        "x_m": item["x"] * mpu if mpu else None,
        "y_m": item["y"] * mpu if mpu else None,
        "rotation_deg": item["rotation_deg"],
        "width_cm": item["width_cm"],
        "depth_cm": item["depth_cm"],
        "entity_id": item.get("entity_id"),
    }


def _export_device(
    pin: dict[str, Any],
    placeable_entities: list[dict[str, Any]],
    meters_per_unit: float | None,
) -> dict[str, Any]:
    """One placed device for the export.

    The export is explicitly AI-agent-facing context (unlike the UI, which
    a human uses and which never surfaces entity_id at all — see types.ts's
    Pin doc comment) — so entity_id/domain are still worth including here,
    derived fresh from device_id via the same automatic ranking the UI's
    icon uses, rather than a stored choice.
    """
    device_id = pin.get("device_id")
    entity = registry_snapshot.pick_display_entity(device_id, placeable_entities)
    return {
        "device_id": device_id,
        "entity_id": entity["entity_id"] if entity else None,
        "name": pin.get("label_override")
        or (entity["name"] if entity else "Unknown device"),
        "domain": entity["domain"] if entity else None,
        "device_class": entity["device_class"] if entity else None,
        "area_name": entity["area_name"] if entity else None,
        "x": pin["x"],
        "y": pin["y"],
        "x_m": pin["x"] * meters_per_unit if meters_per_unit else None,
        "y_m": pin["y"] * meters_per_unit if meters_per_unit else None,
        "height_m": pin.get("height_m"),
    }
