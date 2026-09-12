import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Lobby.css';
import { sounds } from '../utils/sound';
import Reveal from './Reveal';

const CATEGORIES = ['All', 'General', 'Study', 'Rant', 'Art', 'Mini-Game'];

const GAME_OPTIONS = [
  { id: 'scribble', name: '🎨 Campus Scribble (Speed Pictionary)' },
  { id: 'trivia', name: '⚡ Campus Trivia Blitz (14s Countdown)' },
  { id: 'wordchain', name: '🔗 Rapid Word Chain (Combo Builder)' },
  { id: 'emojipop', name: '💥 Emoji Pop Reflex (Fast Reaction)' },
  { id: 'truthvent', name: '🎭 Truth, Vent & Dare (Confessions)' }
];

export default function Lobby({
  rooms = [],
  userProfile,
  onUpdateUserProfile,
  onRerollProfile,
  onJoinRoom,
  onJoinRoomByCode,
  onCreateRoom,
  onBackToLanding,
  theme = 'dark',
  onToggleTheme,
  socket
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // New room modal state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('General');
  const [newRoomGame, setNewRoomGame] = useState('scribble');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomTags, setNewRoomTags] = useState('');

  const filteredRooms = rooms.filter(room => {
    const matchesCat = selectedCategory === 'All' || room.category === selectedCategory;
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.code && room.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.tags && room.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    sounds.playSuccess();
    onCreateRoom({
      name: newRoomName.trim(),
      code: newRoomCode.trim().toUpperCase() || undefined,
      category: newRoomCategory,
      selectedGame: newRoomGame,
      description: newRoomDesc.trim() || 'A chill space to decompress.',
      tags: newRoomTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    setIsModalOpen(false);
    setNewRoomName('');
    setNewRoomCode('');
    setNewRoomDesc('');
    setNewRoomTags('');
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    sounds.playSuccess();
    if (typeof onJoinRoomByCode === 'function') {
      onJoinRoomByCode(joinCodeInput.trim().toUpperCase());
    }
  };

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      sounds.playPop();
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {}
  };

  const getGameLabel = (gameType) => {
    switch (gameType) {
      case 'trivia': return '⚡ Trivia Blitz';
      case 'wordchain': return '🔗 Word Chain';
      case 'emojipop': return '💥 Emoji Pop';
      case 'truthvent': return '🎭 Truth & Vent';
      case 'scribble':
      default: return '🎨 Scribble';
    }
  };

  const getRoomIcon = (gameType, category) => {
    // Chat bubble — vent/general/rant rooms
    if (category === 'Rant' || gameType === 'truthvent') {
      return (
        <svg className="room-type-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8h36a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H16l-8 8V10a2 2 0 0 1 2-2z" />
          <line x1="14" y1="18" x2="34" y2="18" />
          <line x1="14" y1="26" x2="26" y2="26" />
        </svg>
      );
    }
    // Brush — art/doodle/scribble rooms
    if (category === 'Art' || gameType === 'scribble') {
      return (
        <svg className="room-type-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M36 6l6 6-24 24-8 2 2-8L36 6z" />
          <path d="M30 12l6 6" />
          <path d="M6 40c4-2 8-1 10 2" strokeDasharray="3 2" />
        </svg>
      );
    }
    // Question mark — trivia rooms
    if (gameType === 'trivia') {
      return (
        <svg className="room-type-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="18" />
          <path d="M18 19c0-3.3 2.7-6 6-6s6 2.7 6 6c0 4-6 5-6 10" />
          <circle cx="24" cy="37" r="1.5" fill="currentColor" />
        </svg>
      );
    }
    // Chain link — word chain rooms
    if (gameType === 'wordchain') {
      return (
        <svg className="room-type-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 30l-4 4a6 6 0 0 1-8.5-8.5l8-8A6 6 0 0 1 22 20" />
          <path d="M30 18l4-4a6 6 0 0 1 8.5 8.5l-8 8A6 6 0 0 1 26 28" />
        </svg>
      );
    }
    // Controller — emojipop / arcade / mini-game rooms
    if (gameType === 'emojipop' || category === 'Mini-Game') {
      return (
        <svg className="room-type-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="16" width="36" height="22" rx="8" />
          <line x1="16" y1="22" x2="16" y2="32" />
          <line x1="11" y1="27" x2="21" y2="27" />
          <circle cx="32" cy="22" r="2" fill="currentColor" />
          <circle cx="38" cy="27" r="2" fill="currentColor" />
          <circle cx="32" cy="32" r="2" fill="currentColor" />
          <circle cx="26" cy="27" r="2" fill="currentColor" />
        </svg>
      );
    }
    // Default — couch/sofa for general/study
    return (
      <svg className="room-type-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 28V20a4 4 0 0 1 8 0v4h20v-4a4 4 0 0 1 8 0v8" />
        <rect x="4" y="28" width="40" height="8" rx="3" />
        <line x1="12" y1="36" x2="12" y2="42" />
        <line x1="36" y1="36" x2="36" y2="42" />
      </svg>
    );
  };

  return (
    <div className="lobby-container">
      {/* Header */}
      <header className="lobby-header-bar">
        <div className="lobby-brand hover-lift" onClick={onBackToLanding} title="Back to home">
          <div className="brand-icon-box" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>🌌</div>
          <h2 className="brand-title">TheBackrooms</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.94 }}
            className="btn-pill-secondary"
            onClick={() => {
              sounds.playPop();
              onToggleTheme();
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.94 }}
            className="btn-pill-secondary"
            onClick={onBackToLanding}
            title="Back to landing"
          >
            ← Back
          </motion.button>
        </div>
      </header>

      {/* Identity Card */}
      <Reveal index={0}>
        <section className="identity-banner glass-panel hover-lift" style={{ '--user-color': userProfile?.color || '#8b5cf6' }}>
          <div className="identity-info">
            <div className="identity-avatar-box">
              <span>{userProfile?.avatar || '😴'}</span>
              <span className="identity-avatar-badge"></span>
            </div>

            <div className="identity-details">
              <div className="identity-name-row">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Alias:</span>
                <input
                  type="text"
                  className="identity-name-input"
                  placeholder="Enter your alias..."
                  value={userProfile?.name !== undefined ? userProfile.name : ''}
                  onChange={(e) => onUpdateUserProfile({ ...userProfile, name: e.target.value })}
                  title="Click to edit your alias"
                />
              </div>
              <span className="identity-mood">{userProfile?.mood || 'Decompressing in TheBackrooms'}</span>
            </div>
          </div>

          <div className="identity-actions">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="btn-pill-secondary"
              onClick={() => {
                sounds.playBoing();
                onRerollProfile();
              }}
            >
              🎲 Re-Roll Alias
            </motion.button>
            <span className="badge-pill hover-lift" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-sage)' }}>
              🔒 Ephemeral ID
            </span>
          </div>
        </section>
      </Reveal>

      {/* Code Join Bar */}
      <Reveal index={1}>
        <section className="join-code-strip glass-panel hover-lift">
          <form className="join-code-form" onSubmit={handleCodeSubmit}>
            <div className="join-code-label">
              <span className="key-icon">🔑</span>
              <span>Join Custom Room:</span>
            </div>
            <input
              type="text"
              className="join-code-input"
              placeholder="Enter Room Code (e.g. COFFEE, DOODLE)..."
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              maxLength={12}
            />
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="btn-pill-primary"
              style={{ padding: '8px 20px' }}
            >
              <span>Join Room</span>
              <span>➔</span>
            </motion.button>
          </form>
        </section>
      </Reveal>

      {/* Controls Bar */}
      <section className="lobby-controls-section">
        <div className="controls-top-row">
          <div className="search-box-wrapper hover-lift">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search lounges by name, code, topic or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="btn-pill-secondary"
              onClick={() => {
                if (rooms.length > 0) {
                  const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
                  sounds.playChime();
                  onJoinRoom(randomRoom.id);
                }
              }}
            >
              ⚡ Quick Match
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="btn-pill-primary"
              onClick={() => {
                sounds.playPop();
                setIsModalOpen(true);
              }}
            >
              ➕ Create Lounge
            </motion.button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-filter-bar">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className={`filter-tab-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                sounds.playPop();
              }}
            >
              {cat === 'All' && '🌐'}
              {cat === 'General' && '🛋️'}
              {cat === 'Study' && '📚'}
              {cat === 'Rant' && '📢'}
              {cat === 'Art' && '🎨'}
              {cat === 'Mini-Game' && '🎮'}
              <span>{cat}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                ({cat === 'All' ? rooms.length : rooms.filter(r => r.category === cat).length})
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Room Cards Grid with Staggered Reveals */}
      <main className="room-grid">
        {filteredRooms.map((room, index) => {
          const roomCode = room.code || room.id.replace('lounge-', '').slice(0, 6).toUpperCase();
          return (
            <Reveal key={room.id} index={index}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
                className="glass-panel-interactive room-card hover-lift"
                style={{ '--activity-level': Math.min((room.userCount || 1) / 6, 1) }}
              >
                {/* Room Type Icon */}
                <div className="room-card-icon-area">
                  {getRoomIcon(room.selectedGame, room.category)}
                </div>

                <div className="room-card-top">
                  <span className="room-card-game-badge hover-lift">
                    {getGameLabel(room.selectedGame)}
                  </span>
                  <div className="room-user-badge hover-lift" title="Live active presence ping">
                    <span className="pulsing-ping-dot"></span>
                    <span>{room.userCount || 1} online</span>
                  </div>
                </div>

                {/* Room Code Badge */}
                <div className="room-code-tag-row">
                  <span className="room-code-display">Code: #{roomCode}</span>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    className="room-code-copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(roomCode);
                    }}
                    title="Copy room code"
                  >
                    {copiedCode === roomCode ? '✓ Copied' : '📋 Copy'}
                  </motion.button>
                </div>

                <div>
                  <h3 className="room-card-title">{room.name}</h3>
                  <p className="room-card-desc">{room.description}</p>
                </div>

                {room.tags && room.tags.length > 0 && (
                  <div className="room-tag-pills">
                    {room.tags.map((tag, i) => (
                      <span key={i} className="room-tag hover-lift">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="room-card-footer">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1.5 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-pill-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                    onClick={() => {
                      sounds.playChime();
                      onJoinRoom(room.id);
                    }}
                  >
                    <span>Step Inside</span>
                    <span>➔</span>
                  </motion.button>
                </div>
              </motion.div>
            </Reveal>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              No lounges match "{searchQuery}".
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="btn-pill-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Create this Lounge ✨
            </motion.button>
          </div>
        )}
      </main>

      {/* Create Modal with Framer-Motion Entrance & Exit */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">Create a Lounge</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn-pill-icon"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </motion.button>
              </div>

              <form onSubmit={handleCreateSubmit} className="modal-form-flex">
                <div className="modal-form-scroll">
                  <div className="modal-form-group">
                    <label className="modal-label">Lounge Name *</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. 3AM Chill Corner, Late Night Cram"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Custom Room Code (Optional)</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. COZY42 (or leave blank to auto-generate)"
                      value={newRoomCode}
                      onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Friends can enter this code from the home page to join your room immediately.
                    </span>
                  </div>

                  <div className="modal-grid-2">
                    <div className="modal-form-group">
                      <label className="modal-label">Category</label>
                      <select
                        className="modal-input"
                        value={newRoomCategory}
                        onChange={(e) => setNewRoomCategory(e.target.value)}
                      >
                        <option value="General">🛋️ General Chill</option>
                        <option value="Study">📚 Study / Focus</option>
                        <option value="Rant">📢 Anonymous Vent</option>
                        <option value="Art">🎨 Art / Canvas</option>
                        <option value="Mini-Game">🎮 Multiplayer Games</option>
                      </select>
                    </div>

                    <div className="modal-form-group">
                      <label className="modal-label">Multiplayer Mini-Game</label>
                      <select
                        className="modal-input"
                        value={newRoomGame}
                        onChange={(e) => setNewRoomGame(e.target.value)}
                      >
                        {GAME_OPTIONS.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Description (Optional)</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="A safe space for mid-terms ranting..."
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="exams, chill, coffee, lofi"
                      value={newRoomTags}
                      onChange={(e) => setNewRoomTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    className="btn-pill-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="btn-pill-primary"
                  >
                    Create & Enter ➔
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
