import { useContext, useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { IGLTF } from './interface';
import { Context } from '../provider/Provider';

const VIDEO_SRC = './videos/streetf_clideo.mp4';

export function Game() {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  const { start } = useContext(Context);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoTexture = useMemo(() => {
    const video = document.createElement('video');
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'none';
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

  // O vídeo só começa a baixar depois do START: antes disso o quarto nem aparece
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !start) return;
    if (!video.src) video.src = VIDEO_SRC;
    video.play().catch(err => console.error('Error playing video:', err));
  }, [start]);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
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
