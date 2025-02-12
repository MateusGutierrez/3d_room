import React from 'react'
import * as THREE from 'three'
import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Color } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { useSpring, a } from '@react-spring/three'
import { IGLTF } from './interface'

export function Sudo() {
    const { nodes, materials } = useGLTF('./models/room-draco.glb') as unknown as IGLTF
    const [spring, api] = useSpring(() => ({ rotation: [Math.PI / 2, 0, 0.29], config: { friction: 40 } }), [])
    useEffect(() => {
      let timeout: any
      const wander = () => {
        api.start({ rotation: [Math.PI / 2 + THREE.MathUtils.randFloatSpread(2) * 0.3, 0, 0.29 + THREE.MathUtils.randFloatSpread(2) * 0.2] })
        timeout = setTimeout(wander, (1 + Math.random() * 2) * 800)
      }
      wander()
      return () => clearTimeout(timeout)
    }, [])
    return (
      <>
        <mesh geometry={nodes.Sudo.geometry} material={materials.Level} position={[0.68, 0.33, -0.67]} rotation={[Math.PI / 2, 0, 0.29]} />
        <a.mesh geometry={nodes.SudoHead.geometry} material={materials.Level} position={[0.68, 0.33, -0.67]} {...spring}/>
      </>
    )
  }