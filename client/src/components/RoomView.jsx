import React, { useState, useRef, useEffect } from 'react';
import './Room.css';
import { sounds } from '../utils/sound';
import confetti from 'canvas-confetti';

const PALETTE = [
  '#8b5cf6', // Lavender Accent
  '#10b981', // Sage Green
  '#f59e0b', // Amber Warm
  '#f43f5e', // Rose Coral
  '#0ea5e9', // Sky Blue
  '#12141a', // Obsidian Charcoal
  '#ffffff', // Pure White
  '#facc15'  // Mellow Yellow
];

const EMOJI_REACTIONS = ['💜', '☕', '🌿', '🔥', '😭', '🫂', '✨', '🏆'];

export default function RoomView({
  socket,
  roomId,
  userProfile,
  onLeaveRoom,
  theme = 'dark',
  onToggleTheme
}) {
  // Room state
  const [roomData, setRoomData] = useState({
    name: 'Virtual Lounge',
    code: '',
    category: 'General',
    selectedGame: 'scribble',
    description: '',
    tags: []
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [floatingParticles, setFloatingParticles] = useState([]);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Multi-Game State
  const [gameState, setGameState] = useState({
    type: 'scribble',
    isActive: false,
    timeLeft: 30,
    scores: {},
    
    // Scribble
    isDrawer: false,
    word: '',
    maskedWord: '',
    drawer: null,

    // Trivia
    question: '',
    options: [],
    category: '',
    selectedAnswerIdx: null,
    resolvedAnswer: null,

    // Word Chain
    lastWord: 'Campus',
    currentLetter: 'C',
    streakCount: 1,
    wordHistory: ['Campus'],
    wordChainInput: '',

    // Truth / Vent
    prompt: { type: 'Vent', text: 'What campus rumor drove you crazy recently?' },

    // Emoji Pop
    targets: []
  });

  // Canvas refs
  const canvasRef = useRef(null);
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushWidth, setBrushWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const strokeHistoryRef = useRef([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Copy Room Code
  const handleCopyRoomCode = () => {
    const code = roomData.code || roomId.replace('lounge-', '').slice(0, 6).toUpperCase();
    try {
      navigator.clipboard.writeText(code);
      sounds.playPop();
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {}
  };

  // Socket & Presence Sync
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_room', { roomId, user: userProfile });

    socket.on('room_joined_data', (data) => {
      if (data.room) setRoomData(data.room);
      if (data.activeUsers) setActiveUsers(data.activeUsers);
      if (data.recentMessages) setMessages(data.recentMessages);
      if (data.gameState) {
        setGameState(prev => ({ ...prev, ...data.gameState }));
      }
      if (data.canvasStrokes && data.canvasStrokes.length > 0) {
        setTimeout(() => replayStrokes(data.canvasStrokes), 150);
      }
    });

    socket.on('user_joined', ({ user, activeUsers: usersList }) => {
      setActiveUsers(usersList || []);
      sounds.playChime();
    });

    socket.on('user_left', ({ user, activeUsers: usersList }) => {
      setActiveUsers(usersList || []);
    });

    socket.on('active_users_update', ({ activeUsers: usersList }) => {
      setActiveUsers(usersList || []);
    });

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (msg.sender?.name !== userProfile.name) {
        sounds.playPop();
      }
    });

    socket.on('stroke_received', (stroke) => {
      drawRemoteStroke(stroke);
    });

    socket.on('canvas_cleared', () => {
      clearLocalCanvas();
      sounds.playPop();
    });

    socket.on('user_typing_update', ({ userName, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(userName);
        else next.delete(userName);
        return next;
      });
    });

    socket.on('reaction_burst', ({ emoji }) => {
      triggerReactionParticle(emoji);
      sounds.playPop();
    });

    // Multi-Game Sync
    socket.on('game_state_sync', (syncData) => {
      setGameState(prev => ({
        ...prev,
        ...syncData,
        selectedAnswerIdx: null,
        resolvedAnswer: null
      }));
      sounds.playSuccess();
    });

    socket.on('game_timer_tick', ({ timeLeft }) => {
      setGameState(prev => ({ ...prev, timeLeft }));
    });

    socket.on('game_score_update', ({ scores }) => {
      setGameState(prev => ({ ...prev, scores }));
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      sounds.playSuccess();
    });

    socket.on('game_round_ended', ({ word, scores }) => {
      setGameState(prev => ({ ...prev, word, scores: scores || prev.scores }));
    });

    socket.on('game_stopped', () => {
      setGameState(prev => ({ ...prev, isActive: false }));
    });

    // Trivia
    socket.on('trivia_answer_acknowledged', ({ answerIndex }) => {
      setGameState(prev => ({ ...prev, selectedAnswerIdx: answerIndex }));
      sounds.playBoing();
    });

    socket.on('trivia_round_resolved', ({ correctIndex, correctAnswer, winners, scores }) => {
      setGameState(prev => ({
        ...prev,
        resolvedAnswer: { correctIndex, correctAnswer, winners },
        scores
      }));
      if (winners && winners.includes(userProfile.name)) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        sounds.playSuccess();
      }
    });

    // Word Chain
    socket.on('word_chain_update', ({ lastWord, currentLetter, streakCount, scores }) => {
      setGameState(prev => ({
        ...prev,
        lastWord,
        currentLetter,
        streakCount,
        scores,
        wordHistory: [...(prev.wordHistory || []), lastWord]
      }));
      sounds.playSuccess();
    });

    // Emoji Pop
    socket.on('emoji_targets_respawn', ({ targets }) => {
      setGameState(prev => ({ ...prev, targets }));
    });

    socket.on('emoji_target_popped', ({ targetId, poppedBy, scores }) => {
      setGameState(prev => ({
        ...prev,
        targets: (prev.targets || []).filter(t => t.id !== targetId),
        scores
      }));
      triggerReactionParticle('💥');
    });

    return () => {
      socket.off('room_joined_data');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('active_users_update');
      socket.off('new_message');
      socket.off('stroke_received');
      socket.off('canvas_cleared');
      socket.off('user_typing_update');
      socket.off('reaction_burst');
      socket.off('game_state_sync');
      socket.off('game_timer_tick');
      socket.off('game_score_update');
      socket.off('game_round_ended');
      socket.off('game_stopped');
      socket.off('trivia_answer_acknowledged');
      socket.off('trivia_round_resolved');
      socket.off('word_chain_update');
      socket.off('emoji_targets_respawn');
      socket.off('emoji_target_popped');
      socket.emit('leave_room', { roomId });
    };
  }, [socket, roomId, userProfile]);

  const triggerReactionParticle = (emoji) => {
    const newParticle = {
      id: Math.random(),
      emoji,
      left: `${20 + Math.random() * 60}%`,
      bottom: '120px'
    };
    setFloatingParticles(prev => [...prev.slice(-15), newParticle]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 2200);
  };

  const handleSendReaction = (emoji) => {
    if (!socket) return;
    socket.emit('send_reaction', { emoji });
  };

  // Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      if (strokeHistoryRef.current.length > 0) {
        replayStrokes(strokeHistoryRef.current);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const replayStrokes = (strokes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    strokeHistoryRef.current = strokes;
    strokes.forEach(stroke => {
      drawSegment(ctx, stroke.x1, stroke.y1, stroke.x2, stroke.y2, stroke.color, stroke.width, stroke.isEraser);
    });
  };

  const drawSegment = (ctx, x1, y1, x2, y2, color, width, isErase) => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;

    if (isErase) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const drawRemoteStroke = (stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawSegment(ctx, stroke.x1, stroke.y1, stroke.x2, stroke.y2, stroke.color, stroke.width, stroke.isEraser);
    strokeHistoryRef.current.push(stroke);
  };

  const clearLocalCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeHistoryRef.current = [];
  };

  const handleClearCanvasClick = () => {
    clearLocalCanvas();
    sounds.playPop();
    if (socket) socket.emit('clear_canvas', { roomId });
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    lastPointRef.current = getCanvasCoords(e);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);

    const stroke = {
      x1: lastPointRef.current.x,
      y1: lastPointRef.current.y,
      x2: coords.x,
      y2: coords.y,
      color: brushColor,
      width: brushWidth,
      isEraser: isEraser
    };

    drawSegment(ctx, stroke.x1, stroke.y1, stroke.x2, stroke.y2, stroke.color, stroke.width, stroke.isEraser);
    strokeHistoryRef.current.push(stroke);
    if (socket) socket.emit('draw_stroke', { roomId, stroke });

    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const exportCanvasSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `thebackrooms-art-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    sounds.playSuccess();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !socket) return;

    socket.emit('send_message', { roomId, text, isEphemeral });
    sounds.playSend();
    setInputText('');
    socket.emit('typing_stop', {});
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket) return;
    socket.emit('typing_start', {});
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {});
    }, 1800);
  };

  // Game Control Handlers
  const handleSwitchGame = (gameType) => {
    sounds.playBoing();
    setGameState(prev => ({ ...prev, type: gameType }));
    if (socket) socket.emit('start_game', { gameType });
  };

  const handleToggleGame = () => {
    if (gameState.isActive) {
      sounds.playPop();
      if (socket) socket.emit('stop_game', {});
    } else {
      sounds.playSuccess();
      if (socket) socket.emit('start_game', { gameType: gameState.type });
    }
  };

  const handleTriviaAnswer = (index) => {
    if (!socket || gameState.selectedAnswerIdx !== null) return;
    sounds.playBoing();
    socket.emit('trivia_submit_answer', { answerIndex: index });
  };

  const handlePopTarget = (target) => {
    if (!socket) return;
    sounds.playPop();
    socket.emit('emojipop_click_target', { targetId: target.id });
  };

  const handleNextTruthVent = () => {
    if (socket) {
      sounds.playBoing();
      socket.emit('truthvent_next_prompt', {});
    }
  };

  const handleWordChainSubmit = (e) => {
    e.preventDefault();
    const word = (gameState.wordChainInput || '').trim();
    if (!word || !socket) return;

    sounds.playPop();
    socket.emit('wordchain_submit_word', { word });
    setGameState(prev => ({ ...prev, wordChainInput: '' }));
  };

  const displayRoomCode = roomData.code || roomId.replace('lounge-', '').slice(0, 6).toUpperCase();

  return (
    <div className="room-view-container">
      {/* Floating Reaction Particles */}
      {floatingParticles.map(p => (
        <div key={p.id} className="floating-reaction-particle" style={{ left: p.left, bottom: p.bottom }}>
          {p.emoji}
        </div>
      ))}

      {/* Header Bar */}
      <header className="room-header">
        <div className="room-header-left">
          <button className="btn-pill-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={onLeaveRoom}>
            ← Back
          </button>
          <div className="room-title-heading">
            <span className="room-name-text">{roomData.name}</span>
            <span className="badge-pill" style={{ background: 'var(--bg-well)', color: 'var(--accent-lavender)' }}>
              {roomData.category}
            </span>
          </div>

          {/* Room Code Badge */}
          <div className="room-code-pill-btn" onClick={handleCopyRoomCode} title="Share Room Code with friends">
            <span>Code: #{displayRoomCode}</span>
            <span style={{ fontSize: '0.75rem' }}>{copiedCode ? '✓ Copied' : '📋'}</span>
          </div>
        </div>

        <div className="room-header-center">
          {/* Main Mini-Games Pop-up Launcher Button */}
          <button
            className={`btn-pill-primary ${gameState.isActive ? 'game-active-glow' : ''}`}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            onClick={() => {
              sounds.playPop();
              setIsGameModalOpen(true);
            }}
          >
            <span>🎮 Mini-Games {gameState.isActive ? `(${gameState.timeLeft}s)` : '(5)'}</span>
            <span className="pop-icon">↗</span>
          </button>
        </div>

        <div className="room-header-right">
          {/* Live Presence Ping Indicator */}
          <div className="room-ping-indicator" title="Live active students connected">
            <span className="pulsing-ping-dot"></span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{activeUsers.length || 1} online</span>
          </div>

          {/* Connected User Avatars */}
          <div className="presence-avatars-list" title="Active students in lounge">
            {activeUsers.slice(0, 5).map(u => (
              <div key={u.id} className="presence-avatar" style={{ borderColor: u.color || 'var(--accent-lavender)' }} title={u.name}>
                {u.avatar || '😴'}
              </div>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            className="btn-pill-secondary"
            style={{ padding: '6px 10px', fontSize: '0.85rem' }}
            onClick={() => {
              sounds.playPop();
              onToggleTheme();
            }}
            title="Toggle Light / Dark Mode"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Canvas | Right Chat */}
      <main className="room-split-layout">
        {/* LEFT: Continuous Synchronized Collaborative Canvas */}
        <section className="game-pane">
          <div className="canvas-wrapper">
            {/* Active Game Floating Banner (if running) */}
            {gameState.isActive && (
              <div
                className="canvas-game-alert-strip"
                onClick={() => setIsGameModalOpen(true)}
                title="Click to open game popup"
              >
                <span>🎮 Live {gameState.type.toUpperCase()} in progress! Time left: {gameState.timeLeft}s</span>
                <span className="strip-cta">Open Game Popup ↗</span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="drawing-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {/* Floating Drawing Toolbar */}
            <div className="canvas-floating-toolbar">
              {PALETTE.map((c, i) => (
                <button
                  key={i}
                  className={`toolbar-color-btn ${brushColor === c && !isEraser ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    setBrushColor(c);
                    setIsEraser(false);
                    sounds.playPop();
                  }}
                />
              ))}
              <div className="tool-separator" />
              <button
                className={`filter-tab-pill ${isEraser ? 'active' : ''}`}
                onClick={() => setIsEraser(!isEraser)}
              >
                🧹 Eraser
              </button>
              <input
                type="range"
                min="2"
                max="28"
                value={brushWidth}
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="size-slider"
                title="Brush Size"
              />
              <div className="tool-separator" />
              <button className="filter-tab-pill" onClick={handleClearCanvasClick}>🗑️ Clear</button>
              <button className="filter-tab-pill" onClick={exportCanvasSnapshot}>📸 Save</button>
            </div>
          </div>
        </section>

        {/* RIGHT: Real-Time Vent Feed & Chat */}
        <section className="chat-pane">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulsing-ping-dot"></span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Real-Time Vent Feed</span>
            </div>
            <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-sage)' }}>
              🔒 Zero-Trace Chat
            </span>
          </div>

          {/* Messages Feed */}
          <div className="chat-messages-container">
            {messages.map((m) => {
              if (m.isSystem) {
                return (
                  <div key={m.id} className="system-bubble">
                    {m.text}
                  </div>
                );
              }

              const isOwn = m.sender?.name === userProfile.name;

              return (
                <div
                  key={m.id}
                  className={`chat-bubble ${isOwn ? 'own' : 'other'} ${m.isEphemeral ? 'ephemeral-dissolve-bubble' : ''}`}
                >
                  <div className="chat-bubble-meta">
                    <span style={{ color: m.sender?.color || 'var(--accent-lavender)', fontWeight: 700 }}>
                      {m.sender?.avatar || '😴'} {m.sender?.name || 'Anonymous'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.isEphemeral && (
                      <span style={{ color: 'var(--accent-rose)', fontSize: '0.7rem', fontWeight: 700 }}>
                        🔥 Dissolving (12s)
                      </span>
                    )}
                  </div>
                  <div className="chat-bubble-content">
                    {m.text}
                  </div>

                  {/* Burning Progress Bar for Dissolving Messages */}
                  {m.isEphemeral && <div className="ephemeral-burn-bar"></div>}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          <div className="typing-indicator-bar">
            {typingUsers.size > 0 && (
              <span>💬 {Array.from(typingUsers).join(', ')} is typing...</span>
            )}
          </div>

          {/* Quick Reaction Bursts */}
          <div className="emoji-reactions-bar">
            {EMOJI_REACTIONS.map((emoji, i) => (
              <button
                key={i}
                className="emoji-btn"
                onClick={() => handleSendReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder={isEphemeral ? "Type self-destructing vent (vanishes in 12s)..." : "Drop an anonymous thought or guess..."}
                value={inputText}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className={`ephemeral-toggle-btn ${isEphemeral ? 'active' : ''}`}
                onClick={() => {
                  sounds.playPop();
                  setIsEphemeral(!isEphemeral);
                }}
                title="Toggle 12s Dissolving Message"
              >
                🔥
              </button>
              <button type="submit" className="chat-send-btn">
                ➔
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* ============================================================
          INTERACTIVE MINI-GAMES POP-UP MODAL (All 5 Games)
          ============================================================ */}
      {isGameModalOpen && (
        <div className="game-modal-backdrop" onClick={() => setIsGameModalOpen(false)}>
          <div className="game-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="game-modal-header">
              <div className="game-modal-title-row">
                <span className="game-modal-title">🎮 Multiplayer Mini-Games</span>
                {gameState.isActive && (
                  <span className="badge-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                    ⏱️ {gameState.timeLeft}s left
                  </span>
                )}
              </div>
              <button className="game-modal-close-btn" onClick={() => setIsGameModalOpen(false)}>✕</button>
            </div>

            {/* Game Selector Tabs */}
            <div className="game-modal-tabs">
              {[
                { id: 'scribble', label: '🎨 Scribble' },
                { id: 'trivia', label: '⚡ Trivia Blitz' },
                { id: 'wordchain', label: '🔗 Word Chain' },
                { id: 'emojipop', label: '💥 Emoji Pop' },
                { id: 'truthvent', label: '🎭 Truth & Vent' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`filter-tab-pill ${gameState.type === tab.id ? 'active' : ''}`}
                  onClick={() => handleSwitchGame(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body: Active Game Interactive Screen */}
            <div className="game-modal-body">
              {/* 1. Scribble Pop-up View */}
              {gameState.type === 'scribble' && (
                <div className="game-screen-box">
                  <div className="game-card-banner">
                    <span className="badge-pill" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                      🎨 CAMPUS SCRIBBLE
                    </span>
                    <button className="btn-pill-secondary" onClick={handleToggleGame}>
                      {gameState.isActive ? '⏸️ Stop Game' : '▶️ Start Round'}
                    </button>
                  </div>

                  {gameState.isActive ? (
                    <div className="scribble-interactive-prompt">
                      {gameState.isDrawer ? (
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--accent-amber)' }}>YOU ARE THE DRAWER! SKETCH THIS ON THE CANVAS:</p>
                          <h2 className="secret-word-display">{gameState.word}</h2>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Peers are guessing your sketch in chat!</p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GUESS THE DRAWING IN CHAT:</p>
                          <h2 className="secret-word-display">{gameState.maskedWord}</h2>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        Speed Pictionary! One player draws on the canvas while everyone else races to guess the word in chat.
                      </p>
                      <button className="btn-pill-primary" onClick={handleToggleGame}>
                        🚀 Start Scribble Round
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Trivia Blitz Pop-up View */}
              {gameState.type === 'trivia' && (
                <div className="game-screen-box">
                  <div className="game-card-banner">
                    <span className="badge-pill" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-lavender)' }}>
                      ⚡ TRIVIA BLITZ (14s)
                    </span>
                    <button className="btn-pill-secondary" onClick={handleToggleGame}>
                      {gameState.isActive ? 'Next Question ➔' : 'Start Trivia'}
                    </button>
                  </div>

                  <h3 className="trivia-question-text">
                    {gameState.question || "Ready for campus & tech trivia showdown?"}
                  </h3>

                  <div className="trivia-options-grid">
                    {(gameState.options && gameState.options.length > 0 ? gameState.options : [
                      "Option A", "Option B", "Option C", "Option D"
                    ]).map((opt, i) => {
                      const isSelected = gameState.selectedAnswerIdx === i;
                      const isResolved = gameState.resolvedAnswer !== null;
                      const isCorrect = isResolved && gameState.resolvedAnswer.correctIndex === i;

                      let btnClass = 'trivia-option-btn';
                      if (isSelected) btnClass += ' selected';
                      if (isCorrect) btnClass += ' correct';

                      return (
                        <button
                          key={i}
                          className={btnClass}
                          onClick={() => handleTriviaAnswer(i)}
                          disabled={gameState.selectedAnswerIdx !== null}
                        >
                          <span className="opt-letter">{['A', 'B', 'C', 'D'][i]}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Word Chain Pop-up View */}
              {gameState.type === 'wordchain' && (
                <div className="game-screen-box">
                  <div className="game-card-banner">
                    <span className="badge-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-sage)' }}>
                      🔗 RAPID WORD CHAIN (Streak: {gameState.streakCount}x)
                    </span>
                    <button className="btn-pill-secondary" onClick={handleToggleGame}>
                      Reset Chain
                    </button>
                  </div>

                  <div className="wordchain-status-box">
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>LAST WORD PLAYED:</div>
                    <div className="wordchain-last-word">{gameState.lastWord || 'Campus'}</div>
                    <div className="wordchain-prompt">
                      Your word must begin with: <strong className="chain-letter">"{gameState.currentLetter || 'C'}"</strong>
                    </div>
                  </div>

                  <form className="wordchain-form" onSubmit={handleWordChainSubmit}>
                    <input
                      type="text"
                      className="wordchain-input"
                      placeholder={`Enter word starting with "${gameState.currentLetter || 'C'}"...`}
                      value={gameState.wordChainInput || ''}
                      onChange={(e) => setGameState(prev => ({ ...prev, wordChainInput: e.target.value }))}
                      autoFocus
                    />
                    <button type="submit" className="btn-pill-primary">Submit Word</button>
                  </form>
                </div>
              )}

              {/* 4. Emoji Pop Reflex Pop-up View */}
              {gameState.type === 'emojipop' && (
                <div className="game-screen-box">
                  <div className="game-card-banner">
                    <span className="badge-pill" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
                      💥 EMOJI POP REFLEX
                    </span>
                    <button className="btn-pill-secondary" onClick={handleToggleGame}>
                      {gameState.isActive ? 'Pause' : 'Start Pop'}
                    </button>
                  </div>

                  <div className="emojipop-arena-field">
                    {(gameState.targets || []).map(target => (
                      <div
                        key={target.id}
                        className="emojipop-target-item"
                        style={{ left: `${target.x}%`, top: `${target.y}%`, fontSize: `${target.size}px` }}
                        onClick={() => handlePopTarget(target)}
                      >
                        <span>{target.emoji}</span>
                        <span className="target-points-badge">+{target.points}</span>
                      </div>
                    ))}
                    {(!gameState.targets || gameState.targets.length === 0) && (
                      <div style={{ position: 'absolute', top: '45%', left: '0', right: '0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Click Start to spawn fast target emojis!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. Truth, Vent & Dare Pop-up View */}
              {gameState.type === 'truthvent' && (
                <div className="game-screen-box">
                  <div className="game-card-banner">
                    <span className="badge-pill" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-lavender)' }}>
                      🎭 TRUTH, VENT & DARE
                    </span>
                    <button className="btn-pill-primary" onClick={handleNextTruthVent}>
                      Next Prompt ➔
                    </button>
                  </div>

                  <div className="truthvent-card-prompt">
                    <span className="truthvent-type-tag">{gameState.prompt?.type || 'Vent'}</span>
                    <p className="truthvent-prompt-text">{gameState.prompt?.text || 'What is your biggest campus confession?'}</p>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Answer or react in the chat on the right!
                    </span>
                  </div>
                </div>
              )}

              {/* Live Game Scores Display */}
              {gameState.scores && Object.keys(gameState.scores).length > 0 && (
                <div className="modal-scores-row">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>🏆 Leaderboard:</span>
                  {Object.entries(gameState.scores).map(([name, score]) => (
                    <span key={name} className="score-pill">
                      {name}: {score} pts
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
