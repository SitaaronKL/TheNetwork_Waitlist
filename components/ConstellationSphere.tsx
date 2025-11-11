"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import * as THREE from "three";

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(!!query.matches);
    update();
    try {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    } catch {
      // Safari fallback
      query.addListener(update);
      return () => query.removeListener(update);
    }
  }, []);
  return prefers;
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

type ConstellationProps = {
  animated?: boolean;
  radius?: number;
  detail?: number;
};

function Constellation({ animated = true, radius = 1.2, detail = 4 }: ConstellationProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { pointer } = useThree();

  const baseGeometry = useMemo(
    () => new THREE.IcosahedronGeometry(radius, detail),
    [radius, detail]
  );
  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(baseGeometry),
    [baseGeometry]
  );

  const pointsGeometry = useMemo(() => {
    // Use the vertex positions from the base geometry
    const g = new THREE.BufferGeometry();
    const positions = baseGeometry.attributes.position.array as Float32Array;
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [baseGeometry]);

  // Parallax and autorotation
  useFrame((_, delta) => {
    if (!animated) return;
    const group = groupRef.current;
    if (!group) return;
    // Subtle autorotation
    group.rotation.y += delta * 0.1;
    // Parallax from pointer (-1..1)
    const targetX = pointer.y * 0.25;
    const targetY = pointer.x * 0.25;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.05);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY + group.rotation.y, 0.02);
  });

  return (
    <group ref={groupRef}>
      {/* Constellation lines */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </lineSegments>
      {/* Star points */}
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#ffffff"
          size={0.012}
          sizeAttenuation
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
}

export default function ConstellationSphere() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [canWebgl, setCanWebgl] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setCanWebgl(isWebGLAvailable());
    setIsMobile(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  }, []);

  // Static fallback (no WebGL or reduced motion)
  if (prefersReducedMotion || !canWebgl) {
    return (
      <div
        className="hero3d hero3d-static"
        aria-hidden="true"
      />
    );
  }

  // Slightly lower detail on mobile for performance
  const detail = isMobile ? 3 : 4;
  const radius = 1.25;

  return (
    <div className="hero3d" aria-hidden="true">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 3.4], fov: 50 }}
        dpr={[1, 1.75]}
        frameloop="always"
      >
        <ambientLight intensity={0.2} />
        <Constellation animated radius={radius} detail={detail} />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
    </div>
  );
}
