import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Level } from './Level';
import { Sudo } from './Sudo';
import { Camera } from './Camera';
import { Cactus } from './Cactus';
import { Box } from './Box';
import { useEffect, useRef, useState, Suspense, useContext } from 'react';
import { Monitor } from './Monitor';
import { Game } from './Game';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { LoadingScreen } from '../zoomIn/Loader';
import TWEEN from '@tweenjs/tween.js';
import { Context } from '../provider/Provider';
import { OverlayHUD } from '../components/OverlayHUD';

// Posições da câmera
const CAM_FAR = { x: 40, y: 10, z: -80 }; // Posição inicial (longe, vista dramática)
const CAM_IDLE = { x: 10, y: -4, z: -50 }; // Posição normal (orbiting)
const CAM_ZOOMED = { x: 10, y: -4, z: -10 }; // Posição zoomed (monitor)

interface CameraControllerProps {
  isZoomed: boolean;
  started: boolean;
}

function CameraController({ isZoomed, started }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const directionRef = useRef(1);
  const rotationSpeedRef = useRef(0.35);
  const [hasEntered, setHasEntered] = useState(false);

  useFrame(() => {
    TWEEN.update();

    if (controlsRef.current && !isZoomed && hasEntered) {
      const azimuthAngle = controlsRef.current.getAzimuthalAngle();

      if (azimuthAngle >= Math.PI / 1.001 || azimuthAngle <= Math.PI / 6) {
        directionRef.current *= -1;
      }

      rotationSpeedRef.current = 0.5 * directionRef.current;
      controlsRef.current.autoRotateSpeed = rotationSpeedRef.current;
    }
  });

  // Entrada dramática: sweep-in ao clicar START
  useEffect(() => {
    if (!started || hasEntered) return;
    setHasEntered(true);

    // Câmera começa longe e faz sweep para a posição idle
    camera.position.set(CAM_FAR.x, CAM_FAR.y, CAM_FAR.z);

    new TWEEN.Tween(camera.position)
      .to(CAM_IDLE, 2500)
      .easing(TWEEN.Easing.Exponential.Out)
      .start();

    // Inicia a rotação automática suavemente após a entrada
    setTimeout(() => {
      rotationSpeedRef.current = 0.01;
    }, 800);
  }, [started, camera.position]);

  // Zoom no monitor
  useEffect(() => {
    if (!hasEntered) return;

    const target = isZoomed ? CAM_ZOOMED : CAM_IDLE;
    const duration = isZoomed ? 1800 : 1200;

    new TWEEN.Tween(camera.position)
      .to(target, duration)
      .easing(TWEEN.Easing.Quintic.InOut)
      .start();
  }, [isZoomed, camera.position]);

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={!isZoomed && hasEntered}
      autoRotateSpeed={rotationSpeedRef.current}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
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
        camera={{ position: [CAM_FAR.x, CAM_FAR.y, CAM_FAR.z] }}
        onPointerMissed={() => setIsZoomed(false)}
      >
        <ambientLight intensity={0.5} />
        <CameraController isZoomed={isZoomed} started={start} />
        <Suspense fallback={null}>
          <group visible={start}>
            <group scale={25} position={[5, -25, -5]} dispose={null}>
              <Level />
              <Sudo />
              <Camera />
              <Cactus />
              <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
              <Monitor setHovered={setHovered} setIsZoomed={setIsZoomed} isZoomed={isZoomed} />
              <Game />
            </group>
            <Environment preset="city" />
          </group>
        </Suspense>
      </Canvas>

      <OverlayHUD visible={start && !isZoomed} />

      {/* Hint: clique no monitor */}
      {start && !isZoomed && (
        <div className="monitor-hint">
          <span className="monitor-hint__icon">&#9654;</span>
          Click on the monitor to explore
        </div>
      )}

      {/* Botão voltar quando zoomed */}
      {isZoomed && (
        <button
          className="back-button"
          onClick={() => setIsZoomed(false)}
          aria-label="Go back to room view"
        >
          <span className="back-button__arrow">&#8592;</span> Back
        </button>
      )}

      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  );
}
