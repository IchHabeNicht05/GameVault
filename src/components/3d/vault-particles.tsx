"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Prachové/datové částice vznášející se kolem jádra.
 *
 * Pozice se generují jednou (useMemo) do typed array a celé pole se pak
 * animuje jako jeden `Points` objekt — tedy jeden draw call bez ohledu na
 * počet částic. Rotace pole reaguje na scroll: při scrollu dolů se prach
 * "protáčí" kolem diváka a vzniká pocit průletu prostorem.
 */
export function VaultParticles({
  count,
  progressRef,
  reducedMotion,
}: {
  count: number;
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color("#7c5cff"), new THREE.Color("#a78bfa"), new THREE.Color("#ff5c35")];

    for (let i = 0; i < count; i++) {
      // Rozmístění do kulové slupky kolem středu (ne plná koule — uvnitř je jádro).
      const radius = 5 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || reducedMotion) return;
    const p = progressRef.current;
    points.current.rotation.y += delta * 0.02;
    points.current.rotation.x = p * 0.3;
    // Se scrollem se pole mírně stahuje → dojem zrychlení průletu.
    points.current.scale.setScalar(1 - p * 0.18);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}