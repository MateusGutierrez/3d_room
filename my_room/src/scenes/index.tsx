import { Canvas } from '@react-three/fiber'
import { Fisheye, CameraControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei'
import { Level } from './Level'
import { Sudo } from './Sudo'
import { Camera } from './Camera'
import { Cactus } from './Cactus'
import { Box } from './Box'
import { useEffect, useState } from 'react'
import { IGLTF } from './interface'

export default function Room() {
    const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF
    const [hovered, setHovered] = useState(false)
      useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
      }, [hovered])
     
    return (
      <Canvas flat>
        <Fisheye zoom={0}>
          <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />
          <ambientLight intensity={Math.PI / 2} />
          <group scale={20} position={[5, -11, -5]} > 
            <Level />
            <Sudo />
            <Camera />
            <Cactus />
            <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
            <group dispose={null}  onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
                <mesh geometry={nodes.monitor.geometry} material={materials.Level} position={[-0.377, 0.688, 0.62]} rotation={[Math.PI / 2, -Math.PI / 9, 0]} />
            </group>
            <mesh geometry={nodes.game.geometry} material={materials.Level} position={[-0.377, 0.688, 0.62]} rotation={[Math.PI / 2, -Math.PI / 9, 0]} />
          </group>
          <Environment preset="city" background blur={1} />
          <PerspectiveCamera makeDefault position={[0, 0, 18.5]} />
        </Fisheye>
      </Canvas>
    )
  }