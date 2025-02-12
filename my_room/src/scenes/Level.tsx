import React from 'react';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useControls } from 'leva';
import { Color } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { IGLTF } from './interface';

export function Level() {
  const { nodes } = useGLTF('./models/room-draco.glb') as unknown as IGLTF;
  return (
    <mesh
      geometry={nodes.Level.geometry}
      material={nodes.Level.material}
      position={[-0.38, 0.69, 0.62]}
      rotation={[Math.PI / 2, -Math.PI / 9, 0]}
    />
  );
}
