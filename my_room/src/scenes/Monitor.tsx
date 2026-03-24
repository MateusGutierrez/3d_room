import { Html, useGLTF, useTexture } from '@react-three/drei';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { IGLTF } from './interface';

interface Props {
  isZoomed: boolean;
  setIsZoomed: Dispatch<SetStateAction<boolean>>;
  setHovered: (value: boolean) => void;
}

export function Monitor({ setHovered, setIsZoomed, isZoomed }: Props) {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  const [iframeMounted, setIframeMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const screenTexture = useTexture('./img/preview.png');
  screenTexture.anisotropy = 16;
  screenTexture.repeat.set(6, 2);

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
        geometry={nodes.monitor.geometry}
        material={materials.Level}
        position={[-0.38, 0.69, 0.62]}
        rotation={[Math.PI / 2, -Math.PI / 9, 0]}
      >
        {!isZoomed && <meshBasicMaterial map={screenTexture} />}
      </mesh>
      <Html
        transform
        position={[0.204, 0.855, 0]}
        rotation={[Math.PI / 40, -Math.PI / 1, 0]}
        scale={0.18}
        distanceFactor={1}
        wrapperClass="wrapper"
        occlude
      >
        {iframeMounted && (
          <div
            className="wrapper"
            style={{ opacity: isZoomed ? 1 : 0, transition: 'opacity 0.4s ease' }}
            onPointerDown={e => e.stopPropagation()}
          >
            <iframe
              ref={iframeRef}
              src="https://winxp.vercel.app/"
              width="100%"
              height="100%"
              loading="lazy"
              title="Windows XP Portfolio"
            />
          </div>
        )}
      </Html>
    </group>
  );
}
