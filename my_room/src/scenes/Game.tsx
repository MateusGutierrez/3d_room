import { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { IGLTF } from './interface';

export function Game() {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoTexture = useMemo(() => {
    const video = document.createElement('video');
    video.src = './videos/streetf_clideo.mp4';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(7, 9);
    texture.offset.set(2.5, 2.44);
    texture.rotation = Math.PI / 2;

    return texture;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => console.error('Error playing video:', err));
    }

    return () => {
      if (video) {
        video.pause();
        video.src = '';
      }
      videoTexture.dispose();
    };
  }, [videoTexture]);

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.game.geometry}
        material={materials.Level}
        position={[-0.377, 0.688, 0.62]}
        rotation={[Math.PI / 2, -Math.PI / 9, 0]}
      >
        <meshBasicMaterial map={videoTexture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
