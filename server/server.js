import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_ORIGINS = [
  'https://ycrxi75f.insforge.site',
  'https://the-backrooms-1.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4173'
];

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.insforge.site') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.get('/', (req, res) => {
  res.send('🌌 TheBackrooms Socket.io backend is live and healthy!');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// ==========================================
// 1. GAME DATA BANKS
// ==========================================

const CAMPUS_WORDS = [
  'Coffee', 'All-Nighter', 'Boba Tea', 'Laptop Charger', 'Library Ghost',
  'Alarm Clock', 'Backpack', 'Sticky Notes', 'Final Exam', 'Pencil',
  'Calculator', 'Pizza Slice', 'Headphones', 'Campus Squirrel', 'Dorm Bed',
  'Whiteboard', 'Microphone', 'Textbook', 'Highlighter', 'Instant Ramen',
  'Energy Drink', 'Campus Clocktower', 'Lab Coat', 'Graduation Cap', 'Brain',
  'Campfire', 'Spaceship', 'Sunflower', 'Guitar', 'Sunglasses',
  'Sleeping Cat', 'Rainbow', 'Origami', 'Skateboard', 'Lightbulb'
];

const TRIVIA_BANK = [
  {
    question: "What percentage of college students pull an all-nighter at least once?",
    options: ["About 30%", "Over 70%", "Around 50%", "Less than 15%"],
    answerIndex: 1,
    category: "Campus Life"
  },
  {
    question: "Which programming language was originally called 'Oak'?",
    options: ["Python", "Java", "C++", "Ruby"],
    answerIndex: 1,
    category: "Tech"
  },
  {
    question: "How long is a power nap recommended to boost alertness without grogginess?",
    options: ["10-20 minutes", "45-60 minutes", "90 minutes", "5 minutes"],
    answerIndex: 0,
    category: "Wellness"
  },
  {
    question: "What was the first item ever purchased online with Bitcoin in 2010?",
    options: ["A MacBook", "Two Pizzas", "A College Textbook", "A Gaming Console"],
    answerIndex: 1,
    category: "Tech Trivia"
  },
  {
    question: "Which neurotransmitter is most associated with laughter and stress relief?",
    options: ["Cortisol", "Endorphins", "Melatonin", "Adrenaline"],
    answerIndex: 1,
    category: "Science"
  },
  {
    question: "What phenomenon describes studying in the same room improving recall?",
    options: ["Context-Dependent Memory", "Cognitive Drift", "Placebo Recall", "Synaptic Bounce"],
    answerIndex: 0,
    category: "Psychology"
  },
  {
    question: "In what year was the worldwide web made publicly available?",
    options: ["1985", "1991", "1995", "1999"],
    answerIndex: 1,
    category: "Tech History"
  },
  {
    question: "Which campus beverage has more caffeine per fluid ounce?",
    options: ["Drip Coffee", "Espresso", "Green Tea", "Matcha Latte"],
    answerIndex: 1,
    category: "Campus Culture"
  }
];

const TRUTH_VENT_DARE_PROMPTS = [
  { type: 'Vent', text: 'What is the most ridiculous exam curve or assignment you endured recently?' },
  { type: 'Truth', text: 'What is the biggest excuse you ever made up to skip an 8:00 AM class?' },
  { type: 'Dare', text: 'Draw your current energy level as an abstract monster in 15 seconds!' },
  { type: 'Vent', text: 'What campus dining hall food was an absolute war crime?' },
  { type: 'Truth', text: 'Have you ever secretly fallen asleep with your camera on in a Zoom class?' },
  { type: 'Dare', text: 'Send your most-used emoji 5 times in chat right now!' },
  { type: 'Vent', text: 'What textbook or software fee was an absolute scam?' },
  { type: 'Truth', text: 'What is your guilty pleasure 3:00 AM cramming snack?' },
  { type: 'Dare', text: 'Drop a 1-sentence hype speech for everyone in all capitals!' },
  { type: 'Truth', text: 'If you could swap your major right now with zero penalty, what would you pick?' }
];

const EMOJI_POP_TARGETS = ['🎯', '⭐', '🔥', '💎', '🦄', '🍕', '🎉', '⚡', '🐱', '🚀'];

// ==========================================
// 2. ROOM REGISTRY
// ==========================================
const rooms = new Map();

const defaultLounges = [
  {
    id: 'lounge-midnight-coffee',
    code: 'COFFEE',
    name: 'Midnight Espresso ☕',
    category: 'Study',
    selectedGame: 'scribble',
    description: 'Quiet crammers & 2AM chill lo-fi energy. Synchronized canvas & cozy chat.',
    tags: ['Quiet', 'Lo-Fi', 'Study'],
    created: Date.now(),
    isPermanent: true
  },
  {
    id: 'lounge-scribble-arena',
    code: 'DOODLE',
    name: 'Campus Scribble Arena 🎨',
    category: 'Mini-Game',
    selectedGame: 'scribble',
    description: 'Speed Pictionary rounds with campus prompts. Guess fast & score points!',
    tags: ['Drawing', 'Fast-Paced', 'Pictionary'],
    created: Date.now(),
    isPermanent: true
  },
  {
    id: 'lounge-trivia-blitz',
    code: 'TRIVIA',
    name: 'Campus Trivia Blitz ⚡',
    category: 'Mini-Game',
    selectedGame: 'trivia',
    description: 'Rapid-fire campus & tech trivia showdown. 14 seconds per question!',
    tags: ['Trivia', 'Buzzer', 'Challenge'],
    created: Date.now(),
    isPermanent: true
  },
  {
    id: 'lounge-word-chain',
    code: 'CHAINS',
    name: 'Rapid Word Chain 🔗',
    category: 'Mini-Game',
    selectedGame: 'wordchain',
    description: 'Keep the word chain alive without repeating or timing out. Build huge combos!',
    tags: ['WordGame', 'Speed', 'Combo'],
    created: Date.now(),
    isPermanent: true
  },
  {
    id: 'lounge-emoji-pop',
    code: 'ARCADE',
    name: 'Emoji Pop Reflex 💥',
    category: 'Mini-Game',
    selectedGame: 'emojipop',
    description: 'Fast-paced reaction arcade! Click the popping target emojis before they vanish.',
    tags: ['Arcade', 'Reflex', 'Pop'],
    created: Date.now(),
    isPermanent: true
  },
  {
    id: 'lounge-truth-vent',
    code: 'CONFES',
    name: 'Truth, Vent & Dare 🎭',
    category: 'Rant',
    selectedGame: 'truthvent',
    description: 'Zero-filter campus confessionals, cathartic vents, and hilarious dares.',
    tags: ['Confessions', 'Venting', 'Cathartic'],
    created: Date.now(),
    isPermanent: true
  }
];

// Initialize default rooms
defaultLounges.forEach(lounge => {
  rooms.set(lounge.id, {
    ...lounge,
    users: new Map(),
    canvasStrokes: [],
    messages: [],
    game: {
      type: lounge.selectedGame || 'scribble',
      isActive: false,
      scores: {},
      timerInterval: null,
      timeLeft: 30,

      // Scribble
      currentDrawer: null,
      currentWord: '',
      revealedWord: '',
      hasGuessed: new Set(),

      // Trivia
      triviaQuestion: null,
      triviaAnswers: new Map(),

      // Word Chain
      currentLetter: 'C',
      lastWord: 'Campus',
      wordHistory: ['Campus'],
      streakCount: 1,

      // Truth/Vent
      currentPrompt: null,

      // Emoji Pop
      emojiTargets: []
    }
  });
});

function formatRoomForLobby(room) {
  return {
    id: room.id,
    code: room.code || (room.id.startsWith('lounge-') ? room.id.replace('lounge-', '').slice(0, 6).toUpperCase() : room.id.slice(0, 6).toUpperCase()),
    name: room.name,
    category: room.category,
    selectedGame: room.game?.type || room.selectedGame || 'scribble',
    description: room.description,
    tags: room.tags || [],
    userCount: room.users ? room.users.size : 0,
    created: room.created,
    isGameActive: room.game?.isActive || false
  };
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: Date.now() });
});

app.get('/api/rooms', (req, res) => {
  res.json(Array.from(rooms.values()).map(formatRoomForLobby));
});

// ==========================================
// 3. MULTI-GAME ENGINE HANDLERS
// ==========================================

function clearRoomTimer(room) {
  if (room.game.timerInterval) {
    clearInterval(room.game.timerInterval);
    room.game.timerInterval = null;
  }
}

// 1. Scribble Game
function startScribbleGame(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size === 0) return;

  const userList = Array.from(room.users.values());
  const nextDrawer = userList[Math.floor(Math.random() * userList.length)];
  const randomWord = CAMPUS_WORDS[Math.floor(Math.random() * CAMPUS_WORDS.length)];
  const maskedWord = randomWord.replace(/[a-zA-Z]/g, '_ ');

  room.canvasStrokes = [];
  io.to(roomId).emit('canvas_cleared', { by: 'System' });

  clearRoomTimer(room);
  room.game.type = 'scribble';
  room.game.isActive = true;
  room.game.currentDrawer = nextDrawer;
  room.game.currentWord = randomWord;
  room.game.revealedWord = maskedWord;
  room.game.timeLeft = 45;
  room.game.hasGuessed = new Set();

  userList.forEach(u => {
    if (room.game.scores[u.id] === undefined) room.game.scores[u.id] = 0;
  });

  io.to(nextDrawer.socketId).emit('game_state_sync', {
    type: 'scribble',
    isActive: true,
    isDrawer: true,
    word: randomWord,
    maskedWord: randomWord,
    drawer: nextDrawer,
    timeLeft: 45,
    scores: room.game.scores
  });

  room.users.forEach(user => {
    if (user.socketId !== nextDrawer.socketId) {
      io.to(user.socketId).emit('game_state_sync', {
        type: 'scribble',
        isActive: true,
        isDrawer: false,
        word: maskedWord,
        maskedWord: maskedWord,
        drawer: nextDrawer,
        timeLeft: 45,
        scores: room.game.scores
      });
    }
  });

  const sysMsg = {
    id: `sys-${Date.now()}`,
    sender: { name: '🎮 Soulnook Bot', color: '#f59e0b', avatar: '🎨' },
    text: `Scribble round started! ${nextDrawer.name} is drawing. Guess the word in chat!`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', sysMsg);

  room.game.timerInterval = setInterval(() => {
    if (!room.game.isActive) {
      clearRoomTimer(room);
      return;
    }
    room.game.timeLeft -= 1;
    io.to(roomId).emit('game_timer_tick', { timeLeft: room.game.timeLeft });

    if (room.game.timeLeft <= 0) {
      clearRoomTimer(room);
      endScribbleRound(roomId, 'Time is up!');
    }
  }, 1000);
}

function endScribbleRound(roomId, reason) {
  const room = rooms.get(roomId);
  if (!room) return;
  clearRoomTimer(room);

  const word = room.game.currentWord;
  io.to(roomId).emit('game_round_ended', {
    word,
    reason,
    scores: room.game.scores
  });

  const endMsg = {
    id: `sys-end-${Date.now()}`,
    sender: { name: '🎮 Soulnook Bot', color: '#f59e0b', avatar: '🏆' },
    text: `Round over! The secret word was: "${word}". Next round starting shortly...`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', endMsg);

  setTimeout(() => {
    if (room.users.size >= 1 && room.game.isActive && room.game.type === 'scribble') {
      startScribbleGame(roomId);
    }
  }, 5000);
}

// 2. Trivia Blitz Game
function startTriviaGame(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size === 0) return;

  clearRoomTimer(room);
  const q = TRIVIA_BANK[Math.floor(Math.random() * TRIVIA_BANK.length)];
  room.game.type = 'trivia';
  room.game.isActive = true;
  room.game.triviaQuestion = q;
  room.game.triviaAnswers = new Map();
  room.game.timeLeft = 14;

  const userList = Array.from(room.users.values());
  userList.forEach(u => {
    if (room.game.scores[u.id] === undefined) room.game.scores[u.id] = 0;
  });

  io.to(roomId).emit('game_state_sync', {
    type: 'trivia',
    isActive: true,
    question: q.question,
    options: q.options,
    category: q.category,
    timeLeft: 14,
    scores: room.game.scores
  });

  const sysMsg = {
    id: `sys-triv-${Date.now()}`,
    sender: { name: '⚡ Trivia Bot', color: '#8b5cf6', avatar: '🧠' },
    text: `New Trivia Question! Select your answer within 14 seconds!`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', sysMsg);

  room.game.timerInterval = setInterval(() => {
    if (!room.game.isActive) {
      clearRoomTimer(room);
      return;
    }
    room.game.timeLeft -= 1;
    io.to(roomId).emit('game_timer_tick', { timeLeft: room.game.timeLeft });

    if (room.game.timeLeft <= 0) {
      clearRoomTimer(room);
      resolveTriviaRound(roomId);
    }
  }, 1000);
}

function resolveTriviaRound(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.game.triviaQuestion) return;

  const q = room.game.triviaQuestion;
  const correctIdx = q.answerIndex;
  const correctOption = q.options[correctIdx];

  const winners = [];
  room.game.triviaAnswers.forEach((ansIdx, userId) => {
    if (ansIdx === correctIdx) {
      room.game.scores[userId] = (room.game.scores[userId] || 0) + 20;
      const user = Array.from(room.users.values()).find(u => u.id === userId);
      if (user) winners.push(user.name);
    }
  });

  io.to(roomId).emit('trivia_round_resolved', {
    correctIndex: correctIdx,
    correctAnswer: correctOption,
    winners,
    scores: room.game.scores
  });

  const resMsg = {
    id: `sys-triv-end-${Date.now()}`,
    sender: { name: '⚡ Trivia Bot', color: '#10b981', avatar: '🏆' },
    text: `Correct Answer: "${correctOption}". ${winners.length > 0 ? `Scored +20: ${winners.join(', ')}!` : 'No one answered correctly!'}`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', resMsg);

  setTimeout(() => {
    if (room.users.size >= 1 && room.game.isActive && room.game.type === 'trivia') {
      startTriviaGame(roomId);
    }
  }, 4500);
}

// 3. Word Chain Game
function startWordChainGame(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size === 0) return;

  clearRoomTimer(room);
  const starterWords = ['Campus', 'Lecture', 'Exam', 'Coffee', 'Library', 'Design', 'Science', 'Student'];
  const startWord = starterWords[Math.floor(Math.random() * starterWords.length)];
  const nextChar = startWord.slice(-1).toUpperCase();

  room.game.type = 'wordchain';
  room.game.isActive = true;
  room.game.lastWord = startWord;
  room.game.currentLetter = nextChar;
  room.game.wordHistory = [startWord];
  room.game.streakCount = 1;
  room.game.timeLeft = 16;

  const userList = Array.from(room.users.values());
  userList.forEach(u => {
    if (room.game.scores[u.id] === undefined) room.game.scores[u.id] = 0;
  });

  io.to(roomId).emit('game_state_sync', {
    type: 'wordchain',
    isActive: true,
    lastWord: startWord,
    currentLetter: nextChar,
    streakCount: 1,
    wordHistory: room.game.wordHistory,
    timeLeft: 16,
    scores: room.game.scores
  });

  const sysMsg = {
    id: `sys-chain-${Date.now()}`,
    sender: { name: '🔗 Word Chain', color: '#06b6d4', avatar: '🔤' },
    text: `Word Chain started! Next word must begin with letter "${nextChar}"!`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', sysMsg);

  room.game.timerInterval = setInterval(() => {
    if (!room.game.isActive) {
      clearRoomTimer(room);
      return;
    }
    room.game.timeLeft -= 1;
    io.to(roomId).emit('game_timer_tick', { timeLeft: room.game.timeLeft });

    if (room.game.timeLeft <= 0) {
      clearRoomTimer(room);
      const timeoutMsg = {
        id: `sys-chain-reset-${Date.now()}`,
        sender: { name: '🔗 Word Chain', color: '#f43f5e', avatar: '⏳' },
        text: `Time's up! The chain broke at a streak of ${room.game.streakCount}. Resetting chain!`,
        timestamp: Date.now(),
        isSystem: true
      };
      io.to(roomId).emit('new_message', timeoutMsg);

      setTimeout(() => {
        if (room.game.isActive && room.game.type === 'wordchain') {
          startWordChainGame(roomId);
        }
      }, 3000);
    }
  }, 1000);
}

// 4. Truth, Vent or Dare
function startTruthVentGame(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size === 0) return;

  clearRoomTimer(room);
  const prompt = TRUTH_VENT_DARE_PROMPTS[Math.floor(Math.random() * TRUTH_VENT_DARE_PROMPTS.length)];
  room.game.type = 'truthvent';
  room.game.isActive = true;
  room.game.currentPrompt = prompt;
  room.game.timeLeft = 60;

  io.to(roomId).emit('game_state_sync', {
    type: 'truthvent',
    isActive: true,
    prompt: prompt,
    timeLeft: 60,
    scores: room.game.scores
  });

  const sysMsg = {
    id: `sys-tvd-${Date.now()}`,
    sender: { name: '🎭 Confessions', color: '#f43f5e', avatar: '🔮' },
    text: `[${prompt.type.toUpperCase()}]: ${prompt.text}`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', sysMsg);
}

// 5. Emoji Pop Reflex Arcade
function startEmojiPopGame(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size === 0) return;

  clearRoomTimer(room);
  room.game.type = 'emojipop';
  room.game.isActive = true;
  room.game.timeLeft = 30;

  // Generate 6 random floating target emojis with coords & points
  const spawnTargets = () => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `target-${Date.now()}-${i}-${Math.random()}`,
      emoji: EMOJI_POP_TARGETS[Math.floor(Math.random() * EMOJI_POP_TARGETS.length)],
      x: 10 + Math.random() * 80,
      y: 15 + Math.random() * 70,
      size: 44 + Math.random() * 20,
      points: 10 + Math.floor(Math.random() * 15)
    }));
  };

  room.game.emojiTargets = spawnTargets();

  io.to(roomId).emit('game_state_sync', {
    type: 'emojipop',
    isActive: true,
    timeLeft: 30,
    targets: room.game.emojiTargets,
    scores: room.game.scores
  });

  const sysMsg = {
    id: `sys-pop-${Date.now()}`,
    sender: { name: '💥 Pop Arcade', color: '#ec4899', avatar: '🎯' },
    text: `Emoji Pop Arena started! Click the floating emojis fast to rack up combo points!`,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('new_message', sysMsg);

  room.game.timerInterval = setInterval(() => {
    if (!room.game.isActive) {
      clearRoomTimer(room);
      return;
    }
    room.game.timeLeft -= 1;
    io.to(roomId).emit('game_timer_tick', { timeLeft: room.game.timeLeft });

    // Respawn targets periodically
    if (room.game.timeLeft % 4 === 0) {
      room.game.emojiTargets = spawnTargets();
      io.to(roomId).emit('emoji_targets_respawn', { targets: room.game.emojiTargets });
    }

    if (room.game.timeLeft <= 0) {
      clearRoomTimer(room);
      io.to(roomId).emit('game_round_ended', {
        reason: 'Arcade Round Finished!',
        scores: room.game.scores
      });

      const endMsg = {
        id: `sys-pop-end-${Date.now()}`,
        sender: { name: '💥 Pop Arcade', color: '#10b981', avatar: '🏆' },
        text: `Game over! Check the scoreboard. Next round launching in 5 seconds!`,
        timestamp: Date.now(),
        isSystem: true
      };
      io.to(roomId).emit('new_message', endMsg);

      setTimeout(() => {
        if (room.users.size >= 1 && room.game.isActive && room.game.type === 'emojipop') {
          startEmojiPopGame(roomId);
        }
      }, 5000);
    }
  }, 1000);
}

function launchGame(roomId, gameType) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.game.type = gameType;
  switch (gameType) {
    case 'trivia':
      startTriviaGame(roomId);
      break;
    case 'wordchain':
      startWordChainGame(roomId);
      break;
    case 'truthvent':
      startTruthVentGame(roomId);
      break;
    case 'emojipop':
      startEmojiPopGame(roomId);
      break;
    case 'scribble':
    default:
      startScribbleGame(roomId);
      break;
  }
}

// ==========================================
// 4. SOCKET.IO EVENT LOOP
// ==========================================
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUser = null;

  socket.emit('rooms_update', Array.from(rooms.values()).map(formatRoomForLobby));

  // Create Room
  socket.on('create_room', (roomData, callback) => {
    const roomId = `lounge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const selectedGame = roomData.selectedGame || 'scribble';
    const roomCode = (roomData.code || roomId.replace('lounge-', '').slice(0, 6)).toUpperCase();

    const newRoom = {
      id: roomId,
      code: roomCode,
      name: roomData.name || 'Cozy Anonymous Corner ☕',
      category: roomData.category || 'General',
      selectedGame,
      description: roomData.description || 'A cozy space to vent and recharge.',
      tags: roomData.tags || ['Ephemeral', 'Vent'],
      created: Date.now(),
      isPermanent: false,
      users: new Map(),
      canvasStrokes: [],
      messages: [],
      game: {
        type: selectedGame,
        isActive: false,
        scores: {},
        timerInterval: null,
        timeLeft: 30,
        currentDrawer: null,
        currentWord: '',
        revealedWord: '',
        hasGuessed: new Set(),
        triviaQuestion: null,
        triviaAnswers: new Map(),
        currentLetter: 'C',
        lastWord: 'Campus',
        wordHistory: ['Campus'],
        streakCount: 1,
        currentPrompt: null,
        emojiTargets: []
      }
    };

    rooms.set(roomId, newRoom);
    io.emit('rooms_update', Array.from(rooms.values()).map(formatRoomForLobby));

    if (typeof callback === 'function') {
      callback({ success: true, roomId, code: roomCode });
    }
  });

  // Join Room by Code
  socket.on('join_room_by_code', (data, callback) => {
    const rawCode = (typeof data === 'string' ? data : (data?.code || '')).trim().replace(/^#/, '').toUpperCase();
    if (!rawCode) {
      if (typeof callback === 'function') callback({ success: false, error: 'Invalid room code' });
      return;
    }

    let targetRoom = Array.from(rooms.values()).find(r => 
      (r.code && r.code.toUpperCase() === rawCode) ||
      r.id.toUpperCase() === rawCode ||
      r.id.toUpperCase() === `LOUNGE-${rawCode}`
    );

    if (!targetRoom) {
      // Create ephemeral room for custom code so multiple peers enter the same room
      const newRoomId = `lounge-${rawCode.toLowerCase()}`;
      targetRoom = {
        id: newRoomId,
        code: rawCode,
        name: `Private Lounge #${rawCode}`,
        category: 'General',
        selectedGame: 'scribble',
        description: `Private room joined with code #${rawCode}`,
        tags: ['Private', 'Code-Room'],
        created: Date.now(),
        isPermanent: false,
        users: new Map(),
        canvasStrokes: [],
        messages: [],
        game: {
          type: 'scribble',
          isActive: false,
          scores: {},
          timerInterval: null,
          timeLeft: 30,
          currentDrawer: null,
          currentWord: '',
          revealedWord: '',
          hasGuessed: new Set(),
          triviaQuestion: null,
          triviaAnswers: new Map(),
          currentLetter: 'C',
          lastWord: 'Campus',
          wordHistory: ['Campus'],
          streakCount: 1,
          currentPrompt: null,
          emojiTargets: []
        }
      };
      rooms.set(newRoomId, targetRoom);
      io.emit('rooms_update', Array.from(rooms.values()).map(formatRoomForLobby));
    }

    if (typeof callback === 'function') {
      callback({ success: true, roomId: targetRoom.id });
    }
  });

  // Join Room
  socket.on('join_room', ({ roomId, user }) => {
    let room = rooms.get(roomId);
    if (!room) {
      socket.emit('error_message', 'Room does not exist or has expired.');
      return;
    }

    if (currentRoomId && currentRoomId !== roomId) {
      socket.leave(currentRoomId);
      const prevRoom = rooms.get(currentRoomId);
      if (prevRoom) {
        prevRoom.users.delete(socket.id);
        io.to(currentRoomId).emit('user_left', {
          socketId: socket.id,
          user: currentUser,
          activeUsers: Array.from(prevRoom.users.values())
        });
      }
    }

    currentRoomId = roomId;
    currentUser = {
      ...user,
      socketId: socket.id,
      joinedAt: Date.now()
    };

    socket.join(roomId);
    room.users.set(socket.id, currentUser);

    socket.emit('room_joined_data', {
      room: {
        id: room.id,
        code: room.code || (room.id.startsWith('lounge-') ? room.id.replace('lounge-', '').slice(0, 6).toUpperCase() : room.id.slice(0, 6).toUpperCase()),
        name: room.name,
        category: room.category,
        selectedGame: room.game.type,
        description: room.description,
        tags: room.tags
      },
      activeUsers: Array.from(room.users.values()),
      canvasStrokes: room.canvasStrokes,
      recentMessages: room.messages.slice(-50),
      gameState: {
        type: room.game.type,
        isActive: room.game.isActive,
        isDrawer: room.game.currentDrawer?.id === currentUser.id,
        word: room.game.currentDrawer?.id === currentUser.id
          ? room.game.currentWord
          : room.game.revealedWord,
        maskedWord: room.game.revealedWord,
        drawer: room.game.currentDrawer,
        timeLeft: room.game.timeLeft,
        scores: room.game.scores,
        triviaQuestion: room.game.triviaQuestion,
        currentLetter: room.game.currentLetter,
        lastWord: room.game.lastWord,
        streakCount: room.game.streakCount,
        prompt: room.game.currentPrompt,
        targets: room.game.emojiTargets
      }
    });

    socket.to(roomId).emit('user_joined', {
      user: currentUser,
      activeUsers: Array.from(room.users.values())
    });

    const welcomeMsg = {
      id: `sys-${Date.now()}-${Math.random()}`,
      sender: { name: '✨ Soulnook Sanctuary', color: '#10b981', avatar: '🌿' },
      text: `${currentUser.name} stepped into the lounge.`,
      timestamp: Date.now(),
      isSystem: true
    };
    room.messages.push(welcomeMsg);
    io.to(roomId).emit('new_message', welcomeMsg);

    io.emit('rooms_update', Array.from(rooms.values()).map(formatRoomForLobby));
  });

  // Canvas
  socket.on('draw_stroke', (strokeData) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    if (room.game.isActive && room.game.type === 'scribble') {
      if (room.game.currentDrawer?.id !== currentUser?.id) return;
    }

    room.canvasStrokes.push(strokeData);
    if (room.canvasStrokes.length > 2000) room.canvasStrokes.shift();
    socket.to(currentRoomId).emit('stroke_received', strokeData);
  });

  socket.on('clear_canvas', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.canvasStrokes = [];
    io.to(currentRoomId).emit('canvas_cleared', { by: currentUser?.name || 'Someone' });
  });

  // Chat message & game checking
  socket.on('send_message', (msgPayload) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const messageText = (msgPayload.text || '').trim();
    if (!messageText) return;

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender: currentUser || { name: 'Anonymous', color: '#8b5cf6', avatar: '🎭' },
      text: messageText,
      timestamp: Date.now(),
      isEphemeral: msgPayload.isEphemeral || false,
      isSystem: false
    };

    // 1. Scribble Guess Check
    if (room.game.isActive && room.game.type === 'scribble' && room.game.currentWord) {
      const isDrawer = room.game.currentDrawer?.id === currentUser?.id;
      const cleanGuess = messageText.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanTarget = room.game.currentWord.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (!isDrawer && cleanGuess === cleanTarget) {
        if (!room.game.hasGuessed.has(currentUser.id)) {
          room.game.hasGuessed.add(currentUser.id);
          const guesserPoints = Math.max(10, Math.floor(room.game.timeLeft * 2));
          room.game.scores[currentUser.id] = (room.game.scores[currentUser.id] || 0) + guesserPoints;
          const drawerId = room.game.currentDrawer.id;
          room.game.scores[drawerId] = (room.game.scores[drawerId] || 0) + 15;

          const correctMsg = {
            id: `sys-guess-${Date.now()}`,
            sender: { name: '🎉 Scribble Bot', color: '#10b981', avatar: '🏆' },
            text: `🎯 ${currentUser.name} guessed the word correctly! (+${guesserPoints} pts)`,
            timestamp: Date.now(),
            isSystem: true
          };
          io.to(currentRoomId).emit('new_message', correctMsg);
          io.to(currentRoomId).emit('game_score_update', { scores: room.game.scores });

          const nonDrawers = Array.from(room.users.values()).filter(u => u.id !== drawerId);
          if (room.game.hasGuessed.size >= nonDrawers.length && nonDrawers.length > 0) {
            endScribbleRound(currentRoomId, 'Everyone guessed it!');
          }
          return;
        }
      }
    }

    // 2. Word Chain Check
    if (room.game.isActive && room.game.type === 'wordchain') {
      const cleanWord = messageText.trim().toUpperCase();
      const requiredChar = room.game.currentLetter;

      if (cleanWord.length >= 2 && cleanWord.startsWith(requiredChar)) {
        if (!room.game.wordHistory.includes(cleanWord)) {
          room.game.wordHistory.push(cleanWord);
          room.game.lastWord = cleanWord;
          room.game.currentLetter = cleanWord.slice(-1);
          room.game.streakCount += 1;
          room.game.timeLeft = 16;

          room.game.scores[currentUser.id] = (room.game.scores[currentUser.id] || 0) + (room.game.streakCount * 5);

          const chainMsg = {
            id: `sys-chain-hit-${Date.now()}`,
            sender: { name: '🔗 Word Chain', color: '#06b6d4', avatar: '⚡' },
            text: `✨ ${currentUser.name} played "${cleanWord}"! (Streak: ${room.game.streakCount}x). Next letter: "${room.game.currentLetter}"`,
            timestamp: Date.now(),
            isSystem: true
          };
          io.to(currentRoomId).emit('new_message', chainMsg);
          io.to(currentRoomId).emit('word_chain_update', {
            lastWord: cleanWord,
            currentLetter: room.game.currentLetter,
            streakCount: room.game.streakCount,
            scores: room.game.scores
          });
          return;
        }
      }
    }

    room.messages.push(message);
    if (room.messages.length > 100) room.messages.shift();
    io.to(currentRoomId).emit('new_message', message);
  });

  // Trivia answer submit
  socket.on('submit_trivia_answer', ({ answerIndex }) => {
    if (!currentRoomId || !currentUser) return;
    const room = rooms.get(currentRoomId);
    if (!room || !room.game.isActive || room.game.type !== 'trivia') return;

    room.game.triviaAnswers.set(currentUser.id, answerIndex);
    socket.emit('trivia_answer_acknowledged', { answerIndex });
  });

  // Emoji Pop Target Clicked
  socket.on('pop_emoji_target', ({ targetId, points }) => {
    if (!currentRoomId || !currentUser) return;
    const room = rooms.get(currentRoomId);
    if (!room || !room.game.isActive || room.game.type !== 'emojipop') return;

    // Filter out popped target
    room.game.emojiTargets = (room.game.emojiTargets || []).filter(t => t.id !== targetId);
    room.game.scores[currentUser.id] = (room.game.scores[currentUser.id] || 0) + (points || 10);

    io.to(currentRoomId).emit('emoji_target_popped', {
      targetId,
      poppedBy: currentUser,
      scores: room.game.scores
    });
  });

  // Switch or Toggle Game
  socket.on('switch_game', ({ gameType }) => {
    if (!currentRoomId) return;
    launchGame(currentRoomId, gameType);
  });

  socket.on('toggle_game', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    if (room.game.isActive) {
      room.game.isActive = false;
      clearRoomTimer(room);
      io.to(currentRoomId).emit('game_stopped');
    } else {
      launchGame(currentRoomId, room.game.type || 'scribble');
    }
  });

  socket.on('next_truth_vent_prompt', () => {
    if (!currentRoomId) return;
    startTruthVentGame(currentRoomId);
  });

  socket.on('typing_status', ({ isTyping }) => {
    if (!currentRoomId || !currentUser) return;
    socket.to(currentRoomId).emit('user_typing_update', {
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping
    });
  });

  socket.on('send_reaction', ({ emoji }) => {
    if (!currentRoomId || !currentUser) return;
    io.to(currentRoomId).emit('reaction_burst', {
      emoji,
      userId: currentUser.id,
      userName: currentUser.name,
      id: Math.random()
    });
  });

  const handleLeave = () => {
    if (currentRoomId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.users.delete(socket.id);
        socket.to(currentRoomId).emit('user_left', {
          socketId: socket.id,
          user: currentUser,
          activeUsers: Array.from(room.users.values())
        });

        if (room.game.isActive && room.game.type === 'scribble' && room.game.currentDrawer?.id === currentUser?.id) {
          endScribbleRound(currentRoomId, 'The drawer stepped out.');
        }

        if (!room.isPermanent && room.users.size === 0) {
          clearRoomTimer(room);
          setTimeout(() => {
            const checkRoom = rooms.get(currentRoomId);
            if (checkRoom && checkRoom.users.size === 0 && !checkRoom.isPermanent) {
              rooms.delete(currentRoomId);
              io.emit('rooms_update', Array.from(rooms.values()).map(formatRoomForLobby));
            }
          }, 60000);
        }
      }

      io.emit('rooms_update', Array.from(rooms.values()).map(formatRoomForLobby));
      currentRoomId = null;
    }
  };

  socket.on('leave_room', handleLeave);
  socket.on('disconnect', handleLeave);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TheBackrooms Socket.io Backend',
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

const clientDist = path.join(__dirname, '../client/dist');
const indexHtml = path.join(clientDist, 'index.html');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.get('*', (req, res) => {
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.json({
      status: 'live',
      service: 'TheBackrooms Socket.io Backend',
      socketEndpoint: '/socket.io/',
      activeRooms: rooms.size
    });
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🌌 Soulnook Decompression Lounge server live on port ${PORT}`);
});
