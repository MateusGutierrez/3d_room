import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, Stats } from '@react-three/drei'
import { Level } from './Level'
import { Sudo } from './Sudo'
import { Camera } from './Camera'
import { Cactus } from './Cactus'
import { Box } from './Box'
import {
  useEffect,
  useState,
  useRef,
  Suspense,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react'
import { Monitor } from './Monitor'
import { Game } from './Game'
import { EffectComposer, OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { LoadingScreen } from '../zoomIn/Loader'
import { TweenUpdater } from '../zoomIn/Tween'
import TWEEN from '@tweenjs/tween.js'
import { useThree } from '@react-three/fiber'
import { Context } from '../provider/Provider'

interface Props {
  isZoomed: boolean
  setIsZoomed: Dispatch<SetStateAction<boolean>>
  hovered: boolean
}

function CameraController({ isZoomed, setIsZoomed, hovered }: Props) {
  const { camera } = useThree()
  const [rotationSpeed, setRotationSpeed] = useState(0.5)
  const direction = useRef(1)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  useFrame(() => {
    TWEEN.update() // Atualiza as animações a cada frame
  })

  useEffect(() => {
    if (isZoomed) {
      new TWEEN.Tween(camera.position)
        .to({ x: 10, y: -4, z: -10 }, 1000) // Posição do monitor
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    } else {
      new TWEEN.Tween(camera.position)
        .to({ x: 10, y: -4, z: -50 }, 1000) // Posição original
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }
  }, [isZoomed])

  useEffect(() => {
    const interval = setInterval(() => {
      if (controlsRef.current) {
        const azimuthAngle = controlsRef.current.getAzimuthalAngle()

        if (azimuthAngle >= Math.PI / 1.001 || azimuthAngle <= Math.PI / 6) {
          direction.current *= -1
        }

        setRotationSpeed(0.5 * direction.current)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={!isZoomed}
      autoRotateSpeed={rotationSpeed}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={Math.PI / 6}
      maxAzimuthAngle={Math.PI / 1.001}
      target={[10, -4, -2]}
    />
  )
}

export default function Room() {
  const { start, hovered, isZoomed, setHovered, setIsZoomed, setStart } =
    useContext(Context)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    // if (start) {
    //   audio.play();
    // }
  }, [hovered])

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [10, -4, -50] }}
        onPointerMissed={() => setIsZoomed(false)} // Clica fora e reseta
      >
        <ambientLight intensity={0.5} />
        <CameraController
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
          hovered={hovered}
        />
        <Suspense fallback={null}>
          {start && (
            <>
            <group scale={25} position={[5, -25, -5]} dispose={null}>
              <Level />
              <Sudo />
              <Camera />
              <Cactus />
              <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
              <Monitor
                setHovered={setHovered}
                hovered={hovered}
                setIsZoomed={setIsZoomed}
                isZoomed={isZoomed}
              />
              <Game setHovered={setHovered} />
            </group>
            <TweenUpdater />
            <Environment preset='city' />
            </>
          )}
        </Suspense>
        <Stats />
      </Canvas>
      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  )
}
