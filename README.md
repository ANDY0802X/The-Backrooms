<div align="center">

# 🌌 TheBackrooms

### *The Anonymous Campus Decompression Sanctuary*

**Zero logins. Zero records. Instant anonymous venting, doodle lounges & multiplayer mini-games.**

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-ycrxi75f.insforge.site-8b5cf6?style=for-the-badge)](https://ycrxi75f.insforge.site)
[![Hackathon](https://img.shields.io/badge/Can%20You%20Hack%20It-Track%202%20Campus-10b981?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

![React](https://img.shields.io/badge/React%2018-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=flat-square&logo=webrtc&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Why TheBackrooms Exists](#-why-thebackrooms-exists)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Live Deployment](#-live-deployment)
- [Local Setup](#-local-setup--development)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 💭 Why TheBackrooms Exists

> Academic burnout doesn't wait for office hours.

Midterms, finals, and hackathons push students to their limit — but Slack, Discord, and campus forums all tie every message back to a real identity. That kills honest venting before it starts.

**TheBackrooms** strips all of that away: no accounts, no database, no history. Just an ephemeral, anonymous space to vent, doodle together, and blow off steam with strangers who *get it* — then it's gone, like it never happened.

<div align="center">

| 🎭 Fully Anonymous | 🗑️ Nothing Saved | ⚡ Instant Access | 🎮 Actually Fun |
|:---:|:---:|:---:|:---:|
| No sign-up, ever | Messages self-destruct | Join with one click | 5 built-in mini-games |

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🎭 Zero-Trace Identity
Auto-generated aliases + emoji avatars, with a glowing orbital carousel and one-click shuffle. Nobody knows who you are — including us.

### 🔑 Room Codes
Every lounge has a shareable code:
`#COFFEE` `#DOODLE` `#TRIVIA` `#CHAINS` `#ARCADE` `#CONFES`
...or spin up your own.

### 🟢 Live Presence Radar
A real-time heartbeat shows exactly who's in the room right now — no refresh needed.

### 🎨 Collaborative Canvas
High-DPI shared sketchpad with buttery stroke sync, a neon color palette, adjustable brush, eraser, and PNG export.

</td>
<td width="50%" valign="top">

### 🔥 Self-Destructing Messages
Every vent dissolves after **12 seconds** with a live burn-down bar and a vaporizing animation. Say it, and let it go.

### 🖤 Abyssal Dark Mode
Deep glassmorphism UI with recessed wells and soft luminous accents — easy on the eyes at 2am.

### 🎵 Built-in Sound Design
Web Audio-powered pops, boings, arcade chimes, and victory fanfares for every interaction.

### 🎮 5 Pop-Up Mini-Games
See below 👇

</td>
</tr>
</table>

<div align="center">

| 🎮 Game | What It Is |
|---|---|
| **Campus Scribble** | Speed Pictionary with campus prompts + live chat-guess detection |
| **Campus Trivia Blitz** | 14-second rapid-fire buzzer rounds |
| **Rapid Word Chain** | Keep the letter combo alive without repeating or stalling |
| **Emoji Pop Reflex** | Fast reaction arcade — pop the right emoji before time runs out |
| **Truth, Vent & Dare** | Confessional prompts for cathartic release |

</div>

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Vite · Canvas API · Web Audio API · Canvas-Confetti · Lucide Icons |
| **Real-Time Mesh** | PeerJS (WebRTC) — direct peer-to-peer, low latency |
| **Cross-Tab Sync** | BroadcastChannel API |
| **Server Fallback** | Socket.io |
| **Backend / BaaS** | [InsForge](https://insforge.dev) + Node.js / Express |

</div>

---

## 🚀 Live Deployment

<div align="center">

### 👉 **[ycrxi75f.insforge.site](https://ycrxi75f.insforge.site)** 👈

Hosted on InsForge Edge Deployments / Vercel CDN

</div>

---

## 💻 Local Setup & Development

```bash
# 1. Clone the repository
git clone https://github.com/AnmolBhardwaj0-0/The-Backrooms.git
cd The-Backrooms

# 2. Install client dependencies
cd client
npm install

# 3. Install server dependencies
cd ../server
npm install
```

Then run both servers side by side:

```bash
# Terminal 1 — frontend
cd client && npm run dev

# Terminal 2 — backend
cd server && node server.js
```

<div align="center">

| Service | URL |
|:---:|:---:|
| 🎨 Frontend | `http://localhost:5173` |
| ⚙️ Backend | `http://localhost:3001` |

</div>

---

## 📁 Project Structure

```
The-Backrooms/
├── client/          # React + Vite frontend
├── server/          # Node.js / Express + Socket.io backend
├── cyhi-logs/       # Hackathon build logs
├── cyhi-skills/     # Hackathon notes & skills
├── AGENTS.md
├── HANDOFF.md
├── LICENSE
└── README.md
```

---

## 📜 License

<div align="center">

Released under the **[MIT License](./LICENSE)** © 2026 Biwan Vaibhav.
Built for **Can You Hack It?** — The Programming Club Hackathon, Track 2: Campus Problem Solver.

⭐ **If TheBackrooms helped you decompress, star the repo!** ⭐

</div>
