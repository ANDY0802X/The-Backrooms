export const CAMPUS_WORDS = [
  'Coffee', 'All-Nighter', 'Boba Tea', 'Laptop Charger', 'Library Ghost',
  'Alarm Clock', 'Backpack', 'Sticky Notes', 'Final Exam', 'Pencil',
  'Calculator', 'Pizza Slice', 'Headphones', 'Campus Squirrel', 'Dorm Bed',
  'Whiteboard', 'Microphone', 'Textbook', 'Highlighter', 'Instant Ramen',
  'Energy Drink', 'Campus Clocktower', 'Lab Coat', 'Graduation Cap', 'Brain',
  'Campfire', 'Spaceship', 'Sunflower', 'Guitar', 'Sunglasses',
  'Sleeping Cat', 'Rainbow', 'Origami', 'Skateboard', 'Lightbulb'
];

export const TRIVIA_BANK = [
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

export const TRUTH_VENT_DARE_PROMPTS = [
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

export const EMOJI_POP_TARGETS = ['🎯', '⭐', '🔥', '💎', '🦄', '🍕', '🎉', '⚡', '🐱', '🚀'];

export const DEFAULT_LOUNGES = [
  {
    id: 'lounge-midnight-coffee',
    code: 'COFFEE',
    name: 'Midnight Espresso ☕',
    category: 'Study',
    selectedGame: 'scribble',
    description: 'Quiet crammers & 2AM chill lo-fi energy. Synchronized canvas & cozy chat.',
    tags: ['Quiet', 'Lo-Fi', 'Study'],
    created: Date.now(),
    isPermanent: true,
    userCount: 3
  },
  {
    id: 'lounge-scribble-jam',
    code: 'DOODLE',
    name: 'Campus Scribble Lounge 🎨',
    category: 'Mini-Game',
    selectedGame: 'scribble',
    description: 'Speed Pictionary rounds with campus prompts. Guess fast & score points!',
    tags: ['Drawing', 'Fast-Paced', 'Pictionary'],
    created: Date.now(),
    isPermanent: true,
    userCount: 4
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
    isPermanent: true,
    userCount: 2
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
    isPermanent: true,
    userCount: 5
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
    isPermanent: true,
    userCount: 2
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
    isPermanent: true,
    userCount: 3
  }
];

