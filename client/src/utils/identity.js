// Whimsical Campus Anonymous Identity Generator

const ADJECTIVES = [
  'Sleepy', 'Caffeinated', 'Midnight', 'Chaotic', 'Zen', 'Overthinking',
  'Mysterious', 'Cozy', 'Vibe-Checking', 'Debugging', 'Astral', 'Philosophical',
  'Chill', 'Pixelated', 'Nomadic', 'Velvet', 'Electric', 'Luminescent',
  'Gentle', 'Hypnotic', 'Quirky', 'Stargazing', 'Daydreaming', 'Neon'
];

const NOUNS = [
  'Engineer', 'Bio Major', 'Art Kid', 'Philosopher', 'Poet', 'Designer',
  'Coder', 'Night Owl', 'Dorm Hermit', 'Boba Addict', 'Procrastinator',
  'Campus Cat', 'Ghost of Library', 'Math Mystic', 'Synth Waver', 'Pencil Sketcher',
  'Caffeine Alchemist', 'Stargazer', 'Existentialist', 'Wanderer'
];

export const AVATARS = [
  '😴', '🐱', '🦊', '🐼', '🐨', '🐸', '🦉', '🐙', '🦄', '🦦',
  '☕', '🎨', '🌙', '🌌', '⚡', '🌿', '🔮', '🧸', '🎧', '🪐',
  '🧁', '🧩', '🚀', '🪄', '🌸', '🏮', '🔥', '🌊', '👻', '👾'
];

const ACCENT_COLORS = [
  '#8b5cf6', // Electric Violet
  '#10b981', // Mint Neon
  '#f59e0b', // Amber Warm
  '#f43f5e', // Rose Pink
  '#06b6d4', // Cyan Sky
  '#a855f7', // Purple
  '#3b82f6', // Cobalt Blue
  '#ec4899', // Hot Pink
  '#14b8a6', // Teal
  '#eab308'  // Lemon
];

const CAMPUS_MOODS = [
  'Powered by 3 espressos ☕',
  'Exam in 6 hours, vibing here ✨',
  'Just need a mental sanctuary 🌿',
  'Doodling away the semester stress 🎨',
  'Here to scream into the void 📢',
  'Seeking calm frequencies 🎧',
  'Procrastinating assignment 4 💻',
  'Decompressing after a brutal lab 🧪'
];

export function generateAnonymousIdentity() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
  const mood = CAMPUS_MOODS[Math.floor(Math.random() * CAMPUS_MOODS.length)];
  const id = `anon-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name: `${adj} ${noun}`,
    avatar,
    color,
    mood
  };
}
