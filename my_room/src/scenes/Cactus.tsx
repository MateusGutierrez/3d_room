import React from 'react'
import * as THREE from 'three'
import { useEffect, useState } from 'react'
import { MeshWobbleMaterial, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Color } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { useSpring, a } from '@react-spring/three'
import { IGLTF } from './interface'

export function Cactus() {
    const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF
    return (
      <mesh geometry={nodes.Cactus.geometry} position={[-0.42, 0.51, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <MeshWobbleMaterial factor={0.4} map={materials.Cactus.map} />
      </mesh>
    )
  }