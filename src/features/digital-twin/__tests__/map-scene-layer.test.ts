import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import {
  disposeMapSceneLayers,
  type MapSceneLayer,
  setExternalPresentationElementVisible,
  setMapSceneLayerPresentationVisible,
} from "../rendering/map-scene-layer";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

function createLayer() {
  return {
    root: new THREE.Group(),
    dispose: vi.fn<() => void>(),
  } satisfies MapSceneLayer;
}

describe("map scene layer lifecycle", () => {
  it("disposes each defined layer identity once per batch", () => {
    const first = createLayer();
    const second = createLayer();

    disposeMapSceneLayers([first, undefined, second, first]);

    expect(first.dispose).toHaveBeenCalledOnce();
    expect(second.dispose).toHaveBeenCalledOnce();
  });

  it("forces external DOM presentation off even when component CSS defines display", () => {
    const element = document.createElement("div");
    element.style.display = "grid";

    setExternalPresentationElementVisible(element, false);

    expect(element.hidden).toBe(true);
    expect(element.style.display).toBe("none");
    expect(element.style.getPropertyPriority("display")).toBe("important");

    setExternalPresentationElementVisible(element, true);

    expect(element.hidden).toBe(false);
    expect(element.style.display).toBe("");
  });

  it("keeps descendant CSS2D presentation in the scene-layer ownership transaction", () => {
    const root = new THREE.Group();
    const nested = new THREE.Group();
    const firstElement = document.createElement("strong");
    const secondElement = document.createElement("div");
    root.add(new CSS2DObject(firstElement), nested);
    nested.add(new CSS2DObject(secondElement));

    setMapSceneLayerPresentationVisible(root, false);

    for (const element of [firstElement, secondElement]) {
      expect(element.hidden).toBe(true);
      expect(element.style.display).toBe("none");
      expect(element.style.getPropertyPriority("display")).toBe("important");
    }

    setMapSceneLayerPresentationVisible(root, true);

    for (const element of [firstElement, secondElement]) {
      expect(element.hidden).toBe(false);
      expect(element.style.display).toBe("");
    }
  });
});
