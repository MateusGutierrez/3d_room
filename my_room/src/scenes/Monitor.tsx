import { Html, useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react';
import { Color, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { IGLTF } from './interface';
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  IFRAME_HEIGHT,
  IFRAME_URL,
  IFRAME_WIDTH,
  SCREEN_CENTER,
  SCREEN_FRAME_POSITION,
  SCREEN_FRAME_ROTATION,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './screenLayout';

const SCREEN_ON = new Color('#ffffff');
const SCREEN_OFF = new Color('#000000');

// O drei converte px em unidades 3D por `distanceFactor / 400 * scale`,
// então essa escala faz o iframe cobrir exatamente o vão da moldura.
const IFRAME_SCALE = (VIEW_WIDTH * 400) / IFRAME_WIDTH;

// Moldura, reflexo e iframe ficam um pouco à frente da tela (+z aponta pra câmera neste referencial)
const [CENTER_X, CENTER_Y, CENTER_Z] = SCREEN_CENTER;
const FRAME_Z = CENTER_Z + 0.004;
const GLARE_Z = CENTER_Z + 0.002;
// Reflexo do vidro: só um toque, para perceber que há vidro sem atrapalhar a imagem
const GLARE_OPACITY = 0.07;

interface Props {
  isZoomed: boolean;
  setIsZoomed: Dispatch<SetStateAction<boolean>>;
  setHovered: (value: boolean) => void;
  zoomSettled: boolean;
  /** Em tela cheia o iframe é renderizado fora do 3D (index.tsx), então aqui não monta */
  fullscreen: boolean;
}

export function Monitor({ setHovered, setIsZoomed, isZoomed, zoomSettled, fullscreen }: Props) {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  const [iframeMounted, setIframeMounted] = useState(false);

  const screenTexture = useTexture('./img/preview-xp.png');
  useMemo(() => {
    screenTexture.anisotropy = 16;
    screenTexture.colorSpace = SRGBColorSpace;
  }, [screenTexture]);

  const [frameTexture, glareTexture] = useTexture([
    './img/monitor-frame.png',
    './img/monitor-glare.png',
  ]);
  useMemo(() => {
    for (const texture of [frameTexture, glareTexture]) {
      texture.anisotropy = 16;
      texture.colorSpace = SRGBColorSpace;
    }
  }, [frameTexture, glareTexture]);

  // As UVs originais da tela apontam para um pedaço minúsculo do atlas "baked" e estão giradas 90°.
  // Aqui elas são remapeadas para 0..1, para a imagem ocupar a tela inteira na orientação certa.
  const screenGeometry = useMemo(() => {
    const geometry = nodes.monitor.geometry.clone();
    const uv = geometry.attributes.uv;
    let minU = Infinity,
      maxU = -Infinity,
      minV = Infinity,
      maxV = -Infinity;
    for (let i = 0; i < uv.count; i++) {
      minU = Math.min(minU, uv.getX(i));
      maxU = Math.max(maxU, uv.getX(i));
      minV = Math.min(minV, uv.getY(i));
      maxV = Math.max(maxV, uv.getY(i));
    }
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      // V original corre na horizontal (invertido), U original corre na vertical (invertido)
      uv.setXY(i, (maxV - v) / (maxV - minV), (maxU - u) / (maxU - minU));
    }
    uv.needsUpdate = true;
    return geometry;
  }, [nodes.monitor.geometry]);

  // A cor multiplica a textura: branco = preview visível, preto = tela "desligada".
  // Escurece junto com o fade-in do iframe, assim o preview não aparece por trás dele.
  const screenMaterialRef = useRef<MeshBasicMaterial>(null);
  useFrame((_, delta) => {
    const material = screenMaterialRef.current;
    if (!material) return;
    const target = zoomSettled ? SCREEN_OFF : SCREEN_ON;
    material.color.lerp(target, 1 - Math.exp(-delta * 12));
  });

  // Monta o iframe apenas na primeira vez que zoom é ativado, e mantém montado depois
  if (isZoomed && !iframeMounted) {
    setIframeMounted(true);
  }

  return (
    <group
      dispose={null}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={e => {
        e.stopPropagation();
        setIsZoomed(true);
      }}
    >
      <mesh
        geometry={screenGeometry}
        material={materials.Level}
        position={[-0.38, 0.69, 0.62]}
        rotation={[Math.PI / 2, -Math.PI / 9, 0]}
      >
        {/* material sempre presente: sem troca = sem piscada. A cor é animada no useFrame */}
        <meshBasicMaterial ref={screenMaterialRef} map={screenTexture} toneMapped={false} />
      </mesh>

      {/* Referencial do iframe: alinhado com a tela, fora da rotação da malha */}
      <group position={SCREEN_FRAME_POSITION} rotation={SCREEN_FRAME_ROTATION}>
        {/* O iframe (HTML) é desenhado por cima do canvas, então o reflexo só aparece sobre a prévia */}
        <mesh position={[CENTER_X, CENTER_Y, GLARE_Z]}>
          <planeGeometry args={[VIEW_WIDTH, VIEW_HEIGHT]} />
          <meshBasicMaterial
            map={glareTexture}
            transparent
            opacity={GLARE_OPACITY}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* A moldura fica em volta do vão, então continua visível com o iframe aberto */}
        <mesh position={[CENTER_X, CENTER_Y, FRAME_Z]}>
          <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
          <meshBasicMaterial map={frameTexture} transparent alphaTest={0.01} toneMapped={false} />
        </mesh>

        <Html
          transform
          // Mesmo plano da moldura: em perspectiva, o vão e o iframe ficam sempre do mesmo tamanho
          position={[CENTER_X, CENTER_Y, FRAME_Z]}
          scale={IFRAME_SCALE}
          distanceFactor={1}
          wrapperClass="wrapper"
          zIndexRange={[10, 0]}
          pointerEvents={zoomSettled ? 'auto' : 'none'}
        >
          {iframeMounted && !fullscreen && (
            <div
              className="wrapper"
              style={{
                width: IFRAME_WIDTH,
                height: IFRAME_HEIGHT,
                borderRadius: 0,
                opacity: zoomSettled ? 1 : 0,
                pointerEvents: zoomSettled ? 'auto' : 'none',
                transition: 'opacity 0.3s ease',
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              <iframe src={IFRAME_URL} title="Windows XP Portfolio" />
            </div>
          )}
        </Html>
      </group>
    </group>
  );
}
