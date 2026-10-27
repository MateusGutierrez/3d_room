import { useProgress } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';

interface Props {
  started: boolean;
  onStarted: () => void;
}

const BOOT_LINES = [
  { text: 'Initializing GPU drivers... OK', delay: 400 },
  { text: 'Detecting display adapter... WebGL 2.0', delay: 600 },
  { text: 'Checking RAM: 16384 OK', delay: 300 },
  { text: '', delay: 200 },
  { text: 'Loading resources:', delay: 400 },
];

const RESOURCE_NAMES = [
  'room-draco.glb',
  'monitor-frame.png',
  'preview-xp.webp',
  'city-256.hdr',
  'streetf_clideo.mp4',
  'lofi.mp3',
];

// Pausa antes das linhas de boot (o cabeçalho já aparece pronto, vindo do index.html)
const BOOT_START_DELAY = 600;

export const LoadingScreen = ({ started, onStarted }: Props) => {
  const { progress, active } = useProgress();
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [resourceLogs, setResourceLogs] = useState<string[]>([]);
  const [bootDone, setBootDone] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const bootStarted = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  // Boot sequence lines
  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;

    let totalDelay = BOOT_START_DELAY;
    BOOT_LINES.forEach((line, i) => {
      totalDelay += line.delay;
      setTimeout(() => {
        setBootLines(prev => [...prev, line.text]);
        if (i === BOOT_LINES.length - 1) setBootDone(true);
      }, totalDelay);
    });
  }, []);

  // Resource loading logs based on real progress
  useEffect(() => {
    if (!bootDone) return;

    const totalResources = RESOURCE_NAMES.length;
    const loaded = Math.floor((progress / 100) * totalResources);

    const newLogs: string[] = [];
    for (let i = 0; i < loaded; i++) {
      const name = RESOURCE_NAMES[i];
      const dots = '.'.repeat(Math.max(1, 30 - name.length));
      newLogs.push(`  ${name} ${dots} OK`);
    }

    if (loaded < totalResources && progress < 100) {
      const current = RESOURCE_NAMES[loaded];
      const dots = '.'.repeat(Math.max(1, 30 - current.length));
      newLogs.push(`  ${current} ${dots} ${Math.round(progress)}%`);
    }

    setResourceLogs(newLogs);
  }, [progress, bootDone]);

  // All loaded detection
  useEffect(() => {
    if (progress >= 100 && !active && bootDone) {
      const timeout = setTimeout(() => setAllLoaded(true), 600);
      return () => clearTimeout(timeout);
    }
  }, [progress, active, bootDone]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [bootLines, resourceLogs]);

  const loadedCount = Math.floor((progress / 100) * RESOURCE_NAMES.length);

  return (
    <div className={`bios ${started ? 'bios--started' : ''}`}>
      <div className="bios__screen">
        <div className="bios__content" ref={logRef}>
          {/* Header: igual à marcação estática do public/index.html (é o LCP da página) */}
          <div className="bios__header">
            <div className="bios__title">
              Mateus, Inc. Portfolio BIOS v1.0
              <br />
              <span className="bios__subtitle">Copyright (C) Mateus Maia Gutierrez</span>
            </div>
            <span className="bios__date">Released: {today}</span>
          </div>

          <div className="bios__separator" />

          {/* Boot lines */}
          {bootLines.map((line, i) => (
            <div key={i} className="bios__line">
              {line}
            </div>
          ))}

          {/* Resource logs */}
          {resourceLogs.map((log, i) => (
            <div key={`res-${i}`} className="bios__line bios__line--resource">
              {log}
            </div>
          ))}

          {/* Loading counter */}
          {bootDone && !allLoaded && (
            <div className="bios__line bios__line--loading">
              <br />
              LOADING RESOURCES ({loadedCount}/{RESOURCE_NAMES.length})
              <span className="bios__dots" />
            </div>
          )}

          {/* Finished message */}
          {allLoaded && (
            <div className="bios__finished">
              <br />
              <div className="bios__line bios__line--success">FINISHED LOADING RESOURCES</div>
              <div className="bios__line">
                All content loaded. Launching &apos;3D Portfolio Showcase&apos; V1.0
              </div>
            </div>
          )}
        </div>

        {/* Start button */}
        {allLoaded && (
          <div className="bios__start-container">
            <div className="bios__start-prompt">
              Click start to begin
              <span className="bios__cursor" />
            </div>
            <button className="bios__start-btn" onClick={onStarted}>
              START
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="bios__footer">
          <span>Press DEL to enter SETUP, ESC to skip memory test</span>
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
};
