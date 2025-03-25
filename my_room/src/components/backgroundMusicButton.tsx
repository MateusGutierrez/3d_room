import { useState, useEffect, useRef } from 'react'

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error('Erro ao reproduzir áudio:', error))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  return (
    <>
      {/* Elemento de áudio */}
      <audio ref={audioRef} loop>
        <source src='/mp3/fly.mp3' type='audio/mp3' />
      </audio>

      {/* Botão no canto superior direito */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          position: 'absolute',
          zIndex: 99999,
          top: '20px',
          right: '20px',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        {isPlaying ? '🔊 Desligar Música' : '🔇 Ligar Música'}
      </button>
    </>
  )
}
