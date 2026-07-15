"use client";

import * as React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { TrophyIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type WebGLState = "checking" | "ready" | "fallback";

function canCreateWebGLContext() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

export function WorldCupTrophyThree({
  className,
  onInteract,
  onInteractiveChange,
}: {
  className?: string;
  onInteract?: () => void;
  onInteractiveChange?: (interactive: boolean) => void;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const onInteractRef = React.useRef(onInteract);
  const onInteractiveChangeRef = React.useRef(onInteractiveChange);
  const [webglState, setWebglState] = React.useState<WebGLState>("checking");

  React.useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  React.useEffect(() => {
    onInteractiveChangeRef.current = onInteractiveChange;
  }, [onInteractiveChange]);

  React.useEffect(() => {
    const nextState = canCreateWebGLContext() ? "ready" : "fallback";
    setWebglState(nextState);
    onInteractiveChangeRef.current?.(nextState === "ready");
  }, []);

  React.useEffect(() => {
    if (webglState !== "ready") return;
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 0.25, 6.2);
    camera.lookAt(0, 0.15, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      setWebglState("fallback");
      onInteractiveChangeRef.current?.(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "size-full";
    host.appendChild(renderer.domElement);
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglState("fallback");
      onInteractiveChangeRef.current?.(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    const trophy = new THREE.Group();
    let pitch = -0.04;
    let yaw = 0;
    trophy.position.x = -0.18;
    trophy.rotation.x = pitch;
    scene.add(trophy);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      "/models/world-cup-trophy.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 3 / Math.max(size.y, 0.001);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.frustumCulled = false;
        });
        trophy.add(model);
        host.dataset.modelLoaded = "true";
        renderer.render(scene, camera);
      },
      undefined,
      () => {
        host.dataset.modelLoaded = "error";
      },
    );

    const key = new THREE.DirectionalLight(0xffedb0, 4.2);
    key.position.set(-2.5, 3.5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffb325, 3.2);
    rim.position.set(3, 1.5, -2);
    scene.add(rim);
    const fill = new THREE.HemisphereLight(0xfff2cf, 0x07100c, 1.4);
    scene.add(fill);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dragging = false;
    let pointerId = -1;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let frame = 0;
    let previous = performance.now();
    const renderScene = () => {
      trophy.rotation.set(pitch, yaw, 0);
      renderer.render(scene, camera);
    };
    const render = (now: number) => {
      frame = 0;
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!dragging) yaw += delta * 0.24;
      renderScene();
      frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (reduceMotion || document.hidden || frame) return;
      previous = performance.now();
      frame = requestAnimationFrame(render);
    };
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      start();
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onInteractRef.current?.();
      dragging = true;
      pointerId = event.pointerId;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      host.setPointerCapture(pointerId);
      host.dataset.dragging = "true";
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      event.stopPropagation();
      const deltaX = event.clientX - previousPointerX;
      const deltaY = event.clientY - previousPointerY;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      yaw += deltaX * 0.012;
      pitch = THREE.MathUtils.clamp(pitch + deltaY * 0.008, -0.45, 0.35);
      renderScene();
    };
    const finishPointerDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      event.stopPropagation();
      dragging = false;
      if (host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId);
      pointerId = -1;
      delete host.dataset.dragging;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const rotationStep = Math.PI / 12;
      if (event.key === "ArrowLeft") yaw -= rotationStep;
      else if (event.key === "ArrowRight") yaw += rotationStep;
      else if (event.key === "ArrowUp") pitch = THREE.MathUtils.clamp(pitch - 0.1, -0.45, 0.35);
      else if (event.key === "ArrowDown") pitch = THREE.MathUtils.clamp(pitch + 0.1, -0.45, 0.35);
      else if (event.key === "Home") {
        pitch = -0.04;
        yaw = 0;
      } else return;
      onInteractRef.current?.();
      event.preventDefault();
      event.stopPropagation();
      renderScene();
    };

    host.addEventListener("pointerdown", handlePointerDown);
    host.addEventListener("pointermove", handlePointerMove);
    host.addEventListener("pointerup", finishPointerDrag);
    host.addEventListener("pointercancel", finishPointerDrag);
    host.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibility);
    if (reduceMotion) renderScene();
    else start();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibility);
      host.removeEventListener("pointerdown", handlePointerDown);
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerup", finishPointerDrag);
      host.removeEventListener("pointercancel", finishPointerDrag);
      host.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) value.dispose();
          });
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [webglState]);

  return (
    <div
      ref={hostRef}
      role={webglState === "ready" ? "group" : "img"}
      aria-roledescription={webglState === "ready" ? "interactive 3D model" : undefined}
      aria-label={webglState === "ready" ? "World Cup trophy. Drag to rotate, or use arrow keys. Press Home to reset." : "World Cup trophy"}
      tabIndex={webglState === "ready" ? 0 : -1}
      data-webgl-fallback={webglState === "fallback" ? "true" : undefined}
      className={cn(
        "nodrag nopan nowheel pointer-events-auto touch-none select-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        webglState === "ready" && "cursor-grab data-[dragging=true]:cursor-grabbing",
        webglState !== "ready" && "flex items-center justify-center",
        className,
      )}
    >
      {webglState === "fallback" && (
        <span className="flex size-20 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary shadow-[0_0_32px_color-mix(in_oklab,var(--primary)_22%,transparent)]">
          <TrophyIcon className="size-10" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
