import {
  Html,
  PresentationControls,
  useGLTF,
  useTexture,
} from '@react-three/drei'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { Loader } from '@react-three/drei'

interface Props {
  isZoomed: boolean
  setIsZoomed: Dispatch<SetStateAction<boolean>>
  setHovered: (value: boolean) => void
  hovered: boolean
}

export function Monitor({ setHovered, hovered, setIsZoomed, isZoomed }: Props) {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as any

  // Carrega a textura da imagem
  const screenTexture = useTexture('./img/preview.png') // Substitua pelo caminho da sua imagem
  screenTexture.anisotropy = 16
  screenTexture.repeat.set(6, 2)

  return (
    <>
      <group
        dispose={null}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation() // Evita que o clique passe para o fundo
          setIsZoomed(true) // Ativa o zoom
        }}
      >
        <mesh
          geometry={nodes.monitor.geometry}
          material={materials.Level}
          position={[-0.38, 0.69, 0.62]}
          rotation={[Math.PI / 2, -Math.PI / 9, 0]}
          scale={[1, 1, 1]} // 95% largura, 90% altura, 100% profundidade
        >
          {!isZoomed && <meshBasicMaterial map={screenTexture} />}
        </mesh>
        <PresentationControls>
          <Html
            transform
            position={[0.204, 0.855, 0]} // Ajuste para encaixar na tela
            rotation={[Math.PI / 40, -Math.PI / 1, 0]} // Alinhado com a tela
            scale={0.18} // Ajuste para caber na tela do monitor
            distanceFactor={1}
            wrapperClass='wrapper'
            occlude
          >
            {isZoomed && (
              <div
                className='wrapper'
                onPointerDown={(e) => e.stopPropagation()}
              >
                <iframe
                  src='https://os.henryheffernan.com/'
                  width='100%'
                  height='100%'
                />
              </div>
            )}
          </Html>
        </PresentationControls>
      </group>
    </>
  )
}
