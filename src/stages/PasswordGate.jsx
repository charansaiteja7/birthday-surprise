import { useState } from 'react';
import { motion } from 'framer-motion';
import { CONTENT } from '../config/content';
import { useAudio } from '../context/AudioContext';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { activate } = useAudio();

  function submit(event) {
    event.preventDefault();
    activate('opening');
    if (password === CONTENT.password.value) {
      setError('');
      onUnlock();
      return;
    }
    setError('Oops! That"s not the secret code. Try again, Birthday Girl! 🎀');
    setPassword('');
  }

  return (
    <section className="screen lock-screen">
      <div className="sparkle-field" />
      <motion.form
        className="lock-card"
        onSubmit={submit}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          className="lock-icon"
          animate={{ rotate: [0, -8, 8, 0], y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔐
        </motion.div>
        <h1>For my Chitti thalli 💖</h1>
        <p>{CONTENT.password.hint}</p>
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            inputMode="numeric"
            aria-label="Password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🫣' : '👁️'}
          </button>
        </div>
        {error && <motion.span className="cute-error" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{error}</motion.span>}
        <button className="primary-btn">Unlock Surprise</button>
      </motion.form>
    </section>
  );
}
