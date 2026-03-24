import { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
}

function useTypewriter(text: string, speed = 40, delay = 0, enabled = true) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!enabled) return;

    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const startTimeout = setTimeout(() => {
      const type = () => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
          timeout = setTimeout(type, speed);
        }
      };
      type();
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, [text, speed, delay, enabled]);

  return displayed;
}

function Clock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time}</span>;
}

export function OverlayHUD({ visible }: Props) {
  const name = useTypewriter('Mateus Maia Gutierrez', 50, 800, visible);
  const role = useTypewriter('Software Engineer', 50, 2200, visible);
  const [showClock, setShowClock] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => setShowClock(true), 3400);
    return () => clearTimeout(timeout);
  }, [visible]);

  return (
    <div className={`hud ${visible ? 'hud--visible' : 'hud--hidden'}`}>
      <div className="hud__line hud__name">
        {name}
        {name.length < 'Mateus Maia Gutierrez'.length && <span className="hud__cursor" />}
      </div>
      <div className="hud__line hud__role">
        {role}
        {role.length > 0 && role.length < 'Software Engineer'.length && (
          <span className="hud__cursor" />
        )}
      </div>
      {showClock && (
        <div className="hud__line hud__clock">
          <Clock />
        </div>
      )}
    </div>
  );
}
