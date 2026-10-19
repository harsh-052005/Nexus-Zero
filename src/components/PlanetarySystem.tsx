import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { StarfieldBackdrop } from './StarfieldBackdrop'

function Planet({
  radius,
  color,
  emissive,
  orbit,
  speed,
  tilt = 0,
}: {
  radius: number
  color: string
  emissive: string
  orbit: number
  speed: number
  tilt?: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed
    ref.current.position.x = Math.cos(t) * orbit
    ref.current.position.z = Math.sin(t) * orbit
    ref.current.rotation.y += 0.01
  })

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[radius * 1.45, 0.03, 8, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function EnergyCore3D() {
  const core = useRef<THREE.Mesh>(null)
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (core.current) {
      const s = 1 + Math.sin(t * 2) * 0.06
      core.current.scale.setScalar(s)
    }
    if (ring1.current) ring1.current.rotation.z = t * 0.6
    if (ring2.current) ring2.current.rotation.x = t * 0.4
  })

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#7b2fff"
          emissive="#00f0ff"
          emissiveIntensity={1.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.025, 12, 80]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[1.4, 0.02, 12, 80]} />
        <meshBasicMaterial color="#7b2fff" transparent opacity={0.55} />
      </mesh>
      <pointLight color="#00f0ff" intensity={2.5} distance={12} />
      <pointLight color="#7b2fff" intensity={1.5} distance={10} position={[0, 1, 0]} />
    </group>
  )
}

function Dust() {
  const ref = useRef<THREE.Points>(null)
  const count = 200
  const positions = useRef(new Float32Array(count * 3))
  if (positions.current[0] === 0 && positions.current[1] === 0) {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 20
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
  }

  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.03
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#88aacc" transparent opacity={0.45} depthWrite={false} />
    </points>
  )
}

export function PlanetarySystem() {
  const group = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.08
  })

  return (
    <>
      <color attach="background" args={['#030508']} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 3]} intensity={0.6} color="#a8c4ff" />
      <StarfieldBackdrop />
      <Dust />
      <group ref={group} position={[0, 0, 0]}>
        <EnergyCore3D />
        <Planet
          radius={0.28}
          color="#1a3a55"
          emissive="#00f0ff"
          orbit={2.4}
          speed={0.35}
          tilt={0.2}
        />
        <Planet
          radius={0.42}
          color="#2a1848"
          emissive="#7b2fff"
          orbit={3.6}
          speed={0.22}
          tilt={-0.3}
        />
        <Planet
          radius={0.2}
          color="#3a2030"
          emissive="#ff2a4a"
          orbit={4.8}
          speed={0.15}
        />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.25, 64]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.45, 64]} />
          <meshBasicMaterial color="#7b2fff" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  )
}
