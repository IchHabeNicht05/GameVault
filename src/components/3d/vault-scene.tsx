"use client";

import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { VaultCore } from "./vault-core";
import { VaultParticles } from "./vault-particles";
import { useDeviceTier } from "@/hooks/use-device-tier";

/**
 * Kamera řízená scrollem + myší.
 *
 * Scroll (0→1) dělá dolly dovnitř scény a snižuje úhel pohledu — divák se
 * doslova propadá do trezoru. Myš přidává jemný parallax s dampingem, takže
 * scéna reaguje, ale nikdy neškube.
 *
 * Záměrně se nepoužívá drei `<ScrollControls>`: ten si bere vlastní scroll
 * kontejner, což by kolidovalo s běžným scrollem stránky a sticky layoutem.
 */
function CameraRig({
  progressRef,
  reducedMotion,
}: {
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0, z: 11 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const p = progressRef.current;

    // Cílová pozice: scroll řídí přiblížení a mírný sestup, myš parallax.
    const targetZ = 11 - p * 5.5;
    const targetX = reducedMotion ? 0 : pointer.current.x * 1.4 * (1 - p * 0.5);
    const targetY = (reducedMotion ? 0 : -pointer.current.y * 0.9) + p * 1.2;

    current.current.x = THREE.MathUtils.lerp(current.current.x, targetX, 0.045);
    current.current.y = THREE.MathUtils.lerp(current.current.y, targetY, 0.045);
    current.current.z = THREE.MathUtils.lerp(current.current.z, targetZ, 0.06);

    camera.position.set(current.current.x, current.current.y, current.current.z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Cinematic nasvícení — klíčové plazmové světlo, ember protisvětlo, zlatý rim. */
function VaultLighting({ enableShadows }: { enableShadows: boolean }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 4, 5]} intensity={70} color="#7c5cff" castShadow={enableShadows} />
      <pointLight position={[-6, -2, -4]} intensity={45} color="#ff5c35" />
      <pointLight position={[0, 6, -6]} intensity={30} color="#f2b84b" />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={40} color="#a78bfa" />
    </>
  );
}

/**
 * Celá scéna "The Vault" připravená k vložení do sticky kontejneru.
 * `progressRef` je plain ref (ne state) — aktualizuje ho scroll listener
 * rodiče a čte `useFrame`, takže scroll nikdy nespustí React re-render.
 */
export function VaultScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { dpr, particleCount, enableShadows, reducedMotion, ready } = useDeviceTier();

  // Dokud neznáme schopnosti zařízení, nerenderujeme — viz useDeviceTier.
  if (!ready) return null;

  return (
    <Canvas
      dpr={dpr}
      shadows={enableShadows}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 11], fov: 42 }}
      style={{ pointerEvents: "none" }}
    >
      <fog attach="fog" args={["#08090d", 9, 26]} />
      <Suspense fallback={null}>
        <VaultLighting enableShadows={enableShadows} />
        <VaultCore progressRef={progressRef} reducedMotion={reducedMotion} />
        <VaultParticles count={particleCount} progressRef={progressRef} reducedMotion={reducedMotion} />
      </Suspense>
      <CameraRig progressRef={progressRef} reducedMotion={reducedMotion} />
    </Canvas>
  );
}