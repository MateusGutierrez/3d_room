import { Html, useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react';
import { Color, MeshBasicMaterial, SRGBColorSpace } from 'three';
import { IGLTF } from './interface';
import {
  IFRAME_HEIGHT,
  IFRAME_URL,
  IFRAME_WIDTH,
  SCREEN_CENTER,
  SCREEN_FRAME_POSITION,
  SCREEN_FRAME_ROTATION,
  SCREEN_WIDTH,
} from './screenLayout';

const SCREEN_ON = new Color('#ffffff');
const SCREEN_OFF = new Color('#000000');

// O drei converte px em unidades 3D por `distanceFactor / 400 * scale`,
// então essa escala faz o iframe cobrir exatamente a tela.
const IFRAME_SCALE = (SCREEN_WIDTH * 400) / IFRAME_WIDTH;

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
        <Html
          transform
          position={SCREEN_CENTER}
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
