import Peer from 'peerjs';
import { CAMPUS_WORDS, TRIVIA_BANK, TRUTH_VENT_DARE_PROMPTS, EMOJI_POP_TARGETS, DEFAULT_LOUNGES } from '../utils/gameData';

class RealtimeMesh {
  constructor() {
    this.listeners = new Map();
    this.peer = null;
    this.connections = new Map(); // peerId -> DataConnection
    this.activeRoomId = null;
    this.userProfile = null;
    this.isHost = false;
    this.myPeerId = null;
    this.channel = null;
    this.gameInterval = null;
    this.rooms = [...DEFAULT_LOUNGES];

    // Load any custom rooms from localStorage
    try {
      const saved = localStorage.getItem('soulnook_custom_rooms');
      if (saved) {
        const custom = JSON.parse(saved);
        const ids = new Set(this.rooms.map(r => r.id));
        custom.forEach(r => {
          if (!ids.has(r.id)) this.rooms.push(r);
        });
      }
    } catch (e) {}

    // In-room state
    this.roomData = null;
    this.activeUsers = new Map();
    this.canvasStrokes = [];
    this.messages = [];
    this.gameState = {
      type: 'scribble',
      isActive: false,
      timeLeft: 30,
      scores: {},
      isDrawer: false,
      word: '',
      maskedWord: '',
      drawer: null,
      question: '',
      options: [],
      category: '',
      selectedAnswerIdx: null,
      resolvedAnswer: null,
      lastWord: 'Campus',
      currentLetter: 'C',
      streakCount: 1,
      wordHistory: ['Campus'],
      prompt: { type: 'Vent', text: 'What campus rumor drove you crazy recently?' },
      targets: []
    };

    this.initBroadcastChannel();
    this.initPeer();
  }

  // Cross-tab BroadcastChannel for instant local multi-tab sync
  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('soulnook_realtime_mesh');
        this.channel.onmessage = (event) => {
          const { type, payload, senderPeerId, roomId } = event.data || {};
          if (senderPeerId === this.myPeerId) return;

          if (type === 'ROOMS_UPDATE') {
            this.handleIncomingRooms(payload);
          } else if (roomId && roomId === this.activeRoomId) {
            this.handleMeshPacket(type, payload, senderPeerId);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported:', e);
      }
    }
  }

  // Initialize Global PeerJS WebRTC Connection
  initPeer() {
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 9);
      this.myPeerId = `sn-user-${Date.now()}-${randomSuffix}`;
      
      this.peer = new Peer(this.myPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.emitLocal('connect');
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Mesh Notice:', err);
      });
    } catch (e) {
      console.warn('Failed to initialize WebRTC Peer:', e);
    }
  }

  setupConnection(conn) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);

      // If we are host of this room, send room state
      if (this.isHost && this.activeRoomId) {
        conn.send({
          type: 'HOST_STATE_SYNC',
          payload: {
            room: this.roomData,
            activeUsers: Array.from(this.activeUsers.values()),
            canvasStrokes: this.canvasStrokes,
            recentMessages: this.messages.slice(-30),
            gameState: this.gameState
          }
        });
      }
    });

    conn.on('data', (data) => {
      if (!data || !data.type) return;
      this.handleMeshPacket(data.type, data.payload, conn.peer);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      const departingUser = Array.from(this.activeUsers.values()).find(u => u.peerId === conn.peer);
      if (departingUser) {
        this.activeUsers.delete(departingUser.id);
        this.emitLocal('user_left', {
          user: departingUser,
          activeUsers: Array.from(this.activeUsers.values())
        });
      }
    });
  }

  // Broadcast packet to all connected peers & local broadcast channel
  broadcastPacket(type, payload) {
    const packet = {
      type,
      payload,
      senderPeerId: this.myPeerId,
      roomId: this.activeRoomId,
      timestamp: Date.now()
    };

    // Send across WebRTC DataConnections
    this.connections.forEach(conn => {
      if (conn.open) {
        try {
          conn.send(packet);
        } catch (e) {}
      }
    });

    // Send across local tab broadcast channel
    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch (e) {}
    }
  }

  // Handle incoming packet from peer or broadcast channel
  handleMeshPacket(type, payload, senderPeerId) {
    switch (type) {
      case 'JOIN_ANNOUNCE': {
        const { user, roomId } = payload;
        if (roomId !== this.activeRoomId) return;

        user.peerId = senderPeerId;
        this.activeUsers.set(user.id, user);

        this.emitLocal('user_joined', {
          user,
          activeUsers: Array.from(this.activeUsers.values())
        });
        break;
      }

      case 'HEARTBEAT_PING': {
        const { user, roomId } = payload;
        if (roomId !== this.activeRoomId || !user) return;
        user.peerId = senderPeerId;
        user.lastPing = Date.now();
        const wasPresent = this.activeUsers.has(user.id);
        this.activeUsers.set(user.id, user);
        if (!wasPresent) {
          this.emitLocal('user_joined', { user, activeUsers: Array.from(this.activeUsers.values()) });
        }
        this.emitLocal('active_users_update', { activeUsers: Array.from(this.activeUsers.values()) });
        break;
      }

      case 'USER_LEFT': {
        const { user, roomId } = payload;
        if (roomId !== this.activeRoomId || !user) return;
        this.activeUsers.delete(user.id);
        this.emitLocal('user_left', { user, activeUsers: Array.from(this.activeUsers.values()) });
        this.emitLocal('active_users_update', { activeUsers: Array.from(this.activeUsers.values()) });
        break;
      }

      case 'HOST_STATE_SYNC': {
        if (!this.isHost) {
          const { room, activeUsers, canvasStrokes, recentMessages, gameState } = payload;
          if (room) this.roomData = room;
          if (activeUsers) {
            this.activeUsers.clear();
            activeUsers.forEach(u => this.activeUsers.set(u.id, u));
          }
          if (canvasStrokes) this.canvasStrokes = canvasStrokes;
          if (recentMessages) this.messages = recentMessages;
          if (gameState) this.gameState = gameState;

          this.emitLocal('room_joined_data', {
            room: this.roomData,
            activeUsers: Array.from(this.activeUsers.values()),
            recentMessages: this.messages,
            canvasStrokes: this.canvasStrokes,
            gameState: this.gameState
          });
        }
        break;
      }

      case 'NEW_MESSAGE': {
        this.messages.push(payload);
        this.emitLocal('new_message', payload);

        // Check if message is a guess for scribble in host mode
        if (this.isHost && this.gameState.isActive && this.gameState.type === 'scribble') {
          this.checkScribbleGuess(payload);
        }
        break;
      }

      case 'STROKE_RECEIVED': {
        this.canvasStrokes.push(payload);
        this.emitLocal('stroke_received', payload);
        break;
      }

      case 'CANVAS_CLEARED': {
        this.canvasStrokes = [];
        this.emitLocal('canvas_cleared');
        break;
      }

      case 'TYPING_UPDATE': {
        this.emitLocal('user_typing_update', payload);
        break;
      }

      case 'REACTION_BURST': {
        this.emitLocal('reaction_burst', payload);
        break;
      }

      case 'GAME_STATE_SYNC': {
        this.gameState = { ...this.gameState, ...payload };
        this.emitLocal('game_state_sync', payload);
        break;
      }

      case 'GAME_TIMER_TICK': {
        this.gameState.timeLeft = payload.timeLeft;
        this.emitLocal('game_timer_tick', payload);
        break;
      }

      case 'GAME_SCORE_UPDATE': {
        this.gameState.scores = payload.scores;
        this.emitLocal('game_score_update', payload);
        break;
      }

      case 'GAME_ROUND_ENDED': {
        this.emitLocal('game_round_ended', payload);
        break;
      }

      case 'GAME_STOPPED': {
        this.gameState.isActive = false;
        this.emitLocal('game_stopped');
        break;
      }

      case 'TRIVIA_ANSWER_ACK': {
        this.emitLocal('trivia_answer_acknowledged', payload);
        break;
      }

      case 'TRIVIA_ROUND_RESOLVED': {
        this.gameState.scores = payload.scores;
        this.emitLocal('trivia_round_resolved', payload);
        break;
      }

      case 'WORDCHAIN_STATE_SYNC': {
        this.gameState = { ...this.gameState, ...payload };
        this.emitLocal('wordchain_state_sync', payload);
        break;
      }

      case 'EMOJIPOP_STATE_SYNC': {
        this.gameState.targets = payload.targets;
        this.gameState.scores = payload.scores;
        this.emitLocal('emojipop_state_sync', payload);
        break;
      }

      case 'TRUTHVENT_STATE_SYNC': {
        this.gameState.prompt = payload.prompt;
        this.emitLocal('truthvent_state_sync', payload);
        break;
      }

      default:
        break;
    }
  }

  // ==========================================
  // SOCKET COMPATIBLE EMIT & EVENT API
  // ==========================================

  emit(event, data, callback) {
    switch (event) {
      case 'create_room': {
        const roomCode = (data.code || Math.random().toString(36).substring(2, 8)).toUpperCase();
        const roomId = `lounge-${roomCode.toLowerCase()}-${Date.now().toString(36)}`;
        const newRoom = {
          id: roomId,
          code: roomCode,
          name: data.name || 'Chill Lounge',
          category: data.category || 'General',
          selectedGame: data.selectedGame || 'scribble',
          description: data.description || 'A cozy space to decompress.',
          tags: data.tags || ['Chill', 'Campus'],
          created: Date.now(),
          userCount: 1,
          isPermanent: false
        };

        this.rooms.unshift(newRoom);
        this.saveCustomRooms();

        // Broadcast new room list across tabs & peers
        this.broadcastRooms();

        if (typeof callback === 'function') {
          callback({ success: true, roomId, code: roomCode });
        }
        break;
      }

      case 'join_room_by_code': {
        const searchCode = (data.code || '').trim().toUpperCase();
        let targetRoom = this.rooms.find(r => r.code && r.code.toUpperCase() === searchCode);

        if (!targetRoom) {
          // Create room on the fly for this custom code so any user entering this code joins the same room!
          const newRoomId = `lounge-${searchCode.toLowerCase()}`;
          targetRoom = {
            id: newRoomId,
            code: searchCode,
            name: `Private Lounge #${searchCode}`,
            category: 'General',
            selectedGame: 'scribble',
            description: `Private room joined with code #${searchCode}`,
            tags: ['Private', 'Code-Room'],
            created: Date.now(),
            userCount: 1,
            isPermanent: false
          };
          this.rooms.unshift(targetRoom);
          this.saveCustomRooms();
          this.broadcastRooms();
        }

        if (typeof callback === 'function') {
          callback({ success: true, roomId: targetRoom.id, room: targetRoom });
        }
        break;
      }

      case 'join_room': {
        const { roomId, user } = data;
        this.activeRoomId = roomId;
        this.userProfile = user;

        // Find or create room data
        let targetRoom = this.rooms.find(r => r.id === roomId);
        if (!targetRoom) {
          const defaultCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          targetRoom = {
            id: roomId,
            code: defaultCode,
            name: 'TheBackrooms Sanctuary 🌌',
            category: 'General',
            selectedGame: 'scribble',
            description: 'A cozy space to decompress.',
            tags: ['TheBackrooms', 'Chill']
          };
          this.rooms.unshift(targetRoom);
        }
        if (!targetRoom.code) {
          targetRoom.code = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        this.roomData = targetRoom;

        // Add current user to active users
        this.activeUsers.clear();
        this.activeUsers.set(user.id, { ...user, peerId: this.myPeerId, lastPing: Date.now() });

        // Start heartbeat ping
        this.startHeartbeat();

        // Self is Host
        this.isHost = true;
        this.canvasStrokes = [];
        this.messages = [
          {
            id: `welcome-${Date.now()}`,
            sender: { name: '🌌 TheBackrooms Bot', color: '#8b5cf6', avatar: '🌌' },
            text: `Welcome to ${targetRoom.name}! Room Code: #${targetRoom.code}. Share with peers to join live. Zero logins, zero trace.`,
            timestamp: Date.now(),
            isSystem: true
          }
        ];
        this.activeUsers.set(user.id, { ...user, peerId: this.myPeerId });

        // Generate synthetic mock peer users for instant rich campus interaction if alone
        const initialMockUsers = [
          { id: 'mock-1', name: 'CoffeeCrammer☕', avatar: '☕', mood: 'Need 10h sleep', color: '#f59e0b' },
          { id: 'mock-2', name: 'CyberZen🧘', avatar: '🌿', mood: 'Vibing to lo-fi', color: '#10b981' }
        ];
        initialMockUsers.forEach(u => this.activeUsers.set(u.id, u));

        // Self is Host
        this.isHost = true;
        this.canvasStrokes = [];
        this.messages = [
          {
            id: `welcome-${Date.now()}`,
            sender: { name: '🌌 Soulnook Sanctuary', color: '#8b5cf6', avatar: '🌌' },
            text: `Welcome to ${targetRoom.name}! You are completely anonymous. Vent freely or play games!`,
            timestamp: Date.now(),
            isSystem: true
          }
        ];

        // Emit initial room joined data immediately
        setTimeout(() => {
          this.emitLocal('room_joined_data', {
            room: this.roomData,
            activeUsers: Array.from(this.activeUsers.values()),
            recentMessages: this.messages,
            canvasStrokes: this.canvasStrokes,
            gameState: this.gameState
          });
        }, 10);

        // Announce join to peer mesh
        this.broadcastPacket('JOIN_ANNOUNCE', { user, roomId });

        // Auto connect to room-specific peer mesh room swarm
        this.connectToRoomSwarm(roomId);
        break;
      }

      case 'send_message': {
        const { roomId, text, isEphemeral } = data;
        const msg = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sender: this.userProfile,
          text,
          isEphemeral: !!isEphemeral,
          timestamp: Date.now()
        };

        this.messages.push(msg);
        this.emitLocal('new_message', msg);
        this.broadcastPacket('NEW_MESSAGE', msg);

        // Check scribble guess if game is active
        if (this.isHost && this.gameState.isActive && this.gameState.type === 'scribble') {
          this.checkScribbleGuess(msg);
        }
        break;
      }

      case 'draw_stroke': {
        const { roomId, stroke } = data;
        this.canvasStrokes.push(stroke);
        this.emitLocal('stroke_received', stroke);
        this.broadcastPacket('STROKE_RECEIVED', stroke);
        break;
      }

      case 'clear_canvas': {
        this.canvasStrokes = [];
        this.emitLocal('canvas_cleared');
        this.broadcastPacket('CANVAS_CLEARED', {});
        break;
      }

      case 'typing_start': {
        const payload = { userName: this.userProfile?.name, isTyping: true };
        this.broadcastPacket('TYPING_UPDATE', payload);
        break;
      }

      case 'typing_stop': {
        const payload = { userName: this.userProfile?.name, isTyping: false };
        this.broadcastPacket('TYPING_UPDATE', payload);
        break;
      }

      case 'send_reaction': {
        const payload = { emoji: data.emoji };
        this.emitLocal('reaction_burst', payload);
        this.broadcastPacket('REACTION_BURST', payload);
        break;
      }

      case 'leave_room': {
        this.stopHeartbeat();
        if (this.activeRoomId && this.userProfile) {
          this.broadcastPacket('USER_LEFT', { user: this.userProfile, roomId: this.activeRoomId });
        }
        this.activeRoomId = null;
        this.activeUsers.clear();
        break;
      }

      // Game Actions
      case 'start_game': {
        this.startGame(data.gameType || this.roomData?.selectedGame || 'scribble');
        break;
      }

      case 'stop_game': {
        this.stopGame();
        break;
      }

      case 'trivia_submit_answer': {
        this.handleTriviaAnswer(data.answerIndex);
        break;
      }

      case 'wordchain_submit_word': {
        this.handleWordChainSubmit(data.word);
        break;
      }

      case 'emojipop_click_target': {
        this.handleEmojiPopClick(data.targetId);
        break;
      }

      case 'truthvent_next_prompt': {
        this.handleTruthVentNext();
        break;
      }

      default:
        break;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (!this.activeRoomId || !this.userProfile) return;
      this.broadcastPacket('HEARTBEAT_PING', {
        user: this.userProfile,
        roomId: this.activeRoomId
      });

      // Prune users who haven't pinged in > 10s
      const now = Date.now();
      let changed = false;
      this.activeUsers.forEach((user, id) => {
        if (id !== this.userProfile.id && user.lastPing && (now - user.lastPing > 10000)) {
          this.activeUsers.delete(id);
          changed = true;
        }
      });
      if (changed) {
        this.emitLocal('active_users_update', { activeUsers: Array.from(this.activeUsers.values()) });
      }
    }, 3200);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      if (callback) {
        this.listeners.get(event).delete(callback);
      } else {
        this.listeners.delete(event);
      }
    }
  }

  emitLocal(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in listener for ${event}:`, e);
        }
      });
    }
  }

  // ==========================================
  // ROOM SWARM CONNECTION (P2P Mesh Discovery)
  // ==========================================

  connectToRoomSwarm(roomId) {
    if (!this.peer) return;

    // We discover peers by checking broadcast announcements or shared room IDs
    if (this.channel) {
      this.channel.postMessage({
        type: 'ROOM_PEER_DISCOVERY',
        roomId,
        peerId: this.myPeerId
      });
    }
  }

  // ==========================================
  // MULTI-GAME STATE ENGINE
  // ==========================================

  startGame(type) {
    this.clearIntervalTimer();
    this.gameState.isActive = true;
    this.gameState.type = type;

    if (type === 'scribble') {
      this.startScribbleRound();
    } else if (type === 'trivia') {
      this.startTriviaRound();
    } else if (type === 'wordchain') {
      this.startWordChainRound();
    } else if (type === 'emojipop') {
      this.startEmojiPopRound();
    } else if (type === 'truthvent') {
      this.startTruthVentRound();
    }
  }

  stopGame() {
    this.clearIntervalTimer();
    this.gameState.isActive = false;
    this.emitLocal('game_stopped');
    this.broadcastPacket('GAME_STOPPED', {});
  }

  clearIntervalTimer() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  // 1. Scribble Round
  startScribbleRound() {
    const randomWord = CAMPUS_WORDS[Math.floor(Math.random() * CAMPUS_WORDS.length)];
    const maskedWord = randomWord.replace(/[a-zA-Z]/g, '_ ');

    this.gameState = {
      ...this.gameState,
      type: 'scribble',
      isActive: true,
      isDrawer: true,
      word: randomWord,
      maskedWord: randomWord,
      drawer: this.userProfile,
      timeLeft: 45,
      hasGuessed: new Set()
    };

    this.canvasStrokes = [];
    this.emitLocal('canvas_cleared');
    this.broadcastPacket('CANVAS_CLEARED', {});

    this.emitLocal('game_state_sync', this.gameState);
    this.broadcastPacket('GAME_STATE_SYNC', {
      ...this.gameState,
      isDrawer: false,
      word: maskedWord
    });

    const sysMsg = {
      id: `sys-${Date.now()}`,
      sender: { name: '🎮 Scribble Bot', color: '#f59e0b', avatar: '🎨' },
      text: `🎨 Round started! Draw "${randomWord}" on the canvas. Others will guess in chat!`,
      timestamp: Date.now(),
      isSystem: true
    };
    this.messages.push(sysMsg);
    this.emitLocal('new_message', sysMsg);
    this.broadcastPacket('NEW_MESSAGE', sysMsg);

    this.gameInterval = setInterval(() => {
      this.gameState.timeLeft -= 1;
      this.emitLocal('game_timer_tick', { timeLeft: this.gameState.timeLeft });
      this.broadcastPacket('GAME_TIMER_TICK', { timeLeft: this.gameState.timeLeft });

      if (this.gameState.timeLeft <= 0) {
        this.clearIntervalTimer();
        this.endScribbleRound('Time is up!');
      }
    }, 1000);
  }

  checkScribbleGuess(msg) {
    if (!this.gameState.word || !msg.text) return;
    const guess = msg.text.trim().toLowerCase();
    const target = this.gameState.word.toLowerCase();

    if (guess === target) {
      const user = msg.sender;
      const currentScore = this.gameState.scores[user?.name] || 0;
      this.gameState.scores[user?.name] = currentScore + 100;

      const successMsg = {
        id: `sys-win-${Date.now()}`,
        sender: { name: '🏆 Scribble Bot', color: '#10b981', avatar: '🎉' },
        text: `🔥 Correct! ${user?.name} guessed "${this.gameState.word}" (+100 pts)!`,
        timestamp: Date.now(),
        isSystem: true
      };
      this.messages.push(successMsg);
      this.emitLocal('new_message', successMsg);
      this.broadcastPacket('NEW_MESSAGE', successMsg);

      this.emitLocal('game_score_update', { scores: this.gameState.scores });
      this.broadcastPacket('GAME_SCORE_UPDATE', { scores: this.gameState.scores });

      this.endScribbleRound(`${user?.name} got it!`);
    }
  }

  endScribbleRound(reason) {
    this.clearIntervalTimer();
    const word = this.gameState.word;

    this.emitLocal('game_round_ended', { word, scores: this.gameState.scores });
    this.broadcastPacket('GAME_ROUND_ENDED', { word, scores: this.gameState.scores });

    setTimeout(() => {
      if (this.gameState.isActive && this.gameState.type === 'scribble') {
        this.startScribbleRound();
      }
    }, 4000);
  }

  // 2. Trivia Blitz Round
  startTriviaRound() {
    const q = TRIVIA_BANK[Math.floor(Math.random() * TRIVIA_BANK.length)];
    this.gameState = {
      ...this.gameState,
      type: 'trivia',
      isActive: true,
      question: q.question,
      options: q.options,
      category: q.category,
      timeLeft: 14,
      correctIndex: q.answerIndex
    };

    this.emitLocal('game_state_sync', this.gameState);
    this.broadcastPacket('GAME_STATE_SYNC', this.gameState);

    this.gameInterval = setInterval(() => {
      this.gameState.timeLeft -= 1;
      this.emitLocal('game_timer_tick', { timeLeft: this.gameState.timeLeft });
      this.broadcastPacket('GAME_TIMER_TICK', { timeLeft: this.gameState.timeLeft });

      if (this.gameState.timeLeft <= 0) {
        this.clearIntervalTimer();
        this.resolveTrivia();
      }
    }, 1000);
  }

  handleTriviaAnswer(answerIndex) {
    this.emitLocal('trivia_answer_acknowledged', { answerIndex });

    if (answerIndex === this.gameState.correctIndex) {
      const myName = this.userProfile?.name || 'You';
      this.gameState.scores[myName] = (this.gameState.scores[myName] || 0) + 20;
    }
  }

  resolveTrivia() {
    this.clearIntervalTimer();
    const correctIdx = this.gameState.correctIndex ?? 0;
    const correctOption = this.gameState.options?.[correctIdx] || '';

    const payload = {
      correctIndex: correctIdx,
      correctAnswer: correctOption,
      winners: [this.userProfile?.name || 'Player'],
      scores: this.gameState.scores
    };

    this.emitLocal('trivia_round_resolved', payload);
    this.broadcastPacket('TRIVIA_ROUND_RESOLVED', payload);

    setTimeout(() => {
      if (this.gameState.isActive && this.gameState.type === 'trivia') {
        this.startTriviaRound();
      }
    }, 4500);
  }

  // 3. Word Chain Round
  startWordChainRound() {
    const starters = ['Campus', 'Lecture', 'Exam', 'Coffee', 'Library', 'Design', 'Science'];
    const startWord = starters[Math.floor(Math.random() * starters.length)];
    const nextChar = startWord.slice(-1).toUpperCase();

    this.gameState = {
      ...this.gameState,
      type: 'wordchain',
      isActive: true,
      lastWord: startWord,
      currentLetter: nextChar,
      streakCount: 1,
      wordHistory: [startWord]
    };

    const payload = {
      type: 'wordchain',
      isActive: true,
      lastWord: startWord,
      currentLetter: nextChar,
      streakCount: 1,
      wordHistory: [startWord],
      scores: this.gameState.scores
    };

    this.emitLocal('game_state_sync', payload);
    this.emitLocal('word_chain_update', payload);
    this.broadcastPacket('GAME_STATE_SYNC', payload);
    this.broadcastPacket('WORD_CHAIN_UPDATE', payload);
  }

  handleWordChainSubmit(word) {
    if (!word) return;
    const cleaned = word.trim();
    const nextChar = cleaned.slice(-1).toUpperCase();
    const newStreak = this.gameState.streakCount + 1;
    const newHistory = [...this.gameState.wordHistory, cleaned];

    const myName = this.userProfile?.name || 'Player';
    this.gameState.scores[myName] = (this.gameState.scores[myName] || 0) + (10 * newStreak);

    this.gameState = {
      ...this.gameState,
      lastWord: cleaned,
      currentLetter: nextChar,
      streakCount: newStreak,
      wordHistory: newHistory
    };

    const payload = {
      lastWord: cleaned,
      currentLetter: nextChar,
      streakCount: newStreak,
      scores: this.gameState.scores,
      wordHistory: newHistory
    };

    this.emitLocal('word_chain_update', payload);
    this.broadcastPacket('WORD_CHAIN_UPDATE', payload);

    this.emitLocal('game_score_update', { scores: this.gameState.scores });
    this.broadcastPacket('GAME_SCORE_UPDATE', { scores: this.gameState.scores });
  }

  // 4. Emoji Pop Round
  startEmojiPopRound() {
    this.gameState.type = 'emojipop';
    this.gameState.isActive = true;
    this.spawnEmojiTargets();

    this.gameInterval = setInterval(() => {
      this.spawnEmojiTargets();
    }, 2800);
  }

  spawnEmojiTargets() {
    const count = 4;
    const newTargets = [];
    for (let i = 0; i < count; i++) {
      newTargets.push({
        id: `target-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        emoji: EMOJI_POP_TARGETS[Math.floor(Math.random() * EMOJI_POP_TARGETS.length)],
        x: Math.floor(15 + Math.random() * 70),
        y: Math.floor(15 + Math.random() * 65),
        points: 15,
        size: Math.floor(40 + Math.random() * 20)
      });
    }

    this.gameState.targets = newTargets;
    this.emitLocal('emoji_targets_respawn', { targets: newTargets });
    this.broadcastPacket('EMOJI_TARGETS_RESPAWN', { targets: newTargets });
  }

  handleEmojiPopClick(targetId) {
    this.gameState.targets = this.gameState.targets.filter(t => t.id !== targetId);
    const myName = this.userProfile?.name || 'Player';
    this.gameState.scores[myName] = (this.gameState.scores[myName] || 0) + 15;

    const payload = {
      targetId,
      poppedBy: myName,
      scores: this.gameState.scores
    };

    this.emitLocal('emoji_target_popped', payload);
    this.broadcastPacket('EMOJI_TARGET_POPPED', payload);

    this.emitLocal('game_score_update', { scores: this.gameState.scores });
    this.broadcastPacket('GAME_SCORE_UPDATE', { scores: this.gameState.scores });
  }

  // 5. Truth, Vent & Dare Round
  startTruthVentRound() {
    this.handleTruthVentNext();
  }

  handleTruthVentNext() {
    const prompt = TRUTH_VENT_DARE_PROMPTS[Math.floor(Math.random() * TRUTH_VENT_DARE_PROMPTS.length)];
    this.gameState = {
      ...this.gameState,
      type: 'truthvent',
      isActive: true,
      prompt
    };

    this.emitLocal('truthvent_state_sync', { prompt });
    this.broadcastPacket('TRUTHVENT_STATE_SYNC', { prompt });
  }

  // ==========================================
  // ROOM REGISTRY UTILITIES
  // ==========================================

  saveCustomRooms() {
    try {
      const custom = this.rooms.filter(r => !r.isPermanent);
      localStorage.setItem('soulnook_custom_rooms', JSON.stringify(custom));
    } catch (e) {}
  }

  broadcastRooms() {
    const payload = [...this.rooms];
    this.emitLocal('rooms_update', payload);
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'ROOMS_UPDATE',
          payload,
          senderPeerId: this.myPeerId
        });
      } catch (e) {}
    }
  }

  handleIncomingRooms(updatedRooms) {
    if (Array.isArray(updatedRooms) && updatedRooms.length > 0) {
      const existingIds = new Set(this.rooms.map(r => r.id));
      updatedRooms.forEach(r => {
        if (!existingIds.has(r.id)) {
          this.rooms.unshift(r);
        }
      });
      this.emitLocal('rooms_update', [...this.rooms]);
    }
  }

  getRooms() {
    return [...this.rooms];
  }
}

// Singleton Instance
export const realtimeMesh = new RealtimeMesh();
