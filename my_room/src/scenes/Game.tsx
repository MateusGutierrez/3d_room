import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { IGLTF } from './interface';

interface Props {
  setHovered: (value: boolean) => void;
}

export function Game({ setHovered }: Props) {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const video = document.createElement('video');
  video.src = './videos/streetf_clideo.mp4';
  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';

  video.play().catch(err => console.error('Erro ao reproduzir o vídeo:', err));

  // Criar textura do vídeo
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.flipY = false; // 🔥 Inverte a textura para corrigir a orientação
  videoTexture.needsUpdate = true;

  // Ajustar propriedades da textura para evitar zoom
  videoTexture.wrapS = THREE.RepeatWrapping;
  videoTexture.wrapT = THREE.RepeatWrapping;
  videoTexture.repeat.set(7, 9); // 🔥 Zoom out (reduz escala da textura)
  videoTexture.offset.set(2.5, 2.44);
  videoTexture.rotation = Math.PI / 2;

  // Armazenar a textura na ref
  videoTexture.needsUpdate = true;

  // Armazena a textura na ref
  textureRef.current = videoTexture;

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.game.geometry}
        material={materials.Level}
        position={[-0.377, 0.688, 0.62]}
        rotation={[Math.PI / 2, -Math.PI / 9, 0]} // Ajuste fino pode ser necessário
      >
        {textureRef.current && (
          <meshBasicMaterial
            map={textureRef.current}
            toneMapped={false}
            side={THREE.DoubleSide} // Garante que a textura apareça dos dois lados
          />
        )}
      </mesh>
    </group>
  );
}
