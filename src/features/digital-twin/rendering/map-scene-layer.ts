import type { Object3D } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { DigitalTwinMapTheme } from "../map-themes";
import type { MapVisualTuning } from "./map-visual-tuning";

/** Common lifecycle boundary for every independently owned Three.js map layer. */
export interface MapSceneLayer {
  readonly root: Object3D;
  dispose(): void;
}

/**
 * CSS2D elements live outside the WebGL scene. The `hidden` attribute alone is
 * insufficient because component styles can assign `display`, so suspension
 * also needs an inline important display guard.
 */
export function setExternalPresentationElementVisible(
  element: HTMLElement,
  visible: boolean,
) {
  element.hidden = !visible;
  if (visible) {
    element.style.removeProperty("display");
  } else {
    element.style.setProperty("display", "none", "important");
  }
}

/**
 * CSS2DRenderer owns DOM outside the Three.js graph and does not propagate an
 * ancestor's removal to descendant CSS2DObjects. Keep that external
 * presentation in the same ownership transaction as its scene-layer root.
 */
export function setMapSceneLayerPresentationVisible(
  root: Object3D,
  visible: boolean,
) {
  root.traverse((object) => {
    if (object instanceof CSS2DObject) {
      setExternalPresentationElementVisible(object.element, visible);
    }
  });
}

/** Disposes a layer batch once per identity while tolerating optional entries. */
export function disposeMapSceneLayers(
  layers: Iterable<MapSceneLayer | undefined>,
) {
  const disposedLayers = new Set<MapSceneLayer>();
  for (const layer of layers) {
    if (!layer || disposedLayers.has(layer)) continue;
    disposedLayers.add(layer);
    layer.dispose();
  }
}

/** Layer whose existing GPU resources can be recolored without rebuilding geometry. */
export interface ThemeAwareMapSceneLayer extends MapSceneLayer {
  applyTheme(theme: DigitalTwinMapTheme, tuning: MapVisualTuning): void;
}

/** Layer whose live visual tuning can be updated without rebuilding the scene. */
export interface TuningAwareMapSceneLayer extends ThemeAwareMapSceneLayer {
  applyTuning(theme: DigitalTwinMapTheme, tuning: MapVisualTuning): void;
}
