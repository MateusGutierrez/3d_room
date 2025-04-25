import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { IGLTF } from './interface';

export function Camera() {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  const [spring, api] = useSpring(() => ({ 'rotation-z': 0, config: { friction: 40 } }), []);
  useEffect(() => {
    let timeout: any;
    const wander = () => {
      api.start({ 'rotation-z': Math.random() });
      timeout = setTimeout(wander, (1 + Math.random() * 2) * 800);
    };
    wander();
    return () => clearTimeout(timeout);
  }, []);
  return (
    <a.group position={[-0.58, 0.83, -0.03]} rotation={[Math.PI / 2, 0, 0.47]} {...spring}>
      <mesh geometry={nodes.Camera.geometry} material={nodes.Camera.material} />
      <mesh geometry={nodes.Camera_1.geometry} material={materials.Lens} />
    </a.group>
  );
}
