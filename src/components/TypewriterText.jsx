import { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 50, onComplete, className = '' }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <p className={`typewriter-text ${done ? 'done' : ''} ${className}`}>
      {displayed}
      {!done && <span className="cursor-blink">|</span>}
    </p>
  );
}
