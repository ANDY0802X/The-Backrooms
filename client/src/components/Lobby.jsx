import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Lobby.css';
import { sounds } from '../utils/sound';

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
  socket,
  coords,
  nearbyRoomMap = {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCat;
    const matchesSearch =
      room.name.toLowerCase().includes(query) ||
      room.description.toLowerCase().includes(query) ||
      (room.code && room.code.toLowerCase().includes(query.replace('#', ''))) ||
      (room.tags && room.tags.some(t => t.toLowerCase().includes(query.replace('#', ''))));
    return matchesCat && matchesSearch;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    sounds.playSuccess();
    onCreateRoom({
      name: newRoomName.trim(),
      code: newRoomCode.trim() || undefined,
      category: newRoomCategory,
      selectedGame: newRoomGame,
      description: newRoomDesc.trim(),
      tags: newRoomTags.split(',').map(t => t.trim()).filter(Boolean),
      coords,
      isProximity: true
    });

    setIsModalOpen(false);
    setNewRoomName('');
    setNewRoomCode('');
    setNewRoomDesc('');
    setNewRoomTags('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const cleaned = searchQuery.trim().replace('#', '').toUpperCase();
      const directMatch = rooms.find(r => r.code === cleaned || r.id === cleaned.toLowerCase());
      if (directMatch) {
        sounds.playChime();
        onJoinRoom(directMatch.id);
      } else if (typeof onJoinRoomByCode === 'function') {
        sounds.playSuccess();
        onJoinRoomByCode(cleaned);
      }
    }
  };

  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      sounds.playPop();
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    } catch (e) {}
  };

  const getGameBadge = (gameType) => {
    switch (gameType) {
      case 'trivia': return '⚡ Trivia';
      case 'wordchain': return '🔗 Word Chain';
      case 'emojipop': return '💥 Emoji Pop';
      case 'truthvent': return '🎭 Truth & Vent';
      case 'scribble':
      default: return '🎨 Scribble';
    }
  };

  return (
    <div className="lobby-shell">
      {/* Top Header */}
      <header className="lobby-top-bar">
        <div className="lobby-brand-group" onClick={onBackToLanding} title="Back to home">
          <span className="brand-pulse-dot"></span>
          <span className="brand-logo-text">TheBackrooms</span>
        </div>

        {/* Identity Pill (Compact Linear Style) */}
        <div className="lobby-user-pill">
          <span className="user-avatar-tag">{userProfile?.avatar || '😴'}</span>
          <input
            type="text"
            className="user-name-inline-input"
            value={userProfile?.name !== undefined ? userProfile.name : ''}
            onChange={(e) => onUpdateUserProfile({ ...userProfile, name: e.target.value })}
            placeholder="Set alias..."
            title="Edit alias"
            maxLength={20}
          />
          <button
            type="button"
            className="user-reroll-btn"
            onClick={() => {
              sounds.playBoing();
              onRerollProfile();
            }}
            title="Reroll identity"
            aria-label="Reroll identity"
          >
            🎲
          </button>
        </div>

        {/* Global Action Controls */}
        <div className="lobby-nav-controls">
          <button
            type="button"
            className="lobby-quiet-btn"
            onClick={() => {
              sounds.playPop();
              onToggleTheme();
            }}
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            className="lobby-quiet-btn"
            onClick={() => {
              if (rooms.length > 0) {
                const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
                sounds.playChime();
                onJoinRoom(randomRoom.id);
              }
            }}
            title="Join random room"
          >
            ⚡ Quick Match
          </button>
          <button
            type="button"
            className="lobby-primary-btn"
            onClick={() => {
              sounds.playPop();
              setIsModalOpen(true);
            }}
          >
            <span>+ Create Lounge</span>
          </button>
        </div>
      </header>

      {/* Main Filter & Search Toolbar */}
      <section className="lobby-toolbar">
        {/* Segmented Category Control (Linear/Notion Style) */}
        <div className="category-segmented-strip font-mono">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? rooms.length : rooms.filter(r => r.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`segmented-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  sounds.playPop();
                }}
              >
                <span>{cat}</span>
                <span className="segmented-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Code Input Combined */}
        <div className="search-code-field">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-code-input"
            placeholder="Search rooms by name, topic, or enter #CODE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery.trim() && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Rooms Grid: Flat, Quiet Surfaces with 1px Hairline Borders */}
      <main className="rooms-container">
        {filteredRooms.length === 0 ? (
          <div className="rooms-empty-state">
            <p className="empty-title">No active lounges match your search.</p>
            <p className="empty-sub">Create a new lounge or press Enter to join with code #{searchQuery.replace('#', '').toUpperCase()}.</p>
            <button
              type="button"
              className="lobby-primary-btn"
              style={{ marginTop: '16px' }}
              onClick={() => setIsModalOpen(true)}
            >
              Create Lounge
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => {
              const roomCode = room.code || room.id.replace('lounge-', '').slice(0, 6).toUpperCase();
              return (
                <div
                  key={room.id}
                  className="room-flat-card"
                  onClick={() => {
                    sounds.playChime();
                    onJoinRoom(room.id);
                  }}
                >
                  {/* Card Meta Top */}
                  <div className="card-top-meta">
                    <span className="card-game-pill font-mono">
                      {getGameBadge(room.selectedGame)}
                    </span>
                    <div className="card-presence-indicator font-mono">
                      <span className="card-presence-dot"></span>
                      <span>{room.userCount || 1} online</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <div className="card-title-row">
                      <h3 className="card-title">{room.name}</h3>
                      <button
                        type="button"
                        className="card-code-pill font-mono"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(roomCode);
                        }}
                        title="Copy room code"
                      >
                        {copiedCode === roomCode ? '✓ Copied' : `#${roomCode}`}
                      </button>
                    </div>

                    <p className="card-desc">{room.description}</p>
                  </div>

                  {/* Card Footer */}
                  <div className="card-bottom">
                    <div className="card-tags-list font-mono">
                      {nearbyRoomMap && nearbyRoomMap[room.id] && (
                        <span className="card-tag" style={{ color: nearbyRoomMap[room.id].isNearby ? 'var(--accent)' : 'var(--text-muted)' }}>
                          📍 {nearbyRoomMap[room.id].distanceBucket}
                        </span>
                      )}
                      {room.tags && room.tags.map((tag, i) => (
                        <span key={i} className="card-tag">#{tag}</span>
                      ))}
                    </div>
                    <span className="card-action-hint font-mono">Join ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Minimal Create Lounge Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="create-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Create Decompression Lounge</h2>
                  <p className="modal-subhead">Ephemeral room • Disappears completely when empty</p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="modal-form">
                <div className="modal-field">
                  <label className="field-label">Lounge Name *</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Midnight Exam Rant, Lofi Chillout"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    required
                    autoFocus
                    maxLength={36}
                  />
                </div>

                <div className="modal-row-grid">
                  <div className="modal-field">
                    <label className="field-label">Category</label>
                    <select
                      className="modal-select"
                      value={newRoomCategory}
                      onChange={(e) => setNewRoomCategory(e.target.value)}
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label className="field-label font-mono">Room Code (Optional)</label>
                    <input
                      type="text"
                      className="modal-input font-mono"
                      placeholder="e.g. COFFEE"
                      value={newRoomCode}
                      onChange={(e) => setNewRoomCode(e.target.value.toUpperCase())}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label className="field-label">Multiplayer Mini-Game</label>
                  <select
                    className="modal-select"
                    value={newRoomGame}
                    onChange={(e) => setNewRoomGame(e.target.value)}
                  >
                    {GAME_OPTIONS.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label className="field-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Short room vibe..."
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    maxLength={80}
                  />
                </div>

                <div className="modal-field">
                  <label className="field-label font-mono">Hashtags (Comma-separated)</label>
                  <input
                    type="text"
                    className="modal-input font-mono"
                    placeholder="exams, caffeine, insomnia"
                    value={newRoomTags}
                    onChange={(e) => setNewRoomTags(e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="lobby-primary-btn"
                  >
                    Create & Step Inside ➔
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
