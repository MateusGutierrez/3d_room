import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Level } from './Level'
import { Sudo } from './Sudo'
import { Camera } from './Camera'
import { Cactus } from './Cactus'
import { Box } from './Box'
import { useEffect, useState } from 'react'
import { Monitor } from './Monitor'
import { Game } from './Game'

export default function Room() {
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  return (
    <Canvas shadows camera={{ position: [20, 15, -50] }}>
      <ambientLight intensity={Math.PI / 2} />
      <group scale={25} position={[5, -25, -5]} dispose={null}>
        <Level />
        <Sudo />
        <Camera />
        <Cactus />
        <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
        <Monitor setHovered={setHovered} />
        <Game setHovered={setHovered} />
      </group>
      <Environment preset='city' background blur={1} />
      <OrbitControls
        autoRotate={!hovered}
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={Math.PI / 6}
        maxAzimuthAngle={Math.PI / 1.1}
      />
    </Canvas>
  )
}
