import { useState, useEffect, useRef } from 'react';
import { TbMusic, TbMusicOff } from 'react-icons/tb';

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error('Erro ao reproduzir áudio:', error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <>
      {/* Elemento de áudio */}
      {/* preload none: o mp3 (1.5 MB) só baixa quando a pessoa liga a música */}
      <audio ref={audioRef} loop preload="none">
        <source src="./mp3/lofi.mp3" type="audio/mp3" />
      </audio>

      {/* Botão no canto superior direito */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="music_button"
        aria-label={isPlaying ? 'Mute background music' : 'Play background music'}
      >
        {isPlaying ? <TbMusic className="icon_sound" /> : <TbMusicOff className="icon_sound" />}
      </button>
    </>
  );
}
