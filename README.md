# TheBackrooms 🌌
### The Anonymous Campus Decompression Sanctuary

> **Zero logins. Zero records. Instant anonymous venting, doodle lounges & multiplayer mini-games.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Fycrxi75f.insforge.site-8b5cf6?style=for-the-badge)](https://ycrxi75f.insforge.site)
[![Hackathon](https://img.shields.io/badge/Can%20You%20Hack%20It-Track%202%20(Campus)-10b981?style=for-the-badge)](#)
[![Stack](https://img.shields.io/badge/Tech-React%20%7C%20WebRTC%20%7C%20Socket.io-f59e0b?style=for-the-badge)](#)

---

## 🚀 Live Deployment
- **Live Production URL**: [https://ycrxi75f.insforge.site](https://ycrxi75f.insforge.site)
- **Deployment Platform**: InsForge Edge Deployments / Vercel CDN

---

## 💡 The Problem & Campus Impact
Academic exhaustion, isolation, and burnout peak during college midterms, finals, and hackathons. Existing platforms (Slack, Discord, Campus forums) link identities to student records, causing anxiety over digital footprint and fear of judgment.

**TheBackrooms** provides an ultra-lightweight, zero-signup, zero-database ephemeral sanctuary where students can decompress, vent, sketch collaboratively on a shared canvas, and bond over 5 fast multiplayer mini-games.

---

## ✨ Features

- **🎭 Zero-Trace Anonymous Identity**:
  - Automatically generated randomized student aliases and cute avatar emojis.
  - Interactive avatar carousel with glowing orbital ring and one-click shuffle.
- **🔑 Room Code System**:
  - Every lounge has a shareable code (e.g. `#COFFEE`, `#DOODLE`, `#TRIVIA`, `#CHAINS`, `#ARCADE`, `#CONFES` or custom codes).
  - Join any custom room directly via code from the Landing page or Lobby.
- **🟢 Live Presence Radar**:
  - Live heartbeat presence ping showing accurate real-time online members.
- **🎨 Synchronized Collaborative Canvas**:
  - High-DPI synchronized sketchpad with smooth stroke broadcasting, neon studio color palette, brush slider, eraser, and PNG snapshot export.
- **🎮 Pop-Up Multiplayer Mini-Games**:
  - **Campus Scribble**: Speed Pictionary rounds with campus prompt banks and chat guess recognition.
  - **Campus Trivia Blitz**: 14-second rapid-fire buzzer challenges.
  - **Rapid Word Chain**: Keep the letter combo alive without repeating or timing out.
  - **Emoji Pop Reflex**: Fast-paced reaction arcade popping target emojis.
  - **Truth, Vent & Dare**: Confessionals and cathartic prompts.
- **🔥 Animated 12s Dissolving Messages**:
  - Self-destructing ephemeral vents with a live burning progress bar and vaporizing disintegration keyframe animation.
- **🖤 Abyssal Void Dark Mode**:
  - Deep dark aesthetic with soft glassmorphism, recessed wells, and luminous accents.
- **🎵 Built-in Lo-Fi & Playful Sound Synthesizer**:
  - Web Audio bubble pops, spring boings, arcade chimes, and victory fanfares.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Canvas API, Web Audio API, Canvas-Confetti, Lucide Icons.
- **Real-Time Networking**:
  - **Global WebRTC DataChannel Mesh** (`peerjs`): Direct peer-to-peer communication with low latency.
  - **Cross-Tab BroadcastChannel API**: Real-time sync across browser windows.
  - **Socket.io**: Backend sync for local development and hosted fallbacks.
- **Backend & BaaS**: [InsForge](https://insforge.dev) + Node.js / Express.

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd 2
```

### 2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Run development servers
```bash
# Terminal 1: Start frontend
cd client
npm run dev

# Terminal 2: Start backend
cd server
node server.js
```
- Open frontend at: `http://localhost:5173`
- Backend runs on: `http://localhost:3001`

---

## 📜 License
MIT License. Built for **Can You Hack It?** (The Programming Club Hackathon) — Track 2: Campus Problem Solver.
>>>>>>> 2525051 (Initial release of TheBackrooms (Campus Decompression Lounge) with WebRTC real-time mesh, room codes, 5 pop-up mini-games, and abyssal dark UI)
