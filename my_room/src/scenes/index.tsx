import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Stats } from '@react-three/drei';
import { Level } from './Level';
import { Sudo } from './Sudo';
import { Camera } from './Camera';
import { Cactus } from './Cactus';
import { Box } from './Box';
import { useEffect, useRef, Suspense, useContext } from 'react';
import { Monitor } from './Monitor';
import { Game } from './Game';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { LoadingScreen } from '../zoomIn/Loader';
import TWEEN from '@tweenjs/tween.js';
import { useThree } from '@react-three/fiber';
import { Context } from '../provider/Provider';

interface CameraControllerProps {
  isZoomed: boolean;
}

function CameraController({ isZoomed }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const directionRef = useRef(1);
  const rotationSpeedRef = useRef(0.5);

  useFrame(() => {
    TWEEN.update();

    if (controlsRef.current && !isZoomed) {
      const azimuthAngle = controlsRef.current.getAzimuthalAngle();

      if (azimuthAngle >= Math.PI / 1.001 || azimuthAngle <= Math.PI / 6) {
        directionRef.current *= -1;
      }

      rotationSpeedRef.current = 0.5 * directionRef.current;
      controlsRef.current.autoRotateSpeed = rotationSpeedRef.current;
    }
  });

  useEffect(() => {
    const targetPosition = isZoomed ? { x: 10, y: -4, z: -10 } : { x: 10, y: -4, z: -50 };

    new TWEEN.Tween(camera.position)
      .to(targetPosition, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }, [isZoomed, camera.position]);

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={!isZoomed}
      autoRotateSpeed={rotationSpeedRef.current}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={Math.PI / 6}
      maxAzimuthAngle={Math.PI / 1.001}
      target={[10, -4, -2]}
    />
  );
}

export default function Room() {
  const { start, hovered, isZoomed, setHovered, setIsZoomed, setStart } = useContext(Context);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [10, -4, -50] }}
        onPointerMissed={() => setIsZoomed(false)}
      >
        <ambientLight intensity={0.5} />
        <CameraController isZoomed={isZoomed} />
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
                <Game />
              </group>
              <Environment preset="city" />
            </>
          )}
        </Suspense>
        <Stats />
      </Canvas>
      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  );
}
