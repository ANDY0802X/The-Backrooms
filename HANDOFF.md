# Handoff — Soulnook (The Decompression Lounge)

## Current state
Full-stack real-time web application built for Track 2 (Campus Problem Solver) with dark neumorphism theme and 5 multiplayer mini-games.

## Works
- **Zero-Friction Anonymous Identity Generator**: Random aliases (e.g., *Caffeinated Bio Major*), custom nick editing, avatar rolling.
- **5 Selectable Multiplayer Mini-Games**:
  1. *Campus Scribble & Guess* (Speed Pictionary with canvas & chat guess recognition).
  2. *Campus Trivia Blitz* (14s rapid buzzer with 4 neumorphic choices).
  3. *Rapid Word Chain* (Letter chain association with combo streaks).
  4. *Truth, Vent or Dare* (3D-like flip cards with campus confessionals).
  5. *Zen Ripple & Synchronized Breathing* (Collaborative harmony orb & 4-4-4 box breathing).
- **Collaborative Canvas**: High-DPI synchronized drawing pad, neon palette, stroke slider, eraser, PNG snapshot export.
- **Real-Time Vent Feed**: Live chat stream with optional 12-second dissolving vent mode.
- **Stealth Panic Shield**: One-click screen disguise displaying Linux OS kernel simulator.
- **Micro-Interactions**: Ambient lo-fi sound synthesizer, floating reaction particles.

## Broken
- None. Backend and frontend servers running smoothly with 0 errors.

## Next 3 things
1. Add room audio chat / voice memo vents if needed.
2. Expand trivia questions with campus-specific lore.
3. Deploy to production (Render/Vercel/Fly.io) for live demo.

## Decisions (and why)
- **Vanilla CSS + Neumorphism**: Provides maximum control over soft dual-tone extruded shadows and minimalist elegance without Tailwind bloat.
- **In-Memory Socket.io Architecture**: Zero database required, ensuring 100% ephemeral privacy for student venting.

## Don't retry
- Do not store user chat or canvas logs in persistent databases (violates zero-trace mental health sanctuary privacy).
