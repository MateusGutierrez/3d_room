import { Html } from '@react-three/drei'
import { useEffect, useRef } from 'react'

interface IframeMonitorProps {
  url?: string // URL do site carregado no iframe
}

export function IframeMonitor({
  url = 'https://os.henryheffernan.com/',
}: IframeMonitorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current) return
      const iframe = iframeRef.current
      const { type, clientX, clientY, key } = event.data

      const evt = new CustomEvent(type, { bubbles: true, cancelable: false })

      if (type === 'mousemove') {
        const rect = iframe.getBoundingClientRect()
        const widthRatio = rect.width / 1280 // Ajuste para tamanho do iframe
        const heightRatio = rect.height / 720

        ;(evt as any).clientX = Math.round(clientX * widthRatio + rect.left)
        ;(evt as any).clientY = Math.round(clientY * heightRatio + rect.top)
      } else if (type === 'keydown' || type === 'keyup') {
        ;(evt as any).key = key
      }

      iframe.dispatchEvent(evt)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <Html
      transform
      position={[-0.377, 0.688, 0.622]} // Ajuste para encaixar no monitor
      rotation={[0, Math.PI / 9, 0]} // Rotação para alinhar com a tela
    >
      <iframe
        ref={iframeRef}
        src={url}
        width='400px' // Ajuste para caber na tela do monitor
        height='250px'
        style={{
          border: 'none',
          background: '#1d2e2f',
          opacity: 1,
          pointerEvents: 'auto',
        }}
        title='Monitor Iframe'
      />
    </Html>
  )
}
