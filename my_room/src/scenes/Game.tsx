import { useGLTF } from '@react-three/drei'
import { IGLTF } from './interface'

interface Props {
  setHovered: (value: boolean) => void
}

export function Game({ setHovered }: Props) {
  const { nodes, materials } = useGLTF(
    './models/room-draco.glb'
  ) as unknown as IGLTF
  return (
    <group
      dispose={null}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh
        geometry={nodes.game.geometry}
        material={materials.Level}
        position={[-0.377, 0.688, 0.62]}
        rotation={[Math.PI / 2, -Math.PI / 9, 0]}
      />
    </group>
  )
}
