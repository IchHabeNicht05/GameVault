"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Vlastní (vanilla) Three.js scéna — žádný react-three-fiber, ať je závislost
 * co nejmenší a kontrola nad životním cyklem (init/resize/dispose) explicitní.
 *
 * Vizuál: shluk průsvitných wireframe polyedrů (ikosaedry, oktaedry, torus)
 * v brand barvách, pomalu rotujících a jemně "dýchajících" nahoru/dolů po
 * sinusoidě. Kamera dělá jemný parallax podle pozice myši — žádné prudké
 * pohyby, ať to nerozptyluje od obsahu hero sekce.
 *
 * Canvas je transparentní (alpha) a `pointer-events-none`, takže leží čistě
 * jako ambientní vrstva nad/pod obsahem, nikdy neblokuje klikání.
 */
export function Hero3DScene({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Scéna, kamera, renderer ─────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Brand barvy ──────────────────────────────────────────
    const PLASMA = new THREE.Color("#7c5cff");
    const PLASMA_SOFT = new THREE.Color("#a78bfa");
    const EMBER = new THREE.Color("#ff5c35");
    const GOLD = new THREE.Color("#f2b84b");

    interface FloatingMesh {
      mesh: THREE.Mesh;
      speed: number;
      floatOffset: number;
      floatSpeed: number;
      baseY: number;
    }

    const meshes: FloatingMesh[] = [];

    const geometries = [
      new THREE.IcosahedronGeometry(1.4, 0),
      new THREE.OctahedronGeometry(1.1, 0),
      new THREE.TorusGeometry(1, 0.32, 8, 24),
      new THREE.IcosahedronGeometry(0.8, 1),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TorusGeometry(0.7, 0.22, 8, 24),
    ];
    const colors = [PLASMA, EMBER, GOLD, PLASMA_SOFT, PLASMA, EMBER];

    const positions: [number, number, number][] = [
      [4.5, 1.5, -2],
      [6.5, -1.5, -5],
      [8, 2.5, -3],
      [9.5, -3, -6],
      [7, 3.5, -8],
      [5.5, -0.5, -10],
    ];

    geometries.forEach((geometry, i) => {
      const material = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const mesh = new THREE.Mesh(geometry, material);
      const [x, y, z] = positions[i % positions.length];
      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      meshes.push({
        mesh,
        speed: 0.05 + Math.random() * 0.08,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.4 + Math.random() * 0.3,
        baseY: y,
      });
    });

    // ── Jemný parallax podle myši ────────────────────────────
    const pointer = { x: 0, y: 0 };
    const targetCameraPos = { x: 0, y: 0 };

    function onPointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    window.addEventListener("pointermove", onPointerMove);

    // ── Resize ────────────────────────────────────────────────
    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // ── Render loop ───────────────────────────────────────────
    let raf = 0;
    const clock = new THREE.Clock();

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        for (const { mesh, speed, floatOffset, floatSpeed, baseY } of meshes) {
          mesh.rotation.x += speed * 0.01;
          mesh.rotation.y += speed * 0.015;
          mesh.position.y = baseY + Math.sin(t * floatSpeed + floatOffset) * 0.4;
        }

        targetCameraPos.x += (pointer.x * 0.8 - targetCameraPos.x) * 0.03;
        targetCameraPos.y += (-pointer.y * 0.5 - targetCameraPos.y) * 0.03;
        camera.position.x = targetCameraPos.x;
        camera.position.y = targetCameraPos.y;
        camera.lookAt(0, 0, -4);
      }

      renderer.render(scene, camera);
    }
    animate();

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      geometries.forEach((g) => g.dispose());
      meshes.forEach(({ mesh }) => (mesh.material as THREE.Material).dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}