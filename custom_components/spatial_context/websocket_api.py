"""WebSocket API for Spatial Context.

Follows the same @websocket_api.websocket_command /
@websocket_api.async_response shape used throughout voice_satellite's
__init__.py.
"""

from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from . import (
    bluetooth_mesh,
    debug,
    registry_snapshot,
    scans,
    wifi_mesh,
    zigbee_mesh,
)
from .export import async_get_map_data
from .storage import (
    async_get_floor_layout,
    async_get_property_layout,
    async_get_settings,
    async_save_floor_layout,
    async_save_property_layout,
    async_save_settings,
    async_set_floor_building_id,
)


@websocket_api.websocket_command({vol.Required("type"): "spatial_context/list_floors"})
@websocket_api.async_response
async def ws_list_floors(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """List every HA floor, annotated with whether it has a saved layout."""
    floors = await registry_snapshot.async_list_floors(hass)
    connection.send_result(msg["id"], {"floors": floors})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/get_layout",
        vol.Required("floor_id"): str,
    }
)
@websocket_api.async_response
async def ws_get_layout(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return a single floor's stored layout, or an empty skeleton."""
    layout = await async_get_floor_layout(hass, msg["floor_id"])
    connection.send_result(msg["id"], layout)


_ROOM_SCHEMA = {
    vol.Required("id"): str,
    vol.Required("name"): str,
    vol.Optional("area_id"): vol.Any(str, None),
    vol.Required("points"): [[vol.Coerce(float)]],
    # Per-room overlay styling (see floorplan-canvas.ts's .room-poly) —
    # each room's own look, not an app-wide preference. Optional/nullable
    # so an existing room with none of these set keeps today's baked-in
    # default look (frontend applies the fallback, not this schema).
    vol.Optional("fill_color"): vol.Any(vol.Match(r"^#[0-9a-fA-F]{6}$"), None),
    vol.Optional("fill_opacity"): vol.Any(vol.Coerce(float), None),
    vol.Optional("border_opacity"): vol.Any(vol.Coerce(float), None),
    vol.Optional("visible"): bool,
    # Hand-placed name label position (#33); null = automatic.
    vol.Optional("label_position"): vol.Any(
        None, vol.All([vol.Coerce(float)], vol.Length(min=2, max=2))
    ),
    # What the room's live light shading follows besides its own area:
    # other areas, other rooms on the floor, and specific light entities.
    vol.Optional("linked_area_ids"): [str],
    vol.Optional("linked_room_ids"): [str],
    vol.Optional("light_entity_ids"): [str],
    vol.Optional("excluded_light_ids"): [str],
    # An outdoor space (deck, patio): counts as outside for daylight.
    vol.Optional("outdoor"): bool,
    # Metres the room's floor sits above (+) or below (-) the rest of its
    # floor, for the 3D view: a split level's garage and entry landing
    # drawn on the main floor's plan.
    vol.Optional("floor_offset_m"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=-20, max=20))
    ),
    # The name label's look (see types.ts's Room).
    vol.Optional("show_label"): bool,
    vol.Optional("label_size"): vol.All(vol.Coerce(float), vol.Range(min=0.2, max=5)),
    vol.Optional("label_rotation"): vol.All(
        vol.Coerce(float), vol.Range(min=-360, max=360)
    ),
    vol.Optional("label_color"): vol.Any(vol.Match(r"^#[0-9a-fA-F]{6}$"), None),
    # The 3D view's finishes (see types.ts's Room): the floor's material and
    # colour, and the covering and colour of the walls facing into it.
    vol.Optional("floor_finish"): vol.Any(
        None,
        vol.In(["wood", "lato", "tile", "carpet", "concrete", "stone", "plain"]),
    ),
    vol.Optional("floor_color"): vol.Any(vol.Match(r"^#[0-9a-fA-F]{6}$"), None),
    vol.Optional("wall_finish"): vol.Any(
        None,
        vol.In(["paint", "tile", "brick", "wood", "wallpaper", "stone", "shiplap"]),
    ),
    vol.Optional("wall_color"): vol.Any(vol.Match(r"^#[0-9a-fA-F]{6}$"), None),
    # Its ceiling under the roof: vaulted (unset) or flat.
    vol.Optional("ceiling"): vol.Any(None, vol.In(["vaulted", "flat"])),
    # Its baseboards: stained like the doors (unset), white, a colour, or
    # none; their height and thickness, cm.
    vol.Optional("baseboard"): vol.Any(
        None, vol.In(["stained", "white", "paint", "none"])
    ),
    vol.Optional("baseboard_color"): vol.Any(
        None, vol.Match(r"^#[0-9a-fA-F]{6}$")
    ),
    vol.Optional("baseboard_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=1, max=60))
    ),
    vol.Optional("baseboard_thick_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0.3, max=10))
    ),
}

_PIN_SCHEMA = {
    vol.Required("id"): str,
    # The pin's whole identity — deliberately no entity_id: a human placing
    # a device never chooses or sees which HA entity represents it, only
    # the device (see types.ts's Pin doc comment). Optional/nullable: an
    # old pin saved before this field existed gets backfilled once at
    # startup (async_migrate_pin_device_ids below), but an entity that no
    # longer resolves to any device (deleted integration, orphaned
    # registry entry) legitimately has none — never guessed at.
    vol.Optional("device_id"): vol.Any(str, None),
    vol.Required("x"): vol.Coerce(float),
    vol.Required("y"): vol.Coerce(float),
    vol.Optional("room_id"): vol.Any(str, None),
    vol.Optional("icon_override"): vol.Any(str, None),
    vol.Optional("label_override"): vol.Any(str, None),
    # Mounting height in metres above floor level — matters for e.g. mmWave
    # presence sensors, where low/high placement changes the detection cone.
    vol.Optional("height_m"): vol.Any(vol.Coerce(float), None),
}

_WALL_SCHEMA = {
    vol.Required("id"): str,
    vol.Required("material"): str,
    # Optional, not Required — a wall saved before this field existed and
    # never individually re-edited since would round-trip through a save
    # without one, and that must not fail validation.
    vol.Optional("thickness_cm"): vol.Any(vol.Coerce(float), None),
    vol.Required("points"): [[vol.Coerce(float)]],
}

_OPENING_SCHEMA = {
    vol.Required("id"): str,
    vol.Required("wallId"): str,
    vol.Required("type"): vol.In(["door", "window"]),
    vol.Required("x"): vol.Coerce(float),
    vol.Required("y"): vol.Coerce(float),
    vol.Required("width"): vol.Coerce(float),
    # A cover (blind, shade, garage door) hung in this opening.
    vol.Optional("cover_entity_id"): vol.Any(str, None),
    # A second cover: then cover_entity_id is the left half, this the right.
    vol.Optional("cover_right_entity_id"): vol.Any(str, None),
    # A garage door, drawn as an overhead door rolling up with its cover.
    vol.Optional("garage"): bool,
    # A window's kind: standard, transom (high strip) or full height.
    vol.Optional("window_style"): vol.In(["standard", "transom", "full"]),
    # Its look in 3D: an outside door's style, a window's type, grid and
    # shutters, a garage door's style, and the paint on them.
    vol.Optional("door_style"): vol.Any(
        None,
        vol.In(
            [
                "slab",
                "six_panel",
                "craftsman",
                "half_lite",
                "full_lite",
                "french",
                "sliding",
                "mission",
                "barn",
                "none",
            ]
        ),
    ),
    # A door between rooms: how far it stands open (degrees, unset: wide
    # open), and its hinges and swing put on the other jamb and side.
    vol.Optional("door_open_deg"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=180))
    ),
    vol.Optional("door_hinge_flip"): bool,
    vol.Optional("door_swing_flip"): bool,
    vol.Optional("window_type"): vol.In(
        ["picture", "single_hung", "casement", "slider"]
    ),
    vol.Optional("window_grid"): vol.In(["none", "colonial", "prairie", "craftsman"]),
    vol.Optional("shutters"): bool,
    # A window's bottom above its floor and its height, metres, set by
    # hand (unset: from its style and the wall's height).
    vol.Optional("sill_m"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=10))
    ),
    vol.Optional("height_m"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0.1, max=10))
    ),
    # The casing round it indoors: white (unset) or white oak.
    vol.Optional("trim_finish"): vol.Any(
        None, vol.In(["white", "white_oak", "maple", "stained"])
    ),
    # ...and how wide it is, cm (unset: as outside): up its sides, over
    # and under it (unset: as its sides), and a bezel round its outer edge
    # (its width, cm, and colour).
    vol.Optional("trim_width_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=30))
    ),
    vol.Optional("trim_top_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=60))
    ),
    vol.Optional("trim_bottom_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=60))
    ),
    vol.Optional("trim_bezel_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=5))
    ),
    vol.Optional("trim_bezel_color"): vol.Any(None, vol.Match(r"^#[0-9a-fA-F]{6}$")),
    vol.Optional("garage_style"): vol.In(
        ["flush", "raised_short", "raised_long", "carriage", "windows", "modern"]
    ),
    vol.Optional("paint_color"): vol.Any(
        None, vol.All(str, vol.Match(r"^#[0-9a-fA-F]{6}$"))
    ),
    # Per-opening daylight fine-tuning (see types.ts's OpeningDaylight).
    vol.Optional("daylight"): {
        vol.Optional("enabled"): bool,
        vol.Optional("strength"): vol.All(vol.Coerce(float), vol.Range(min=0, max=2)),
        vol.Optional("reach"): vol.All(vol.Coerce(float), vol.Range(min=0.1, max=5)),
        vol.Optional("head_m"): vol.All(vol.Coerce(float), vol.Range(min=0.3, max=10)),
        vol.Optional("shade"): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
    },
}

# A piece of furniture/household item: a frontend catalog drawing (`kind`)
# centred at x/y (stored units) at a real-world size in centimetres.
_FURNITURE_SCHEMA = {
    vol.Required("id"): str,
    vol.Required("kind"): str,
    vol.Required("x"): vol.Coerce(float),
    vol.Required("y"): vol.Coerce(float),
    vol.Required("rotation_deg"): vol.Coerce(float),
    vol.Required("width_cm"): vol.All(vol.Coerce(float), vol.Range(min=1)),
    vol.Required("depth_cm"): vol.All(vol.Coerce(float), vol.Range(min=1)),
    vol.Required("stroke_width"): vol.All(
        vol.Coerce(float), vol.Range(min=0.1, max=20)
    ),
    vol.Optional("color"): vol.Any(vol.Match(r"^#[0-9a-fA-F]{6}$"), None),
    vol.Optional("fill"): bool,
    vol.Optional("solid"): bool,
    vol.Optional("label"): vol.Any(str, None),
    vol.Optional("show_label"): bool,
    vol.Optional("mirrored"): bool,
    vol.Optional("locked"): bool,
    vol.Optional("opacity"): vol.All(vol.Coerce(float), vol.Range(min=0.05, max=1)),
    # An HA entity the item stands for (a lamp's light, say).
    vol.Optional("entity_id"): vol.Any(str, None),
    # A second one: the down light of a two-light up & down sconce.
    vol.Optional("entity_id_2"): vol.Any(str, None),
    # An outdoor light's beam in the 3D view: its spread (degrees, narrow
    # spot to wide flood) and where it lands (metres: up the wall a ground
    # spot faces, or out from the wall a flood is on); unset = automatic.
    vol.Optional("beam_deg"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=5, max=160))
    ),
    vol.Optional("aim_m"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0.1, max=40))
    ),
    # A free-form shape's outline, as 0-1 fractions of its size.
    vol.Optional("points"): vol.All(
        [vol.All([vol.Coerce(float)], vol.Length(min=2, max=2))],
        vol.Length(max=500),
    ),
    vol.Optional("closed"): bool,
    # The 3D view's height for the item and how far above the floor it
    # stands (a wall shelf, a hung TV), centimetres; unset = the catalog's.
    vol.Optional("height_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=1, max=2000))
    ),
    vol.Optional("elevation_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=-500, max=2000))
    ),
    # A drawn shape's per-corner rounding, 0-100 % each.
    vol.Optional("corners"): vol.Any(
        None,
        vol.All(
            [vol.All(vol.Coerce(float), vol.Range(min=0, max=100))],
            vol.Length(max=500),
        ),
    ),
    # A cabinet's face: its drawers' heights from the top down (cm), and
    # how many doors fill the rest below them; unset = the catalog's.
    vol.Optional("drawers_cm"): vol.Any(
        None,
        vol.All(
            [vol.All(vol.Coerce(float), vol.Range(min=5, max=300))],
            vol.Length(max=12),
        ),
    ),
    vol.Optional("doors"): vol.Any(
        None, vol.All(vol.Coerce(int), vol.Range(min=0, max=4))
    ),
    # Which side a cabinet's door pulls are on; unset = by the doors' own
    # free edges.
    vol.Optional("handle_side"): vol.Any(None, vol.In(["left", "right"])),
    # A cabinet's pulls: bars (unset) or matte black edge pulls on the
    # fronts' top edges, how long (cm); its fronts shaker (unset) or slab.
    vol.Optional("handle_style"): vol.Any(None, vol.In(["bar", "edge"])),
    vol.Optional("handle_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=2, max=200))
    ),
    vol.Optional("front_style"): vol.Any(None, vol.In(["shaker", "slab"])),
    # A cabinet's doors in one tier or two (a top half and a bottom), and
    # whether a base cabinet has its stone top; unset = its own.
    # A crate shown with its lid off.
    vol.Optional("no_lid"): vol.Any(None, bool),
    # A glass shower door: how far it stands open (degrees, unset:
    # closed), and its hinges and swing put on the other edge and side.
    vol.Optional("door_open_deg"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=180))
    ),
    vol.Optional("door_hinge_flip"): vol.Any(None, bool),
    vol.Optional("door_swing_flip"): vol.Any(None, bool),
    vol.Optional("door_tiers"): vol.Any(
        None, vol.All(vol.Coerce(int), vol.Range(min=1, max=2))
    ),
    vol.Optional("countertop"): vol.Any(None, bool),
    # A wood finish worn instead of a plain colour (a floating shelf).
    vol.Optional("finish"): vol.Any(
        None,
        vol.In(["white_oak", "maple", "walnut", "stained", "black", "white"]),
    ),
    # A slat wall's slats: how wide each is and the gap between, cm.
    vol.Optional("slat_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0.5, max=50))
    ),
    vol.Optional("slat_gap_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=50))
    ),
    # A houseplant leaning (degrees toward its front, back if negative)
    # and its foliage spread wider from its middle (1 as grown).
    vol.Optional("lean_deg"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=-60, max=60))
    ),
    vol.Optional("foliage_spread"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0.5, max=3))
    ),
    # An open bookshelf's cubbies: their heights from the top down (cm,
    # the last filling what's left), how many across, and per cubby (row
    # by row from the top left) how full of books it is (0-1) and which
    # of its edges carry a light strip ("t", "b", "l", "r").
    vol.Optional("shelves_cm"): vol.Any(
        None,
        vol.All(
            [vol.All(vol.Coerce(float), vol.Range(min=5, max=300))],
            vol.Length(max=12),
        ),
    ),
    vol.Optional("columns"): vol.Any(
        None, vol.All(vol.Coerce(int), vol.Range(min=1, max=8))
    ),
    vol.Optional("books"): vol.Any(
        None,
        vol.All(
            [vol.All(vol.Coerce(float), vol.Range(min=0, max=1))],
            vol.Length(max=96),
        ),
    ),
    vol.Optional("strip_edges"): vol.Any(
        None,
        vol.All([vol.Match(r"^[tblr]{0,4}$")], vol.Length(max=96)),
    ),
    # ...and which way its books lean up: from the left, the right or
    # the middle ("l", "r", "c").
    vol.Optional("book_align"): vol.Any(
        None, vol.All([vol.In(["l", "c", "r"])], vol.Length(max=96))
    ),
    # A houseplant's pot (diameter in cm, shape) and how full it grows.
    vol.Optional("pot_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=3, max=300))
    ),
    # Its pot's height (cm) and colour, set apart from its width.
    vol.Optional("pot_h_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=2, max=300))
    ),
    vol.Optional("pot_color"): vol.Any(vol.Match(r"^#[0-9a-fA-F]{6}$"), None),
    vol.Optional("pot_shape"): vol.Any(
        None, vol.In(["taper", "cylinder", "bowl", "square", "none"])
    ),
    vol.Optional("fullness"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0.25, max=3))
    ),
    # How far a backsplash's tile stops short of a window or door, cm.
    # A tile wall's tiles turned a quarter round (long side up).
    vol.Optional("tile_turned"): vol.Any(None, bool),
    # ...and laid from its right end (its grout lines meeting a corner).
    vol.Optional("tile_from_right"): vol.Any(None, bool),
    vol.Optional("opening_gap_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=0, max=50))
    ),
    # How wide a climbing plant's leaves fan round its front, degrees.
    vol.Optional("leaf_spread_deg"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=10, max=360))
    ),
    # A real 3D model worn instead of the drawing (see models.py): its
    # file's id and a label (its title and credit).
    vol.Optional("model_id"): vol.Any(None, vol.Match(r"^[0-9a-f]{32}$")),
    vol.Optional("model_name"): vol.Any(None, vol.All(str, vol.Length(max=400))),
    # A vehicle model's lift and how much bigger its tyres are, both cm.
    vol.Optional("lift_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=-30, max=60))
    ),
    vol.Optional("tire_cm"): vol.Any(
        None, vol.All(vol.Coerce(float), vol.Range(min=-20, max=40))
    ),
}

_SCALE_SCHEMA = vol.Any(
    {
        vol.Required("points"): [[vol.Coerce(float)]],
        vol.Required("meters"): vol.Coerce(float),
    },
    None,
)

_MAP_BACKGROUND_SCHEMA = vol.Any(
    {
        vol.Required("lat"): vol.All(vol.Coerce(float), vol.Range(min=-90, max=90)),
        vol.Required("lon"): vol.All(vol.Coerce(float), vol.Range(min=-180, max=180)),
        vol.Required("zoom"): vol.All(vol.Coerce(float), vol.Range(min=0, max=24)),
        vol.Required("opacity"): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
        vol.Optional("style", default="street"): vol.In(["street", "aerial"]),
        vol.Optional("rotation_deg", default=0.0): vol.All(
            vol.Coerce(float), vol.Range(min=-360, max=360)
        ),
    },
    None,
)

_VIEW_BOX_SCHEMA = vol.Any(
    {
        vol.Required("x"): vol.Coerce(float),
        vol.Required("y"): vol.Coerce(float),
        vol.Required("w"): vol.Coerce(float),
        vol.Required("h"): vol.Coerce(float),
    },
    None,
)

_PLACEMENT_SCHEMA = {
    vol.Required("id"): str,
    # None for a standalone floor acting as its own building (never
    # aligned to anything, e.g. a detached Garage) — mirrors
    # FloorLayout.building_id.
    vol.Optional("building_id"): vol.Any(str, None),
    vol.Required("floor_id"): str,
    vol.Optional("label_override"): vol.Any(str, None),
    vol.Required("x"): vol.Coerce(float),
    vol.Required("y"): vol.Coerce(float),
    vol.Required("width"): vol.Coerce(float),
    vol.Required("height"): vol.Coerce(float),
    vol.Required("rotation_deg"): vol.Coerce(float),
    # width/height's locked ratio, captured from the building's traced
    # footprint at placement time (see registry_snapshot.py's
    # _content_bounds) — resize preserves this instead of letting the
    # rectangle be freely squashed/stretched away from the real shape.
    vol.Required("aspect_ratio"): vol.Coerce(float),
    # The floor-plan box this rectangle maps onto (see storage.py's
    # _empty_property) — null when the building had nothing traced yet.
    vol.Optional("source_bounds"): vol.Any(
        {
            vol.Required("min_x"): vol.Coerce(float),
            vol.Required("min_y"): vol.Coerce(float),
            vol.Required("max_x"): vol.Coerce(float),
            vol.Required("max_y"): vol.Coerce(float),
        },
        None,
    ),
}


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/save_layout",
        vol.Required("floor_id"): str,
        vol.Required("background_image_id"): vol.Any(str, None),
        vol.Required("background_opacity"): vol.Coerce(float),
        vol.Required("background_offset_x"): vol.Coerce(float),
        vol.Required("background_offset_y"): vol.Coerce(float),
        vol.Required("background_scale"): vol.Coerce(float),
        vol.Required("building_id"): vol.Any(str, None),
        vol.Required("view_box"): _VIEW_BOX_SCHEMA,
        vol.Required("rooms"): [_ROOM_SCHEMA],
        vol.Required("pins"): [_PIN_SCHEMA],
        vol.Required("walls"): [_WALL_SCHEMA],
        vol.Required("openings"): [_OPENING_SCHEMA],
        # Optional so a panel older than furniture can still save.
        vol.Optional("furniture", default=list): [_FURNITURE_SCHEMA],
        vol.Optional("north_deg", default=None): vol.Any(
            None, vol.All(vol.Coerce(float), vol.Range(min=0, max=360))
        ),
        vol.Required("scale"): _SCALE_SCHEMA,
    }
)
@websocket_api.async_response
async def ws_save_layout(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Full replace-save a single floor's layout."""
    wall_ids = {wall["id"] for wall in msg["walls"]}
    layout = {
        "background_image_id": msg["background_image_id"],
        "background_opacity": msg["background_opacity"],
        "background_offset_x": msg["background_offset_x"],
        "background_offset_y": msg["background_offset_y"],
        "background_scale": msg["background_scale"],
        "building_id": msg["building_id"],
        "view_box": msg["view_box"],
        "rooms": msg["rooms"],
        "pins": msg["pins"],
        "walls": msg["walls"],
        # Drop any opening whose wall was deleted in this same save.
        "openings": [o for o in msg["openings"] if o["wallId"] in wall_ids],
        "furniture": msg["furniture"],
        "north_deg": msg["north_deg"],
        "scale": msg["scale"],
    }
    await async_save_floor_layout(hass, msg["floor_id"], layout)
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/set_building_id",
        vol.Required("floor_id"): str,
        vol.Required("building_id"): vol.Any(str, None),
    }
)
@websocket_api.async_response
async def ws_set_building_id(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Tag a floor as sharing a building/coordinate-system with another
    (see Align Floors, panel.ts's _onAlignApply) without touching the rest
    of its layout."""
    await async_set_floor_building_id(hass, msg["floor_id"], msg["building_id"])
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {vol.Required("type"): "spatial_context/get_property_layout"}
)
@websocket_api.async_response
async def ws_get_property_layout(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return the whole-property layout (background photo + building
    placements — see the Property tab), or an empty skeleton."""
    layout = await async_get_property_layout(hass)
    connection.send_result(msg["id"], layout)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/save_property_layout",
        vol.Required("background_image_id"): vol.Any(str, None),
        vol.Required("background_opacity"): vol.Coerce(float),
        vol.Required("background_offset_x"): vol.Coerce(float),
        vol.Required("background_offset_y"): vol.Coerce(float),
        vol.Required("background_scale"): vol.Coerce(float),
        vol.Required("view_box"): _VIEW_BOX_SCHEMA,
        vol.Required("placements"): [_PLACEMENT_SCHEMA],
        # Outdoor device pins — Optional so an older panel bundle's save
        # (which never sends them) still validates.
        vol.Optional("pins"): [_PIN_SCHEMA],
        # Likewise Optional: an older bundle never sends the map.
        vol.Optional("map_background"): _MAP_BACKGROUND_SCHEMA,
    }
)
@websocket_api.async_response
async def ws_save_property_layout(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Full replace-save of the whole-property layout."""
    stored = await async_get_property_layout(hass)
    # An older panel bundle knows neither outdoor pins nor source_bounds —
    # keep the stored ones rather than wiping them (a dropped source_bounds
    # would be recomputed from today's footprint, not the one it was
    # fitted to).
    pins = msg["pins"] if "pins" in msg else stored.get("pins", [])
    stored_bounds = {
        p["id"]: p.get("source_bounds") for p in stored.get("placements", [])
    }
    for placement in msg["placements"]:
        if "source_bounds" not in placement and placement["id"] in stored_bounds:
            placement["source_bounds"] = stored_bounds[placement["id"]]
    layout = {
        "background_image_id": msg["background_image_id"],
        "background_opacity": msg["background_opacity"],
        "background_offset_x": msg["background_offset_x"],
        "background_offset_y": msg["background_offset_y"],
        "background_scale": msg["background_scale"],
        "view_box": msg["view_box"],
        "placements": msg["placements"],
        "pins": pins,
        "map_background": (
            msg["map_background"]
            if "map_background" in msg
            else stored.get("map_background")
        ),
    }
    await async_save_property_layout(hass, layout)
    connection.send_result(msg["id"], {"success": True})


_SETTINGS_SCHEMA = {
    vol.Required("unit_system"): vol.In(["metric", "imperial"]),
    vol.Required("zigbee_timeout_seconds"): vol.All(
        vol.Coerce(int), vol.Range(min=30, max=600)
    ),
    # Optional (with the storage.py defaults) so a panel bundle older than
    # these fields can still save the rest of its settings.
    vol.Optional("floor_order", default="top_down"): vol.In(
        ["top_down", "ground_up"]
    ),
    vol.Optional("zigbee_coordinator_device_id", default=None): vol.Any(
        None, str
    ),
    vol.Optional("auto_save", default=True): bool,
    vol.Optional("debug_logging", default=False): bool,
    vol.Optional("weather_entity_id", default=None): vol.Any(None, str),
    vol.Optional("show_light_count", default=True): bool,
    vol.Optional("room_border_show", default=True): bool,
    vol.Optional("room_border_color", default=None): vol.Any(
        None, vol.Match(r"^#[0-9a-fA-F]{6}$")
    ),
    vol.Optional("room_border_width", default=2.0): vol.All(
        vol.Coerce(float), vol.Range(min=0.25, max=12)
    ),
    vol.Optional("room_border_opacity", default=1.0): vol.All(
        vol.Coerce(float), vol.Range(min=0, max=1)
    ),
    vol.Optional("room_label_size", default=16.0): vol.All(
        vol.Coerce(float), vol.Range(min=4, max=80)
    ),
    vol.Optional("room_label_color", default=None): vol.Any(
        None, vol.Match(r"^#[0-9a-fA-F]{6}$")
    ),
    vol.Optional("room_label_bold", default=False): bool,
    vol.Optional("room_label_halo", default=True): bool,
    vol.Optional("room_label_halo_width", default=3.0): vol.All(
        vol.Coerce(float), vol.Range(min=0, max=12)
    ),
    vol.Optional("room_label_halo_color", default=None): vol.Any(
        None, vol.Match(r"^#[0-9a-fA-F]{6}$")
    ),
    vol.Optional("room_fill_under_background", default=False): bool,
    vol.Optional("show_scale_line", default=True): bool,
    vol.Optional("custom_icons", default=list): vol.All(
        [
            vol.Schema(
                {
                    vol.Required("id"): vol.All(str, vol.Length(min=1, max=40)),
                    vol.Required("name"): vol.All(str, vol.Length(max=120)),
                    vol.Required("svg"): vol.All(str, vol.Length(max=300_000)),
                    vol.Required("w"): vol.All(
                        vol.Coerce(float), vol.Range(min=1, max=5000)
                    ),
                    vol.Required("d"): vol.All(
                        vol.Coerce(float), vol.Range(min=1, max=5000)
                    ),
                    vol.Optional("colors", default=False): bool,
                }
            )
        ],
        vol.Length(max=200),
    ),
}


@websocket_api.websocket_command({vol.Required("type"): "spatial_context/get_settings"})
@websocket_api.async_response
async def ws_get_settings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return app-wide settings (currently just unit_system), shared by
    every viewer of the panel — see storage.py's async_get_settings."""
    settings = await async_get_settings(hass)
    connection.send_result(msg["id"], settings)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/save_settings",
        **_SETTINGS_SCHEMA,
    }
)
@websocket_api.async_response
async def ws_save_settings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Replace-save app-wide settings."""
    # Every schema key (a vol.Required/Optional marker; `.schema` is its
    # name) — Optional ones are always present, filled from their default.
    await async_save_settings(
        hass, {key.schema: msg[key.schema] for key in _SETTINGS_SCHEMA}
    )
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/get_view3d",
        vol.Required("floor_id"): str,
    }
)
@websocket_api.async_response
async def ws_get_view3d(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """A floor's 3D view settings and room scans (see scans.py)."""
    connection.send_result(
        msg["id"], await scans.async_get_view3d(hass, msg["floor_id"])
    )


_SCAN_SCHEMA = {
    vol.Required("id"): str,
    vol.Optional("name"): vol.All(str, vol.Length(max=120)),
    vol.Optional("x"): vol.Any(None, vol.Coerce(float)),
    vol.Optional("y"): vol.Any(None, vol.Coerce(float)),
    vol.Optional("elevation_m"): vol.All(vol.Coerce(float), vol.Range(min=-50, max=50)),
    vol.Optional("rotation_deg"): vol.All(
        vol.Coerce(float), vol.Range(min=-720, max=720)
    ),
    vol.Optional("scale"): vol.All(vol.Coerce(float), vol.Range(min=0.01, max=100)),
    vol.Optional("visible"): bool,
    vol.Optional("opacity"): vol.All(vol.Coerce(float), vol.Range(min=0, max=1)),
    vol.Optional("hide_walls"): bool,
}


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/save_view3d",
        vol.Required("floor_id"): str,
        vol.Required("wall_height_m"): vol.Any(
            None, vol.All(vol.Coerce(float), vol.Range(min=1, max=10))
        ),
        # Left out by an older frontend: the stored elevation is kept.
        vol.Optional("floor_elevation_m"): vol.Any(
            None, vol.All(vol.Coerce(float), vol.Range(min=-50, max=100))
        ),
        vol.Required("scans"): [vol.Schema(_SCAN_SCHEMA, extra=vol.REMOVE_EXTRA)],
    }
)
@websocket_api.async_response
async def ws_save_view3d(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Update a floor's wall height, elevation and its scans' placement
    and look."""
    extra = (
        {"floor_elevation_m": msg["floor_elevation_m"]}
        if "floor_elevation_m" in msg
        else {}
    )
    result = await scans.async_save_view3d(
        hass, msg["floor_id"], msg["wall_height_m"], msg["scans"], **extra
    )
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/save_ground",
        vol.Required("floor_ids"): vol.All([str], vol.Length(min=1, max=50)),
        vol.Required("ground"): vol.Any(
            None,
            {
                vol.Required("uphill_m"): vol.All(
                    vol.Coerce(float), vol.Range(min=-50, max=100)
                ),
                vol.Required("downhill_m"): vol.All(
                    vol.Coerce(float), vol.Range(min=-50, max=100)
                ),
                vol.Required("downhill_deg"): vol.All(
                    vol.Coerce(float), vol.Range(min=0, max=360)
                ),
                # Grading over the site: a grid of raised (or lowered)
                # points, metres on the floor plane (see the frontend's
                # view3d/ground-grid.ts).
                vol.Optional("grid"): vol.Any(
                    None,
                    {
                        vol.Required("x0"): vol.Coerce(float),
                        vol.Required("z0"): vol.Coerce(float),
                        vol.Required("step"): vol.All(
                            vol.Coerce(float), vol.Range(min=0.1, max=20)
                        ),
                        vol.Required("cols"): vol.All(
                            int, vol.Range(min=1, max=240)
                        ),
                        vol.Required("rows"): vol.All(
                            int, vol.Range(min=1, max=240)
                        ),
                        vol.Required("h"): vol.All(
                            [vol.All(vol.Coerce(float), vol.Range(min=-50, max=50))],
                            vol.Length(max=240 * 240),
                        ),
                    },
                ),
            },
        ),
    }
)
@websocket_api.async_response
async def ws_save_ground(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Set the ground around a building (its grade on the high and low
    sides) on each of its floors."""
    await scans.async_save_ground(hass, msg["floor_ids"], msg["ground"])
    connection.send_result(msg["id"], {"success": True})


_ROOF_END = vol.In(["gable", "hip", "open"])
_ROOF_HEIGHT = vol.All(vol.Coerce(float), vol.Range(min=-50, max=200))
_ROOF_PART_SCHEMA = vol.Schema(
    {
        vol.Optional("name"): vol.All(str, vol.Length(max=100)),
        vol.Required("x0"): vol.Coerce(float),
        vol.Required("y0"): vol.Coerce(float),
        vol.Required("x1"): vol.Coerce(float),
        vol.Required("y1"): vol.Coerce(float),
        vol.Required("ridge"): vol.In(["x", "y"]),
        vol.Required("eave"): vol.Any(
            _ROOF_HEIGHT, vol.All([_ROOF_HEIGHT], vol.Length(min=2, max=2))
        ),
        vol.Required("pitch"): vol.All(vol.Coerce(float), vol.Range(min=0.05, max=4)),
        # A hipped end's own pitch, when it differs from the sides'.
        vol.Optional("hip_pitch"): vol.All(
            vol.Coerce(float), vol.Range(min=0.05, max=4)
        ),
        vol.Optional("ends"): vol.All([_ROOF_END], vol.Length(min=2, max=2)),
        vol.Optional("overhang"): vol.All(
            vol.Coerce(float), vol.Range(min=0, max=3)
        ),
        vol.Optional("base"): _ROOF_HEIGHT,
        vol.Optional("gable"): vol.In(["siding", "shake"]),
    },
    extra=vol.REMOVE_EXTRA,
)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/save_roof",
        vol.Required("floor_ids"): vol.All([str], vol.Length(min=1, max=50)),
        vol.Required("roof"): vol.Any(
            None,
            {
                vol.Required("parts"): vol.All(
                    [_ROOF_PART_SCHEMA], vol.Length(max=100)
                ),
                # Light strips along the roof's edges facing some sides
                # (permanent outdoor lights), each shown as its light.
                vol.Optional("lights"): vol.All(
                    [
                        vol.Schema(
                            {
                                vol.Required("entity_id"): vol.Any(str, None),
                                vol.Required("sides"): vol.All(
                                    [vol.In(["n", "e", "s", "w"])],
                                    vol.Length(max=4),
                                ),
                                vol.Optional("spacing_in"): vol.All(
                                    vol.Coerce(float), vol.Range(min=0.5, max=48)
                                ),
                                # Edges lit besides the sides' and ones
                                # left dark (keys from the frontend).
                                vol.Optional("edges"): vol.All(
                                    [vol.All(str, vol.Length(max=200))],
                                    vol.Length(max=200),
                                ),
                                vol.Optional("skip"): vol.All(
                                    [vol.All(str, vol.Length(max=200))],
                                    vol.Length(max=200),
                                ),
                                # LED colours in turn, repeating.
                                vol.Optional("pattern"): vol.All(
                                    [vol.Match(r"^#[0-9a-fA-F]{6}$")],
                                    vol.Length(max=64),
                                ),
                                # Patterns by scene (the last activated
                                # one's shows).
                                vol.Optional("scenes"): vol.All(
                                    [
                                        vol.Schema(
                                            {
                                                vol.Required("scene"): vol.All(
                                                    str, vol.Length(max=255)
                                                ),
                                                vol.Required("pattern"): vol.All(
                                                    [
                                                        vol.Match(
                                                            r"^#[0-9a-fA-F]{6}$"
                                                        )
                                                    ],
                                                    vol.Length(max=64),
                                                ),
                                            },
                                            extra=vol.REMOVE_EXTRA,
                                        )
                                    ],
                                    vol.Length(max=100),
                                ),
                            },
                            extra=vol.REMOVE_EXTRA,
                        )
                    ],
                    vol.Length(max=20),
                ),
            },
        ),
    }
)
@websocket_api.async_response
async def ws_save_roof(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Set a building's roof (explicit parts, or None for the automatic
    one) on each of its floors."""
    await scans.async_save_roof(hass, msg["floor_ids"], msg["roof"])
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/delete_scan",
        vol.Required("scan_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete_scan(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Delete a room scan's file and metadata."""
    removed = await scans.async_delete_scan(hass, msg["scan_id"])
    connection.send_result(msg["id"], {"success": removed})


@websocket_api.websocket_command({vol.Required("type"): "spatial_context/list_areas"})
@websocket_api.async_response
async def ws_list_areas(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """List every HA area, for the room-tracing area picker."""
    connection.send_result(msg["id"], {"areas": registry_snapshot.async_list_areas(hass)})


@websocket_api.websocket_command(
    {vol.Required("type"): "spatial_context/list_placeable_entities"}
)
@websocket_api.async_response
async def ws_list_placeable_entities(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return every enabled entity, joined with device/area for display."""
    entities = await registry_snapshot.async_list_placeable_entities(hass)
    connection.send_result(msg["id"], {"entities": entities})


@websocket_api.websocket_command(
    {vol.Required("type"): "spatial_context/export_snapshot"}
)
@websocket_api.async_response
async def ws_export_snapshot(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Denormalized export: floors -> rooms -> devices, for a download.

    Every device carries both its raw stored x/y and, when the floor has
    been calibrated (see `scale`/`meters_per_unit`), real-world x_m/y_m and
    height_m — enough for a consumer to compute actual distances between
    devices without needing to know anything about the editor's internal
    coordinate space.
    """
    connection.send_result(
        msg["id"],
        await async_get_map_data(hass),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/get_zigbee_mesh",
        vol.Optional("force_refresh", default=False): bool,
        vol.Optional("cache_only", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_get_zigbee_mesh(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Live Zigbee2MQTT network topology (see zigbee_mesh.py).

    Global/floor-agnostic, like list_areas/list_placeable_entities — the
    frontend cross-references against the current floor's placed pins.
    A cache hit (force_refresh=False, the default) returns near-instantly;
    a real scan (force_refresh=True, or no cache yet) can take 1-2 minutes
    or more on a large mesh — the frontend only ever passes force_refresh
    on an explicit user "Refresh Mesh" click, never on panel load.
    cache_only=True returns the cached result or null, never scanning —
    what the panel sends the moment the Zigbee layer is picked.
    """
    if msg["cache_only"]:
        connection.send_result(msg["id"], zigbee_mesh.get_cached_network_map(hass))
        return
    try:
        mesh = await zigbee_mesh.async_get_network_map(
            hass, force_refresh=msg["force_refresh"]
        )
    except Exception as err:  # noqa: BLE001 - surface any failure to the frontend, not an unhandled rejection
        connection.send_error(msg["id"], "zigbee_mesh_failed", str(err))
        return
    connection.send_result(msg["id"], mesh)


@websocket_api.websocket_command({vol.Required("type"): "spatial_context/get_wifi_mesh"})
@websocket_api.async_response
async def ws_get_wifi_mesh(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Wi-Fi client→AP associations, read from entity states (see wifi_mesh.py).

    Best-effort — produces an empty link list for anyone without an
    integration that exposes `ap_mac` on its device_tracker states, not an
    error. Cheap (no network round-trip), unlike the Zigbee equivalent.
    """
    try:
        mesh = wifi_mesh.async_get_wifi_mesh(hass)
    except Exception as err:  # noqa: BLE001 - surface any failure to the frontend, not an unhandled rejection
        connection.send_error(msg["id"], "wifi_mesh_failed", str(err))
        return
    connection.send_result(msg["id"], mesh)


@websocket_api.websocket_command(
    {vol.Required("type"): "spatial_context/get_bluetooth_devices"}
)
@callback
def ws_get_bluetooth_devices(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Bluetooth address → device candidates for the Bluetooth layer (see
    bluetooth_mesh.py). The links themselves come from HA core's own
    bluetooth/subscribe_advertisements, subscribed by the panel."""
    connection.send_result(msg["id"], bluetooth_mesh.async_get_bluetooth_devices(hass))


@websocket_api.websocket_command({vol.Required("type"): "spatial_context/version"})
@websocket_api.async_response
async def ws_version(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """The backend HA is running vs. what's installed, and the installed
    panel's build id — so the panel can ask for a reload or a restart (see
    debug.py)."""
    connection.send_result(msg["id"], await debug.async_get_version_info(hass))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "spatial_context/debug_log",
        vol.Required("entries"): vol.All(
            [{vol.Required("event"): str, vol.Optional("t"): str, vol.Extra: object}],
            vol.Length(max=200),
        ),
    }
)
@websocket_api.async_response
async def ws_debug_log(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Append panel events to the debug log (a no-op unless enabled)."""
    await debug.async_append_debug_entries(hass, msg["entries"])
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command({vol.Required("type"): "spatial_context/debug_report"})
@websocket_api.async_response
async def ws_debug_report(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Versions, settings, layout counts and the debug log's tail — safe to
    attach to a public issue (see debug.py)."""
    connection.send_result(msg["id"], await debug.async_build_debug_report(hass))


def async_register_commands(hass: HomeAssistant) -> None:
    """Register every Spatial Context WebSocket command."""
    websocket_api.async_register_command(hass, ws_list_floors)
    websocket_api.async_register_command(hass, ws_get_layout)
    websocket_api.async_register_command(hass, ws_save_layout)
    websocket_api.async_register_command(hass, ws_set_building_id)
    websocket_api.async_register_command(hass, ws_get_property_layout)
    websocket_api.async_register_command(hass, ws_save_property_layout)
    websocket_api.async_register_command(hass, ws_get_settings)
    websocket_api.async_register_command(hass, ws_save_settings)
    websocket_api.async_register_command(hass, ws_get_view3d)
    websocket_api.async_register_command(hass, ws_save_view3d)
    websocket_api.async_register_command(hass, ws_save_ground)
    websocket_api.async_register_command(hass, ws_save_roof)
    websocket_api.async_register_command(hass, ws_delete_scan)
    websocket_api.async_register_command(hass, ws_list_areas)
    websocket_api.async_register_command(hass, ws_list_placeable_entities)
    websocket_api.async_register_command(hass, ws_export_snapshot)
    websocket_api.async_register_command(hass, ws_get_zigbee_mesh)
    websocket_api.async_register_command(hass, ws_get_wifi_mesh)
    websocket_api.async_register_command(hass, ws_get_bluetooth_devices)
    websocket_api.async_register_command(hass, ws_version)
    websocket_api.async_register_command(hass, ws_debug_log)
    websocket_api.async_register_command(hass, ws_debug_report)
