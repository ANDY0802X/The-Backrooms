import React, { useState } from 'react';
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
    sounds.playChime();
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

  return (
    <div className="lobby-container">
      {/* Header */}
      <header className="lobby-header-bar">
        <div className="lobby-brand" onClick={onBackToLanding} title="Back to home">
          <div className="brand-icon-box" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>🌌</div>
          <h2 className="brand-title">TheBackrooms</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn-pill-secondary"
            onClick={() => {
              sounds.playPop();
              onToggleTheme();
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="btn-pill-secondary" onClick={onBackToLanding} title="Back to landing">
            ← Back
          </button>
        </div>
      </header>

      {/* Identity Card */}
      <section className="identity-banner glass-panel" style={{ '--user-color': userProfile?.color || '#8b5cf6' }}>
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
                value={userProfile?.name || 'Anonymous Roomie'}
                onChange={(e) => onUpdateUserProfile({ ...userProfile, name: e.target.value })}
                title="Click to edit your alias"
              />
            </div>
            <span className="identity-mood">{userProfile?.mood || 'Decompressing in TheBackrooms'}</span>
          </div>
        </div>

        <div className="identity-actions">
          <button
            className="btn-pill-secondary"
            onClick={() => {
              sounds.playBoing();
              onRerollProfile();
            }}
          >
            🎲 Re-Roll Alias
          </button>
          <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-sage)' }}>
            🔒 Ephemeral ID
          </span>
        </div>
      </section>

      {/* Code Join Bar */}
      <section className="join-code-strip glass-panel">
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
          <button type="submit" className="btn-pill-primary" style={{ padding: '8px 20px' }}>
            <span>Join Room</span>
            <span>➔</span>
          </button>
        </form>
      </section>

      {/* Controls Bar */}
      <section className="lobby-controls-section">
        <div className="controls-top-row">
          <div className="search-box-wrapper">
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
            <button
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
            </button>
            <button
              className="btn-pill-primary"
              onClick={() => {
                sounds.playPop();
                setIsModalOpen(true);
              }}
            >
              ➕ Create Lounge
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-filter-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
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
            </button>
          ))}
        </div>
      </section>

      {/* Room Cards Grid */}
      <main className="room-grid">
        {filteredRooms.map(room => {
          const roomCode = room.code || room.id.replace('lounge-', '').slice(0, 6).toUpperCase();
          return (
            <div key={room.id} className="glass-panel-interactive room-card">
              <div className="room-card-top">
                <span className="room-card-game-badge">
                  {getGameLabel(room.selectedGame)}
                </span>
                <div className="room-user-badge" title="Live active presence ping">
                  <span className="pulsing-ping-dot"></span>
                  <span>{room.userCount || 1} online</span>
                </div>
              </div>

              {/* Room Code Badge */}
              <div className="room-code-tag-row">
                <span className="room-code-display">Code: #{roomCode}</span>
                <button
                  type="button"
                  className="room-code-copy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(roomCode);
                  }}
                  title="Copy room code"
                >
                  {copiedCode === roomCode ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>

              <div>
                <h3 className="room-card-title">{room.name}</h3>
                <p className="room-card-desc">{room.description}</p>
              </div>

              {room.tags && room.tags.length > 0 && (
                <div className="room-tag-pills">
                  {room.tags.map((tag, i) => (
                    <span key={i} className="room-tag">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="room-card-footer">
                <button
                  className="btn-pill-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  onClick={() => {
                    sounds.playChime();
                    onJoinRoom(room.id);
                  }}
                >
                  <span>Step Inside</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              No lounges match "{searchQuery}".
            </p>
            <button className="btn-pill-primary" onClick={() => setIsModalOpen(true)}>
              Create this Lounge ✨
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create a Lounge</h3>
              <button className="btn-pill-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  <label className="modal-label">Featured Game</label>
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
                <label className="modal-label">Description</label>
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="What is the vibe or purpose of this lounge?"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Lo-Fi, Finals, Vent, Music"
                  value={newRoomTags}
                  onChange={(e) => setNewRoomTags(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-pill-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pill-primary">
                  <span>Create & Enter Lounge</span>
                  <span>➔</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
