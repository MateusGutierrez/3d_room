import { Html, useGLTF } from '@react-three/drei'
import { IframeMonitor } from '../components/iFrameMonitor'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
interface Props {
  setHovered: (value: boolean) => void
  hovered: boolean
  isZoomed: boolean
  setIsZoomed: (value: boolean) => void
}

export function Monitor({ setHovered, hovered, setIsZoomed, isZoomed }: Props) {
  const { nodes, materials } = useGLTF('./models/room-draco.glb') as any

  return (
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
      />
      {/* Iframe na tela do monitor */}
      {isZoomed && (
        <Html
          transform
          position={[-5.95, -1, 4.5]} // Ajuste para encaixar na tela
          rotation={[Math.PI / 40, -Math.PI / 1, 0]} // Alinhado com a tela
          scale={0.5} // Ajuste para caber na tela do monitor
        >
          <div
            style={{
              width: '1050px',
              height: '500px',
              border: '2px solid black',
              zIndex: '10000',
              borderRadius: '16px',
            }}
          >
            <iframe
              src='https://os.henryheffernan.com/'
              width='100%'
              height='100%'
              style={{ border: 'none' }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
