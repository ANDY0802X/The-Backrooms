import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Landing.css';
import { sounds } from '../utils/sound';
import { AVATARS, generateAnonymousIdentity } from '../utils/identity';
import Reveal from './Reveal';

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

  // Cycle avatar left / right
  const handlePrevAvatar = () => {
    sounds.playPop();
    const idx = AVATARS.indexOf(currentAvatar);
    const newIdx = idx <= 0 ? AVATARS.length - 1 : idx - 1;
    if (typeof onUpdateUserProfile === 'function') {
      onUpdateUserProfile({ ...userProfile, avatar: AVATARS[newIdx] });
    }
  };

  const handleNextAvatar = () => {
    sounds.playPop();
    const idx = AVATARS.indexOf(currentAvatar);
    const newIdx = idx >= AVATARS.length - 1 ? 0 : idx + 1;
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

  const handleEnter = () => {
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

  const handleCreate = () => {
    sounds.playSuccess();
    if (typeof onCreateLoungeDirect === 'function') {
      onCreateLoungeDirect();
    } else if (typeof onEnterLounge === 'function') {
      onEnterLounge({ openCreate: true });
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
    <div className="landing-viewport">
      {/* Background Floating Outline Doodles */}
      <div className="doodle-backdrop" aria-hidden="true">
        <div className="floating-doodle" style={{ top: '14%', left: '8%' }}>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="var(--doodle-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 36L6 14L16 24L24 10L32 24L42 14L40 36H8Z" />
            <circle cx="24" cy="9" r="2" fill="var(--doodle-color)" />
          </svg>
        </div>
        <div className="floating-doodle" style={{ top: '56%', left: '6%', animationDelay: '-2s' }}>
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="var(--doodle-color)" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="24" cy="24" r="18" />
            <circle cx="18" cy="20" r="2" fill="var(--doodle-color)" />
            <circle cx="30" cy="20" r="2" fill="var(--doodle-color)" />
            <path d="M16 28C18 33 30 33 32 28" />
          </svg>
        </div>
        <div className="floating-doodle" style={{ bottom: '10%', left: '9%', animationDelay: '-4s' }}>
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="var(--doodle-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 38V22L6 10L18 16C20 15 28 15 30 16L42 10L38 22V38H10Z" />
            <circle cx="18" cy="26" r="1.5" fill="var(--doodle-color)" />
            <circle cx="30" cy="26" r="1.5" fill="var(--doodle-color)" />
            <path d="M22 30L24 32L26 30" />
          </svg>
        </div>
        <div className="floating-doodle" style={{ top: '15%', right: '10%', animationDelay: '-3s' }}>
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="var(--doodle-color)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 34C8 34 6 30 7 26C8 22 12 21 14 21C16 14 26 13 30 18C34 16 40 19 40 24C43 26 42 34 36 34H12Z" />
          </svg>
        </div>
        <div className="floating-doodle" style={{ bottom: '12%', right: '8%', animationDelay: '-5s' }}>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="var(--doodle-color)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M10 18H36V32C36 37 31 41 24 41C17 41 12 37 10 32V18Z" />
            <path d="M36 22H40C42 22 44 24 44 27C44 30 42 32 40 32H36" />
          </svg>
        </div>
      </div>

      {/* Header Bar */}
      <header className="landing-nav">
        <div className="brand-wrapper hover-lift">
          <div className="brand-icon-box">🌌</div>
          <h2 className="brand-title">TheBackrooms</h2>
        </div>

        <div className="nav-actions">
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.94 }}
            className="btn-pill-secondary"
            onClick={() => {
              sounds.playPop();
              if (typeof onToggleTheme === 'function') onToggleTheme();
            }}
            title="Toggle Light / Dark Mode"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.94 }}
            className="btn-pill-secondary"
            onClick={() => {
              sounds.playBoing();
              sounds.toggleAmbient();
            }}
            title="Toggle Ambient Lo-Fi"
          >
            🎵 Lo-Fi
          </motion.button>
        </div>
      </header>

      {/* Center Card Stage with Staggered Scroll Reveals */}
      <main className="landing-stage">
        {/* Top Tag */}
        <Reveal index={0}>
          <div className="backrooms-tag-pill hover-lift">
            <span>✨ CAMPUS DECOMPRESSION LOUNGE</span>
          </div>
        </Reveal>

        {/* Big Title */}
        <Reveal index={1}>
          <h1 className="backrooms-hero-title">The Backrooms</h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal index={2}>
          <p className="backrooms-hero-sub">
            Zero logins. Zero records. Instant anonymous venting & doodle lounges.
          </p>
        </Reveal>

        {/* Centered Neumorphic Card */}
        <Reveal index={3}>
          <div className="backrooms-card-container hover-lift">
            {/* Top Inset Well: Editable Alias */}
            <div className="backrooms-alias-box hover-lift">
              <input
                type="text"
                className="backrooms-alias-input"
                placeholder="Enter your alias..."
                value={displayName}
                onChange={(e) => {
                  if (typeof onUpdateUserProfile === 'function') {
                    onUpdateUserProfile({ ...userProfile, name: e.target.value });
                  }
                }}
                title="Click to customize your alias"
                maxLength={28}
              />
              <span className="backrooms-alias-edit-icon" title="Edit alias">✎</span>
            </div>

            {/* Middle Inset Well: Avatar Orbit Carousel */}
            <div className="backrooms-avatar-stage">
              {/* Top-right Reroll Shuffle Button */}
              <motion.button
                whileHover={{ rotate: 180, scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="backrooms-shuffle-btn"
                onClick={handleReroll}
                title="Shuffle Random Identity"
              >
                🔀
              </motion.button>

              {/* Left Arrow */}
              <motion.button
                whileHover={{ scale: 1.18, x: -2 }}
                whileTap={{ scale: 0.9 }}
                className="backrooms-nav-arrow"
                onClick={handlePrevAvatar}
                title="Previous Avatar"
              >
                ‹
              </motion.button>

              {/* Center Avatar with Golden Glowing Orbit Ring */}
              <div className="backrooms-avatar-orbit">
                <div className="backrooms-orbit-ring">
                  <span className="backrooms-orbit-dot"></span>
                </div>
                <motion.div
                  key={currentAvatar}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="backrooms-avatar-emoji"
                >
                  {currentAvatar}
                </motion.div>
              </div>

              {/* Right Arrow */}
              <motion.button
                whileHover={{ scale: 1.18, x: 2 }}
                whileTap={{ scale: 0.9 }}
                className="backrooms-nav-arrow"
                onClick={handleNextAvatar}
                title="Next Avatar"
              >
                ›
              </motion.button>
            </div>

            {/* Primary Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="backrooms-btn-primary"
              onClick={handleEnter}
            >
              <span>Enter Lounges</span>
              <span className="arrow-glyph">→</span>
            </motion.button>

            {/* Secondary Action Button */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1.5 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="backrooms-btn-secondary"
              onClick={handleCreate}
            >
              <span>+ + Create New Lounge</span>
            </motion.button>

            {/* Optional Join By Room Code toggle */}
            <div className="backrooms-code-join-row">
              <AnimatePresence mode="wait">
                {!showCodeInput ? (
                  <motion.button
                    key="code-link"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="backrooms-code-link"
                    onClick={() => setShowCodeInput(true)}
                  >
                    Have a Room Code? Join directly →
                  </motion.button>
                ) : (
                  <motion.form
                    key="code-form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="backrooms-code-form"
                    onSubmit={handleJoinCodeSubmit}
                  >
                    <input
                      type="text"
                      className="backrooms-code-input"
                      placeholder="e.g. COFFEE or DOODLE"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      maxLength={10}
                      autoFocus
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="backrooms-code-btn"
                    >
                      Join
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="backrooms-code-btn-close"
                      onClick={() => setShowCodeInput(false)}
                    >
                      ✕
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        {/* Bottom Ephemeral Assurance */}
        <Reveal index={4}>
          <p className="backrooms-footer-tag">
            Ephemeral In-Memory • Vanishes when rooms empty • 100% Anonymous
          </p>
        </Reveal>
      </main>

      {/* Subtle Bottom Bar */}
      <footer className="landing-mini-footer">
        <span>TheBackrooms • Campus Ephemeral Sanctuary</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span className="hover-lift">🔒 Zero Trace</span>
          <span className="hover-lift">🎮 5 Multiplayer Games</span>
          <span className="hover-lift">⚡ Live WebRTC Mesh</span>
        </div>
      </footer>
    </div>
  );
}
