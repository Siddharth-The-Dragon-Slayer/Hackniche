"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

/**
 * 360° Panoramic Hall Viewer
 *
 * Props:
 *  - panoramaUrl : string  — path to equirectangular panorama image
 *  - hallName    : string  — display name for the hall
 *  - height      : number  — container height in px (default 500)
 */
export default function HallTour360({
  panoramaUrl = "/panoramas/kalyan-west-hall.jpg",
  hallName = "Banquet Hall",
  height = 500,
}) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Scene ────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      1,
      1100
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // ── Sphere (inverted so camera sits inside) ─────────────
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      panoramaUrl,
      () => setLoading(false),
      undefined,
      () => {
        setLoading(false);
        setError("Failed to load panorama image");
      }
    );
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── OrbitControls (drag to look around) ─────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = -0.3;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // ── Auto-rotate slowly ──────────────────────────────────
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // Stop auto-rotate on first interaction
    const stopAutoRotate = () => {
      controls.autoRotate = false;
      renderer.domElement.removeEventListener("pointerdown", stopAutoRotate);
    };
    renderer.domElement.addEventListener("pointerdown", stopAutoRotate);

    // ── Animate ─────────────────────────────────────────────
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize handler ──────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Fullscreen change handler ───────────────────────────
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Re-render on next tick after fullscreen transition
      setTimeout(onResize, 100);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      renderer.domElement.removeEventListener("pointerdown", stopAutoRotate);
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [panoramaUrl]);

  const toggleFullscreen = () => {
    const el = mountRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: isFullscreen ? 0 : 16,
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            color: "#fff",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid rgba(255,255,255,0.2)",
              borderTopColor: "#D4AF37",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            Loading 360° view…
          </span>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            color: "#ef4444",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {/* Hall name badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 5,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 18 }}>🏛️</span>
        {hallName}
      </div>

      {/* Interaction hint */}
      {!loading && !error && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.8)",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          🖱️ Drag to look around · Scroll to zoom
        </div>
      )}

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 5,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "none",
          color: "#fff",
          width: 40,
          height: 40,
          borderRadius: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "background 0.2s",
        }}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.8)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(0,0,0,0.6)")
        }
      >
        {isFullscreen ? "⊠" : "⛶"}
      </button>

      {/* Three.js mount */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: isFullscreen ? "100vh" : height,
          cursor: "grab",
        }}
      />

      {/* Spin keyframes */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
