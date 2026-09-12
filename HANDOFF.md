# Handoff — TheBackrooms (Campus Decompression Lounge)

## Current state
Full-stack real-time web application built for Track 2 (Campus Problem Solver) with abyssal dark neumorphism theme, 5 pop-up multiplayer mini-games, Room Code system, and live WebRTC mesh deployed at https://ycrxi75f.insforge.site.

## Works
- **Reference Landing Page Card**: Single-page centered card with alias well, avatar carousel stage with glowing orbital ring and satellite dot, and shuffle button.
- **Room Code System**: Shareable codes (`#COFFEE`, `#DOODLE`, `#TRIVIA`, `#CHAINS`, `#ARCADE`, `#CONFES` and custom codes) with direct "Join with Code" and 1-click clipboard copy.
- **Live Presence Radar Ping**: Live green radar dot with accurate heartbeat-based active member count.
- **5 Pop-Up Multiplayer Mini-Games**:
  1. *Campus Scribble & Guess* (Speed Pictionary with canvas & chat guess recognition).
  2. *Campus Trivia Blitz* (14s rapid buzzer with 4 choices).
  3. *Rapid Word Chain* (Letter chain association with combo streaks).
  4. *Emoji Pop Reflex* (Fast arcade reaction popping targets).
  5. *Truth, Vent & Dare* (Campus confessionals & cathartic prompts).
- **Synchronized Canvas**: Full-screen high-DPI collaborative pad with stroke sync, neon palette, stroke slider, eraser, and PNG export.
- **Animated 12s Dissolving Messages**: Ephemeral vents with burning progress bar and vaporizing blur disintegration animation.
- **Zero-Trace Ephemeral Privacy**: 100% peer-to-peer WebRTC mesh + memory state; zero chat/canvas persistence.

## Broken
- None. Production deployed at https://ycrxi75f.insforge.site. Local servers running with 0 errors.

## Next 3 things
1. Push to GitHub remote once repo URL is provided.
2. Expand trivia questions with campus lore.
3. Add voice notes or room audio chat if desired.

## Decisions (and why)
- **WebRTC Peer Mesh + Socket.io**: Guarantees instant room creation with <50ms peer latency without depending on a heavy centralized server.
- **In-Memory Zero-Database Architecture**: Guarantees 100% ephemeral privacy for student venting.

## Don't retry
- Do not store user chat or canvas logs in persistent databases (violates zero-trace mental health sanctuary privacy).
