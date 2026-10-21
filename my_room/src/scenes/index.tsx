import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Level } from './Level';
import { Sudo } from './Sudo';
import { Camera } from './Camera';
import { Cactus } from './Cactus';
import { Box } from './Box';
import { useEffect, useMemo, useRef, useState, Suspense, useContext } from 'react';
import { Monitor } from './Monitor';
import { Game } from './Game';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { LoadingScreen } from '../zoomIn/Loader';
import TWEEN from '@tweenjs/tween.js';
import { Context } from '../provider/Provider';
import { OverlayHUD } from '../components/OverlayHUD';
import {
  CAMERA_FOV,
  IFRAME_URL,
  ROOM_POSITION,
  ROOM_SCALE,
  ZoomLayout,
  getZoomLayout,
} from './screenLayout';

// Posições da câmera
const CAM_FAR = { x: 40, y: 10, z: -80 }; // Posição inicial (longe, vista dramática)
const CAM_IDLE = { x: 10, y: -4, z: -50 }; // Posição normal (orbiting)
const CAM_TARGET: [number, number, number] = [10, -4, -2]; // Para onde a câmera olha no modo orbit
// A posição de zoom não é fixa: vem de getZoomLayout(), calculada pelo tamanho da janela

function useViewportSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

interface CameraControllerProps {
  isZoomed: boolean;
  started: boolean;
  zoomSettled: boolean;
  zoomLayout: ZoomLayout;
  onZoomSettled: (settled: boolean) => void;
}

function CameraController({
  isZoomed,
  started,
  zoomSettled,
  zoomLayout,
  onZoomSettled,
}: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const directionRef = useRef(1);
  const rotationSpeedRef = useRef(0.35);
  const [hasEntered, setHasEntered] = useState(false);
  // Ref para o tween de zoom usar o layout mais recente sem reiniciar a cada resize
  const zoomLayoutRef = useRef(zoomLayout);
  zoomLayoutRef.current = zoomLayout;

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

    onZoomSettled(false); // esconde o iframe assim que o movimento começa

    const layout = zoomLayoutRef.current;
    const duration = isZoomed ? 1800 : 1200;

    // O alvo também anda: no zoom a câmera olha pro centro exato da tela, não pro centro do quarto
    const controls = controlsRef.current;
    const lookTween = controls
      ? new TWEEN.Tween(controls.target)
          .to(isZoomed ? layout.target : toXYZ(CAM_TARGET), duration)
          .easing(TWEEN.Easing.Quintic.InOut)
          .start()
      : null;

    const tween = new TWEEN.Tween(camera.position)
      .to(isZoomed ? layout.cameraPosition : CAM_IDLE, duration)
      .easing(TWEEN.Easing.Quintic.InOut)
      .onComplete(() => {
        if (isZoomed) onZoomSettled(true); // só mostra o iframe com a câmera parada
      })
      .start();

    return () => {
      tween.stop();
      lookTween?.stop();
    };
  }, [isZoomed, camera.position]);

  // Janela redimensionada (ou celular girado) com o zoom já parado: reposiciona na hora
  useEffect(() => {
    if (!isZoomed || !zoomSettled) return;
    const { cameraPosition, target } = zoomLayout;
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    controlsRef.current?.target.set(target.x, target.y, target.z);
  }, [zoomLayout, isZoomed, zoomSettled, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={!isZoomed && hasEntered}
      // Não usar `enabled={false}`: o drei deixa de chamar controls.update() e a câmera
      // para de olhar pro target durante o tween (fica torta). Só bloqueia a rotação manual.
      enableRotate={!isZoomed}
      autoRotateSpeed={rotationSpeedRef.current}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={Math.PI / 6}
      maxAzimuthAngle={Math.PI / 1.001}
      target={CAM_TARGET}
    />
  );
}

const toXYZ = ([x, y, z]: [number, number, number]) => ({ x, y, z });

export default function Room() {
  const { start, hovered, isZoomed, setHovered, setIsZoomed, setStart } = useContext(Context);
  const [zoomSettled, setZoomSettled] = useState(false);
  const viewport = useViewportSize();
  const zoomLayout = useMemo(
    () => getZoomLayout(viewport.width, viewport.height),
    [viewport.width, viewport.height]
  );
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [CAM_FAR.x, CAM_FAR.y, CAM_FAR.z], fov: CAMERA_FOV }}
        onPointerMissed={() => setIsZoomed(false)}
      >
        <ambientLight intensity={0.5} />
        <CameraController
          isZoomed={isZoomed}
          started={start}
          zoomSettled={zoomSettled}
          zoomLayout={zoomLayout}
          onZoomSettled={setZoomSettled}
        />
        <Suspense fallback={null}>
          <group visible={start}>
            <group scale={ROOM_SCALE} position={ROOM_POSITION} dispose={null}>
              <Level />
              <Sudo />
              <Camera />
              <Cactus />
              <Box position={[-0.8, 1.4, 0.4]} scale={0.15} />
              <Monitor
                setHovered={setHovered}
                setIsZoomed={setIsZoomed}
                isZoomed={isZoomed}
                zoomSettled={zoomSettled}
                fullscreen={zoomLayout.fullscreen}
              />
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

      {/* Telas pequenas: a câmera mergulha na tela do monitor e o iframe assume a janela inteira */}
      {isZoomed && zoomLayout.fullscreen && (
        <div
          className="fullscreen-screen"
          style={{ opacity: zoomSettled ? 1 : 0, pointerEvents: zoomSettled ? 'auto' : 'none' }}
        >
          <iframe src={IFRAME_URL} title="Windows XP Portfolio" />
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
