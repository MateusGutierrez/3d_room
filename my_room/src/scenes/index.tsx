import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
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
import { BiPointer, BiArrowBack } from 'react-icons/bi';

// O modelo usa compressão Draco. O decoder fica em public/draco (o padrão do drei busca no CDN do Google)
useGLTF.setDecoderPath('./draco/');

// Posições da câmera
const CAM_FAR = { x: 40, y: 10, z: -80 }; // Posição inicial (longe, vista dramática)
const CAM_IDLE = { x: 40.64, y: 0.42, z: -43.87 }; // Posição normal (orbiting): início da órbita
const CAM_TARGET: [number, number, number] = [10, -4, -2]; // Para onde a câmera olha no modo orbit
// A órbita gira só na horizontal, na altura do CAM_IDLE: o ângulo vertical (polar) fica travado
// no ângulo dele em relação ao alvo (~85°, um pouco de cima). Mudou o CAM_IDLE, ele acompanha.
const ORBIT_POLAR = Math.acos(
  (CAM_IDLE.y - CAM_TARGET[1]) /
    Math.hypot(CAM_IDLE.x - CAM_TARGET[0], CAM_IDLE.y - CAM_TARGET[1], CAM_IDLE.z - CAM_TARGET[2])
);
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
  // Travas da órbita (ângulo vertical fixo, giro limitado). Ficam desligadas do início do zoom
  // até a câmera terminar de voltar: no zoom a câmera fica de frente pra tela (90°), e com a
  // trava ligada o OrbitControls a puxaria de volta pros ~85° depois do tween (um 2º movimento).
  const [orbitLocked, setOrbitLocked] = useState(true);
  // Ref para o tween de zoom usar o layout mais recente sem reiniciar a cada resize
  const zoomLayoutRef = useRef(zoomLayout);
  zoomLayoutRef.current = zoomLayout;

  useFrame(() => {
    TWEEN.update();

    if (controlsRef.current && orbitLocked && hasEntered) {
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
    if (isZoomed) setOrbitLocked(false);

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
        if (isZoomed)
          onZoomSettled(true); // só mostra o iframe com a câmera parada
        else setOrbitLocked(true); // de volta ao CAM_IDLE, que já respeita as travas
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
      autoRotate={orbitLocked && hasEntered}
      // Não usar `enabled={false}`: o drei deixa de chamar controls.update() e a câmera
      // para de olhar pro target durante o tween (fica torta). Só bloqueia a rotação manual.
      enableRotate={!isZoomed}
      autoRotateSpeed={rotationSpeedRef.current}
      enableZoom={false}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
      minPolarAngle={orbitLocked ? ORBIT_POLAR : 0}
      maxPolarAngle={orbitLocked ? ORBIT_POLAR : Math.PI}
      minAzimuthAngle={orbitLocked ? Math.PI / 6 : -Infinity}
      maxAzimuthAngle={orbitLocked ? Math.PI / 1.001 : Infinity}
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
                iframeWidth={zoomLayout.iframeWidth}
                iframeHeight={zoomLayout.iframeHeight}
              />
              <Game />
            </group>
            {/* Mesmo HDR do preset "city", reduzido para 256px e servido daqui (o preset baixa 1.5 MB do GitHub) */}
            <Environment files="./hdr/city-256.hdr" />
          </group>
        </Suspense>
      </Canvas>

      <OverlayHUD visible={start && !isZoomed} />

      {start && !isZoomed && (
        <div className="monitor-hint">
          Click on the monitor to explore
          <BiPointer />
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
          <BiArrowBack /> Back
        </button>
      )}

      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  );
}
