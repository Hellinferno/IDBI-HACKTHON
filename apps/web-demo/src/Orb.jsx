import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { configFor } from './orbStates.js';

function hexToColor(hex) {
  return new THREE.Color(hex);
}

function OrbMesh({ state, amplitude }) {
  const matRef = useRef();
  const groupRef = useRef();
  const current = useRef({ color: hexToColor('#4A90D9'), scale: 1, distort: 0.25 });

  useFrame((_, delta) => {
    const cfg = configFor(state);
    const c = current.current;

    // Smoothly approach the target color / distortion for this state.
    c.color.lerp(hexToColor(cfg.color), Math.min(1, delta * 3));

    // Pulse: amplitude-driven while speaking, otherwise a sine breathing pulse.
    const t = performance.now() / 1000;
    let pulse;
    if (cfg.pulseSpeed === 0) {
      pulse = 1 + (amplitude?.current ?? 0) * 0.22; // speaking → audio-like pulse
    } else {
      pulse = 1 + Math.sin(t * cfg.pulseSpeed * 2) * 0.04;
    }
    const targetScale = cfg.scale * pulse;
    c.scale += (targetScale - c.scale) * Math.min(1, delta * 6);
    c.distort += (cfg.distort - c.distort) * Math.min(1, delta * 3);

    if (groupRef.current) {
      groupRef.current.scale.setScalar(c.scale);
      groupRef.current.rotation.y += delta * cfg.rotSpeed;
      groupRef.current.rotation.z += delta * cfg.rotSpeed * 0.3;
    }
    if (matRef.current) {
      matRef.current.color = c.color;
      matRef.current.emissive = c.color;
      matRef.current.distort = c.distort;
    }
  });

  const cfg = configFor(state);

  return (
    <group ref={groupRef}>
      <Sphere args={[1, 96, 96]}>
        <MeshDistortMaterial
          ref={matRef}
          speed={2.2}
          distort={0.25}
          roughness={0.18}
          metalness={0.35}
          emissiveIntensity={0.85}
          color="#4A90D9"
        />
      </Sphere>
      {/* Inner glow shell */}
      <Sphere args={[1.18, 48, 48]}>
        <meshBasicMaterial color={cfg.color} transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>
      <Sparkles
        count={Math.round(40 * cfg.particleDensity)}
        scale={4}
        size={3}
        speed={0.4 + cfg.rotSpeed}
        color={cfg.color}
        opacity={0.7}
      />
    </group>
  );
}

export default function Orb({ state, amplitude }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, 2]} intensity={0.6} color="#7B68EE" />
      <OrbMesh state={state} amplitude={amplitude} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.1} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
