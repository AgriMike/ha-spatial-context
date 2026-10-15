import "./panel";
import { setLanguage } from "./i18n";

/** Lets the dashboard card (a separate, tiny bundle that loads this one for
 * its <floorplan-canvas>) set the language the canvas speaks. */
(window as unknown as Record<string, unknown>)["__spatialContextSetLanguage"] =
  setLanguage;
