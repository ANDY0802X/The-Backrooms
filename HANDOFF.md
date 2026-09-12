# Handoff — TheBackrooms (Campus Decompression Lounge)

## Current state
Full-stack real-time web application built for Track 2 (Campus Problem Solver) with editorial minimalism theme (warm linen cream in light mode, obsidian void in dark mode), 5 interactive multiplayer mini-games, real-time interactive Campus Map with verified CARTO tiles, live room polls, and ephemeral privacy architecture.

## Works
- **Reference Landing Page**: Clean editorial serif/italic hero typography, alias well, DiceBear Notionist avatar carousel stage with smooth deterministic seed cycling, sound engine chime triggers, and solid black pill action buttons.
- **Interactive Campus Map**:
  - CARTO light & dark basemaps authenticated via API key (`?key=cb1_3is0_1_3f7e9042a974f4b1055148a4`) with watermark-free rendering.
  - Filtered OpenStreetMap GeoJSON polygon features with zero unwanted blue Point markers.
  - Sleek capsule markers for Lounges, Campus Marketplace, and Lost & Found.
  - "DROP PIN" mode with live banner, crosshair cursor across all layers, and instant coordinate selection.
- **Room Code System**: Shareable codes with direct "Join with Code" and 1-click clipboard copy.
- **Live Room Polls**: Real-time multi-choice polling with instant socket sync (`create_poll`, `vote_poll`, `close_poll`), animated percentage bars, voter deduplication/switching, and conclusion controls.
- **Lost & Found & Marketplace Drawers**: High z-index (99999) modals with instant comment threads and sighting replies.
- **5 Pop-Up Multiplayer Mini-Games**:
  1. *Campus Scribble & Guess* (Speed Pictionary with canvas & chat guess recognition).
  2. *Campus Trivia Blitz* (14s rapid buzzer with 4 choices).
  3. *Rapid Word Chain* (Letter chain association with combo streaks).
  4. *Emoji Pop Reflex* (Fast arcade reaction popping targets).
  5. *Truth, Vent & Dare* (Campus confessionals & cathartic prompts).
- **Synchronized Canvas**: Full-screen high-DPI collaborative pad with stroke sync, neon palette, stroke slider, eraser, and PNG export.
- **Animated 12s Dissolving Messages**: Ephemeral vents with burning progress bar and vaporizing blur disintegration animation.
- **Zero-Trace Ephemeral Privacy**: In-memory state; zero persistent chat/canvas logs.

## Broken
- None. Production build passes in 3.27s. Local servers running live on http://localhost:5173 and http://localhost:3001 with 200 OK responses.

## Next 3 things
1. Push all latest changes to GitHub remote (`origin/main`).
2. Expand trivia questions with campus lore.
3. Add voice notes or room audio chat if desired.

## Decisions (and why)
- **CARTO Basemap API Key Integration**: Added query parameter directly to tile URL template to eliminate "API KEY REQUIRED" watermark while preserving Leaflet dynamic theme switching.
- **In-Memory Zero-Database Architecture**: Guarantees 100% ephemeral privacy for student venting.
- **DiceBear Notionist Avatars**: Lightweight HTTP SVG API with deterministic seed stepping eliminates heavy assets and fits the minimalist editorial design language.

## Don't retry
- Do not store user chat or canvas logs in persistent databases (violates zero-trace mental health sanctuary privacy).
