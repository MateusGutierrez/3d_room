import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, Stats } from '@react-three/drei'
import { Level } from './Level'
import { Sudo } from './Sudo'
import { Camera } from './Camera'
import { Cactus } from './Cactus'
import { Box } from './Box'
import { useEffect, useState, useRef, Suspense } from 'react'
import { Monitor } from './Monitor'
import { Game } from './Game'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Loader } from '../zoomIn/Loader'
import { Points } from '../zoomIn/Points'
import { TweenUpdater } from '../zoomIn/Tween'

export default function Room() {
  const [hovered, setHovered] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(0.5)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const direction = useRef(1)
  const zoomRef = useRef()
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])
  useEffect(() => {
    const interval = setInterval(() => {
      if (controlsRef.current) {
        const azimuthAngle = controlsRef.current.getAzimuthalAngle()

        if (azimuthAngle >= Math.PI / 1.1 || azimuthAngle <= Math.PI / 6) {
          direction.current *= -1
        }

        setRotationSpeed(0.5 * direction.current)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <Suspense fallback={<Loader />}>
      <group scale={25} position={[5, -25, -5]} dispose={null}>
        <Level />
        <Sudo />
        <Camera />
        <Cactus />
        <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
        <Monitor setHovered={setHovered} hovered={hovered} />
        <Game setHovered={setHovered} />
      </group>
      <Points controls={zoomRef} />
      <TweenUpdater />
      <Environment preset='city' background blur={1} />
    </Suspense>
  )
}
