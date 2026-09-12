import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Landing.css';
import { sounds } from '../utils/sound';
import { AVATARS, generateAnonymousIdentity } from '../utils/identity';

export default function Landing({
  onEnterLounge,
  onCreateLoungeDirect,
  onJoinByCode,
  userProfile = {},
  onUpdateUserProfile,
  onRerollProfile,
  theme = 'dark',
  onToggleTheme
}) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const displayName = userProfile?.name !== undefined ? userProfile.name : '';
  const currentAvatar = userProfile?.avatar || '😴';

  // Cycle avatar
  const handleCycleAvatar = () => {
    sounds.playPop();
    const idx = AVATARS.indexOf(currentAvatar);
    const newIdx = (idx + 1) % AVATARS.length;
    if (typeof onUpdateUserProfile === 'function') {
      onUpdateUserProfile({ ...userProfile, avatar: AVATARS[newIdx] });
    }
  };

  const handleReroll = () => {
    sounds.playBoing();
    if (typeof onRerollProfile === 'function') {
      onRerollProfile();
    }
  };

  const handleEnter = (e) => {
    if (e) e.preventDefault();
    sounds.playChime();
    if (!userProfile?.name?.trim()) {
      const generated = generateAnonymousIdentity();
      if (typeof onUpdateUserProfile === 'function') {
        onUpdateUserProfile({ ...userProfile, name: generated.name });
      }
    }
    if (typeof onEnterLounge === 'function') {
      onEnterLounge();
    }
  };

  const handleJoinCodeSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    sounds.playSuccess();
    if (typeof onJoinByCode === 'function') {
      onJoinByCode(inputCode.trim());
    }
  };

  return (
    <div className="landing-shell">
      {/* Ambient Backdrop */}
      <div className="landing-ambient-canvas" aria-hidden="true">
        <div className="landing-radial-glow"></div>
        <div className="landing-dot-grid"></div>
      </div>

      {/* Minimal Top Navigation */}
      <header className="landing-header">
        <div className="landing-brand">
          <span className="brand-dot"></span>
          <span className="brand-name">TheBackrooms</span>
        </div>

        <div className="landing-header-controls">
          <button
            type="button"
            className="quiet-icon-btn"
            onClick={() => {
              sounds.playPop();
              if (typeof onToggleTheme === 'function') onToggleTheme();
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            className="quiet-icon-btn"
            onClick={() => {
              sounds.playBoing();
              sounds.toggleAmbient();
            }}
            title="Toggle Ambient Lo-Fi"
            aria-label="Toggle Ambient Music"
          >
            🎵
          </button>
        </div>
      </header>

      {/* Main Focus Area: Headline, One Input, One Primary Action */}
      <main className="landing-center-stage">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="landing-hero-block"
        >
          <div className="landing-kicker font-mono">
            <span>EPHEMERAL CAMPUS SANCTUARY</span>
          </div>

          <h1 className="landing-headline">
            A quieter space to unwind.
          </h1>

          <p className="landing-subhead">
            Zero logins. Anonymous student lounges to vent freely, co-draw on a shared canvas, and play low-stakes games. Everything disappears when the room empties.
          </p>
        </motion.div>

        {/* Unified Identity Card (Linear / Apple Minimalism) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="landing-action-card"
        >
          <form onSubmit={handleEnter} className="landing-entry-form">
            {/* Unified Identity Input Row */}
            <div className="identity-input-wrapper">
              <button
                type="button"
                className="avatar-bubble-trigger"
                onClick={handleCycleAvatar}
                title="Click to cycle avatar"
                aria-label="Cycle avatar emoji"
              >
                <span className="avatar-emoji">{currentAvatar}</span>
              </button>

              <div className="alias-field-container">
                <input
                  type="text"
                  className="alias-text-input"
                  placeholder="Choose an alias or stay random..."
                  value={displayName}
                  onChange={(e) => {
                    if (typeof onUpdateUserProfile === 'function') {
                      onUpdateUserProfile({ ...userProfile, name: e.target.value });
                    }
                  }}
                  maxLength={24}
                  title="Your temporary anonymous alias"
                />
              </div>

              <button
                type="button"
                className="shuffle-alias-btn"
                onClick={handleReroll}
                title="Generate new random identity"
                aria-label="Shuffle random identity"
              >
                🎲
              </button>
            </div>

            {/* Single Clear Primary Action Button */}
            <button
              type="submit"
              className="primary-enter-btn"
            >
              <span>Enter Lounges</span>
              <span className="btn-arrow" aria-hidden="true">→</span>
            </button>
          </form>

          {/* Discreet Secondary: Join by Room Code */}
          <div className="secondary-code-dock">
            <AnimatePresence mode="wait">
              {!showCodeInput ? (
                <button
                  type="button"
                  className="code-toggle-link font-mono"
                  onClick={() => setShowCodeInput(true)}
                >
                  Have a room code? Join by #code →
                </button>
              ) : (
                <motion.form
                  key="room-code-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-code-form"
                  onSubmit={handleJoinCodeSubmit}
                >
                  <input
                    type="text"
                    className="inline-code-input font-mono"
                    placeholder="e.g. COFFEE or DOODLE"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength={10}
                    autoFocus
                  />
                  <button type="submit" className="inline-code-submit font-mono">
                    Join
                  </button>
                  <button
                    type="button"
                    className="inline-code-cancel"
                    onClick={() => setShowCodeInput(false)}
                    aria-label="Cancel code entry"
                  >
                    ✕
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quiet Ephemeral Assurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="landing-reassurance font-mono"
        >
          🔒 In-memory state only • No accounts • No persistent records
        </motion.p>
      </main>

      {/* Quiet Minimal Footer */}
      <footer className="landing-footer font-mono">
        <span>TheBackrooms</span>
        <span>•</span>
        <span>Zero-trace student decompression</span>
      </footer>
    </div>
  );
}
