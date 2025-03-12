import React, { Suspense, useState, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
  Stats,
} from '@react-three/drei'
import TWEEN from '@tweenjs/tween.js'
import points from './points.json'

interface Props {
  controls: React.RefObject<any>
}

export function Points({ controls }: Props) {
  const { camera } = useThree()
  const [selected, setSelected] = useState(-1)

  return (
    <>
      {points.map((a, i) => {
        return (
          <Html key={i} position={[a.lookAt.x, a.lookAt.y, a.lookAt.z]}>
            <svg
              height='34'
              width='34'
              transform='translate(-16 -16)'
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx='17'
                cy='17'
                r='16'
                stroke='white'
                strokeWidth='2'
                fill='rgba(0,0,0,.66)'
                onPointerDown={() => {
                  console.log(controls.current, 'controls')
                  setSelected(i)
                  // change target
                  new TWEEN.Tween(controls.current.target)
                    .to(
                      {
                        x: a.lookAt.x,
                        y: a.lookAt.y,
                        z: a.lookAt.z,
                      },
                      1000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .start()

                  // change camera position
                  new TWEEN.Tween(camera.position)
                    .to(
                      {
                        x: a.camPos.x,
                        y: a.camPos.y,
                        z: a.camPos.z,
                      },
                      1000
                    )
                    .easing(TWEEN.Easing.Cubic.Out)
                    .start()
                }}
              />
              <text
                x='12'
                y='22'
                fill='white'
                fontSize={17}
                fontFamily='monospace'
                style={{ pointerEvents: 'none' }}
              >
                {i + 1}
              </text>
            </svg>
            {a.description && i === selected && (
              <div
                id={'desc_' + i}
                className='annotationDescription'
                dangerouslySetInnerHTML={{ __html: a.description }}
              />
            )}
          </Html>
        )
      })}
    </>
  )
}
