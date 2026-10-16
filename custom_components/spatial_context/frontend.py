"""Frontend static path, sidebar panel and dashboard card registration
for Spatial Context.

Mirrors voice_satellite/frontend.py's sidebar-panel half (the
"browser_mod pattern"). The dashboard card (custom:spatial-context-card) is
added to every frontend page with add_extra_js_url, so it needs no manual
Lovelace resource.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from homeassistant.components.frontend import (
    add_extra_js_url,
    async_register_built_in_panel,
)
from aiohttp import web

from homeassistant.components.http import HomeAssistantView, StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    CARD_FILENAME,
    FRONTEND_URL_PATH,
    PANEL_FILENAME,
    SIDEBAR_ICON,
    SIDEBAR_TITLE,
    URL_BASE,
)

_LOGGER = logging.getLogger(__name__)

WWW_DIR = Path(__file__).parent / "www"


def _cache_bust_token(filename: str) -> str:
    """Derive a cache-busting query token from a served file's contents.

    Deliberately not a hand-maintained version constant — a forgotten bump
    there means a browser keeps serving a stale panel after every redeploy
    (this bit us once already). Nor the file's mtime: HACS installs keep
    the archive's timestamps, so a new build could keep the old token and
    browsers (and HA's service worker) kept running the old card. A hash
    of the bytes changes exactly when the build does.
    """
    try:
        data = (WWW_DIR / filename).read_bytes()
    except OSError:
        return "0"
    return hashlib.sha1(data, usedforsecurity=False).hexdigest()[:12]


def cache_bust_tokens() -> tuple[str, str]:
    """The panel's and the card's tokens. Reads both bundles, so it runs in
    the executor (see __init__.py)."""
    return _cache_bust_token(PANEL_FILENAME), _cache_bust_token(CARD_FILENAME)


# The panel bundle's own URL — outside URL_BASE's static path, so it can be
# served with `Cache-Control: no-cache` (see PanelBundleView).
PANEL_URL = f"{URL_BASE}_panel.js"


class PanelBundleView(HomeAssistantView):
    """Serves the panel bundle with `Cache-Control: no-cache`.

    The registered panel URL only changes at startup (its ?v= token), and
    without cache headers a browser — Safari especially — may reuse a stale
    copy indefinitely after the file is updated in place. no-cache keeps
    caching but revalidates every load (a cheap 304 via ETag/Last-Modified),
    so an updated bundle is always picked up.
    """

    url = PANEL_URL
    name = "spatial_context:panel_bundle"
    # Loaded by the frontend as a plain module import, which carries no
    # auth header — same as the static path it replaces.
    requires_auth = False

    async def get(self, request: web.Request) -> web.FileResponse:
        return web.FileResponse(
            WWW_DIR / PANEL_FILENAME, headers={"Cache-Control": "no-cache"}
        )


async def async_register_static_paths(hass: HomeAssistant) -> None:
    """Register /spatial_context/* as a static HTTP path serving www/."""
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(WWW_DIR), False)]
        )
        _LOGGER.debug("Static path registered: %s", URL_BASE)
    except RuntimeError:
        _LOGGER.debug("Static path already registered: %s", URL_BASE)
    hass.http.register_view(PanelBundleView())


def async_register_sidebar_panel(hass: HomeAssistant, token: str) -> None:
    """Register the Spatial Context sidebar panel (browser_mod pattern)."""
    panel_url = f"{PANEL_URL}?v={token}"

    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=SIDEBAR_TITLE,
        sidebar_icon=SIDEBAR_ICON,
        frontend_url_path=FRONTEND_URL_PATH,
        require_admin=False,
        config={
            "_panel_custom": {
                "name": "spatial-context-panel",
                "js_url": panel_url,
            }
        },
    )
    _LOGGER.debug("Spatial Context sidebar panel registered")


def async_register_card(hass: HomeAssistant, token: str) -> None:
    """Load the dashboard card's script on every frontend page, so
    `type: custom:spatial-context-card` works without adding a resource."""
    add_extra_js_url(hass, f"{URL_BASE}/{CARD_FILENAME}?v={token}")
    _LOGGER.debug("Spatial Context dashboard card registered")
