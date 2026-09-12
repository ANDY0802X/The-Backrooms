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

export const DICEBEAR_STYLES = ['notionists', 'micah', 'shapes', 'bottts-neutral'];
export const DEFAULT_AVATAR_STYLE = 'notionists';

export const CURATED_SEEDS = [
  'gentle-cat', 'midnight-owl', 'zen-hermit', 'coffee-sketcher',
  'astro-student', 'cozy-fox', 'dorm-dreamer', 'neon-wanderer',
  'quiet-bot', 'moon-stargazer', 'caffeine-alchemist', 'paper-plane',
  'sleepy-panda', 'cyber-philosopher', 'pixel-artist', 'math-mystic',
  'campus-ghost', 'boba-runner', 'velvet-poet', 'synth-waver',
  'chilly-otter', 'lofi-listener', 'chai-connoisseur', 'solitary-cloud'
];

export function getDiceBearAvatarUrl(seed, style = DEFAULT_AVATAR_STYLE) {
  const cleanSeed = encodeURIComponent(String(seed || 'student').trim());
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&backgroundColor=transparent`;
}

export function cycleAvatarSeed(currentSeed, direction = 1, style = DEFAULT_AVATAR_STYLE) {
  let idx = CURATED_SEEDS.indexOf(currentSeed);
  if (idx === -1) {
    idx = 0;
  }
  const nextIdx = (idx + direction + CURATED_SEEDS.length) % CURATED_SEEDS.length;
  const nextSeed = CURATED_SEEDS[nextIdx];
  return {
    seed: nextSeed,
    avatar: getDiceBearAvatarUrl(nextSeed, style),
    index: nextIdx
  };
}

export const AVATARS = CURATED_SEEDS;

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

export function generateAnonymousIdentity(style = DEFAULT_AVATAR_STYLE) {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const seedIdx = Math.floor(Math.random() * CURATED_SEEDS.length);
  const seed = CURATED_SEEDS[seedIdx];
  const avatar = getDiceBearAvatarUrl(seed, style);
  const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
  const mood = CAMPUS_MOODS[Math.floor(Math.random() * CAMPUS_MOODS.length)];
  const id = `anon-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name: `${adj} ${noun}`,
    avatar,
    avatarSeed: seed,
    avatarIndex: seedIdx,
    avatarStyle: style,
    color,
    mood
  };
}

