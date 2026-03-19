"use client"

import { Suspense, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, Html } from "@react-three/drei"
import type { Group, Mesh } from "three"
import * as THREE from "three"

function SceneCore() {
  const groupRef = useRef<Group>(null)
  const ringRef = useRef<Mesh>(null)
  const knotRef = useRef<Mesh>(null)
  const shards = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        position: [
          Math.sin(index * 1.7) * (2.2 + (index % 3) * 0.55),
          (index - 4) * 0.32,
          Math.cos(index * 1.2) * 1.8
        ] as [number, number, number],
        rotation: [index * 0.25, index * 0.4, index * 0.18] as [number, number, number],
        scale: 0.18 + (index % 4) * 0.07
      })),
    []
  )

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        state.pointer.x * 0.35 + t * 0.08,
        0.04
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.12, 0.04)
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.22
      ringRef.current.rotation.x += delta * 0.06
    }

    if (knotRef.current) {
      knotRef.current.rotation.x += delta * 0.24
      knotRef.current.rotation.y += delta * 0.16
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.8} floatIntensity={0.8}>
        <mesh ref={knotRef} position={[0, 0.15, 0]}>
          <torusKnotGeometry args={[0.82, 0.22, 220, 32]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.16} emissive="#0ea5e9" emissiveIntensity={0.12} />
        </mesh>
      </Float>

      <mesh ref={ringRef} rotation={[0.8, 0.5, 0.25]}>
        <torusGeometry args={[1.85, 0.03, 16, 200]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.22} emissive="#f59e0b" emissiveIntensity={0.35} />
      </mesh>

      <mesh rotation={[1.1, 0.2, -0.6]}>
        <torusGeometry args={[2.45, 0.015, 16, 200]} />
        <meshStandardMaterial color="#67e8f9" metalness={0.7} roughness={0.12} transparent opacity={0.55} />
      </mesh>

      {shards.map((shard, index) => (
        <Float key={index} speed={1 + index * 0.08} rotationIntensity={0.4} floatIntensity={1.2}>
          <mesh position={shard.position} rotation={shard.rotation} scale={shard.scale}>
            <boxGeometry args={[1, 1.8, 0.18]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#dbeafe" : "#fef3c7"}
              metalness={0.7}
              roughness={0.14}
              transparent
              opacity={0.72}
            />
          </mesh>
        </Float>
      ))}

      <mesh position={[0, -1.9, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 64]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.36} />
      </mesh>

      <Html position={[0, -2.15, 0]} center transform distanceFactor={7.2}>
        <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[10px] uppercase tracking-[0.38em] text-white/55 backdrop-blur-md">
          Signal Engine
        </div>
      </Html>
    </group>
  )
}

export function LandingOrbitScene() {
  return (
    <div className="relative aspect-[4/5] min-h-[420px] w-full overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,#091018_0%,#07080d_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.18),transparent_18%),radial-gradient(circle_at_60%_60%,rgba(245,158,11,0.12),transparent_24%)]" />
      <Canvas camera={{ position: [0, 0, 5.8], fov: 38 }}>
        <color attach="background" args={["#07080d"]} />
        <fog attach="fog" args={["#07080d", 6, 10]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.3} color="#ffffff" />
        <pointLight position={[-3, -1, 2]} intensity={1.4} color="#22d3ee" />
        <pointLight position={[3, 1, 2]} intensity={1.1} color="#f59e0b" />
        <Suspense fallback={null}>
          <SceneCore />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}
