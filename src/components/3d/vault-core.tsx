"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Icosahedron, Torus, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const PLASMA = "#7c5cff";
const PLASMA_SOFT = "#a78bfa";
const EMBER = "#ff5c35";
const GOLD = "#f2b84b";

/**
 * "The Vault Core" — centrální herní artefakt.
 *
 * Skládá se ze tří vrstev, které se točí různou rychlostí a v opačných
 * směrech, takže i bez textur vzniká dojem složitého mechanismu:
 *  1. vnitřní jádro — měkce deformovaná koule (energie uvnitř trezoru)
 *  2. wireframe plášť — krystalická slupka kolem jádra
 *  3. orbitální prstence — tři nakloněné torusy jako gyroskop
 *
 * Scroll (`progressRef`) řídí rozevření prstenců a rotaci celku: jak uživatel
 * scrolluje, artefakt se "otevírá" a odhaluje jádro.
 */
export function VaultCore({
  progressRef,
  reducedMotion,
}: {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const p = progressRef.current;
    const t = state.clock.elapsedTime;
    const speed = reducedMotion ? 0 : 1;

    if (group.current) {
      // Celý artefakt se se scrollem otáčí a mírně naklání.
      group.current.rotation.y += delta * 0.12 * speed;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, p * 0.5, 0.05);
      // Jemné vznášení — nezávislé na scrollu.
      group.current.position.y = Math.sin(t * 0.5) * 0.12 * speed;
    }

    if (shell.current) {
      shell.current.rotation.y -= delta * 0.25 * speed;
      // Plášť se se scrollem roztahuje a ztrácí krytí → odhaluje jádro.
      const scale = 1.35 + p * 0.5;
      shell.current.scale.setScalar(scale);
      const mat = shell.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 - p * 0.35;
    }

    // Prstence: rozevírají se do stran podle scrollu (gyroskop se "otevírá").
    const open = p * Math.PI * 0.35;
    if (ringA.current) {
      ringA.current.rotation.z += delta * 0.4 * speed;
      ringA.current.rotation.x = Math.PI / 2 + open;
    }
    if (ringB.current) {
      ringB.current.rotation.z -= delta * 0.3 * speed;
      ringB.current.rotation.y = Math.PI / 3 - open;
    }
    if (ringC.current) {
      ringC.current.rotation.x += delta * 0.2 * speed;
      ringC.current.rotation.y = -Math.PI / 4 + open * 0.6;
    }
  });

  return (
    <group ref={group}>
      {/* 1 — vnitřní energetické jádro */}
      <Icosahedron args={[1, 12]}>
        <MeshDistortMaterial
          color={PLASMA}
          emissive={PLASMA}
          emissiveIntensity={1.6}
          roughness={0.15}
          metalness={0.85}
          distort={reducedMotion ? 0 : 0.35}
          speed={1.6}
        />
      </Icosahedron>

      {/* 2 — krystalický wireframe plášť */}
      <Icosahedron ref={shell} args={[1, 1]}>
        <meshBasicMaterial color={PLASMA_SOFT} wireframe transparent opacity={0.5} />
      </Icosahedron>

      {/* 3 — orbitální prstence */}
      <Torus ref={ringA} args={[2.4, 0.02, 8, 120]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={PLASMA_SOFT} emissive={PLASMA_SOFT} emissiveIntensity={2.4} toneMapped={false} />
      </Torus>
      <Torus ref={ringB} args={[3.1, 0.015, 8, 120]} rotation={[0, Math.PI / 3, Math.PI / 5]}>
        <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={2} toneMapped={false} />
      </Torus>
      <Torus ref={ringC} args={[3.8, 0.01, 8, 120]} rotation={[Math.PI / 4, -Math.PI / 4, 0]}>
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.6} toneMapped={false} />
      </Torus>
    </group>
  );
}