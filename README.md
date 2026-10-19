<div align="center">

# 🌌 NEXUS ZERO

### *The Future of Deep-Space Tactical Command & Combat*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![DCO 1.1](https://img.shields.io/badge/DCO-1.1%20Signed--off-brightgreen.svg)](./DCO.md)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r176-black.svg?logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)

<p align="center">
  <b>A high-fidelity 3D WebGL space combat simulator and tactical command interface built with React 19, Three.js, React Three Fiber, and TypeScript.</b>
</p>

[Play Online](#-getting-started) • [Mission Dossier](#-mission-dossier) • [Flight Controls](#-flight-manual--controls) • [Architecture](#-technology-stack) • [Contributing](#-contributing--certification)

</div>

---

## 🛰️ Overview

**NEXUS ZERO** places you at the helm of the experimental reconnaissance spacecraft **NX-0**. Beyond the fringes of charted space, a classified deep-space listening post captures an anomalous quantum transmission emanating from an uncharted megastructure. 

Take command of the tactical operations deck, monitor planetary telemetry, initiate the orbital launch sequence, and pilot the NX-0 into hostile uncharted territory to decrypt the alien signal before sentinel swarms overrun your position.

---

## ✨ Features

- 🛸 **Interactive Tactical Command Deck**: Cyberpunk terminal interface with authentic scanline overlays, CRT distortion shaders, real-time subsystem telemetry (Hull, Shields, Quantum Core, Uplink), and live system event logs.
- 🪐 **Real-Time 3D Celestial Engine**: Rendered with **Three.js** and **@react-three/fiber**, featuring dynamic planetary rotation, procedural starfields, atmospheric glow shaders, and volumetric lighting.
- ⚡ **Spaceflight & Combat Simulation**: Fluid 6DOF flight physics, sub-light afterburners, dual-rail plasma blasters, particle collisions, target lock-on reticles, and enemy sentinel AI swarms.
- 📡 **Tactical Spherical Radar**: 360-degree holographic threat detection radar tracking quantum signal beacons, space debris, and hostile hostiles in real time.
- 🔊 **Procedural Web Audio Engine**: Zero-asset audio synthesis utilizing Web Audio API oscillators, biquad filters, and white-noise generators to produce dynamic engine rumbles, laser blasts, alarm klaxons, and immersive ambient space drones.
- 🚀 **Next-Gen Web Performance**: 60 FPS rendering pipeline, optimized component tree, bundle optimization with Vite 6 and React 19.

---

## 📜 Mission Dossier

| Mission Codename | Designation | Threat Level | Status | Objective |
| :--- | :--- | :---: | :---: | :--- |
| **THE LAST SIGNAL** | `NZ-PRIMUS-01` | **CRITICAL** | **AVAILABLE** | Scan 3 quantum signal beacons, recover 5 alien data fragments, breach megastructure core, and survive sentinel swarms. |
| **ECHO VEIL** | `NZ-SEC-02` | HIGH | LOCKED | Classified deep-space reconnaissance. Requires Clearance Level $\Omega$. |
| **BLACK ORBIT** | `NZ-SEC-03` | CLASSIFIED | LOCKED | Access Denied. Temporal quarantine currently in effect. |

---

## 🕹️ Flight Manual & Controls

### Command Center
- **Mouse / Drag**: Orbit camera around planetary system & examine orbital bodies
- **Audio HUD**: Toggle master volume, ambient synth drone, and tactical sound effects
- **Initialize Mission**: Review tactical telemetry and engage launch countdown

### NX-0 Spacecraft Combat Mode
| Input | Action |
| :--- | :--- |
| **Mouse Aim / Arrow Keys / W A S D** | Flight Attitude (Pitch, Yaw, Roll) |
| **Left Click / Spacebar** | Fire Twin Plasma Cannons |
| **Shift** | Engage Sub-Light Afterburner (Boost) |
| **Tactical Radar** | Live HUD mini-map tracking beacons & sentinel bogeys |
| **ESC / Abort** | Return telemetry to debrief screen |

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite 6](https://vitejs.dev/)
- **Audio**: Web Audio API Procedural Synthesizer
- **Styling**: Vanilla Cyberpunk CSS Design System (Custom Glow Tokens, Grid Lines, Glassmorphism)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/harsh-052005/Nexus-Zero.git
   cd Nexus-Zero
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your WebGL-compatible browser.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📂 Project Architecture

```
Nexus-Zero/
├── public/                 # Static assets & favicon
├── src/
│   ├── audio/              # Web Audio API procedural synthesizer (SoundEngine.ts)
│   ├── components/         # 3D scenes & React tactical HUD interfaces
│   │   ├── BootSequence.tsx        # Retro boot terminal & authorization sequence
│   │   ├── CommandCenter.tsx       # 3D orbital command bridge & system telemetry
│   │   ├── MissionGame.tsx         # Spaceflight combat simulator & 3D canvas
│   │   ├── PlanetarySystem.tsx     # Three.js celestial bodies, shaders & orbits
│   │   ├── TacticalRadar.tsx       # Holographic 360-degree radar display
│   │   └── ...
│   ├── data/               # Mission logs, metadata, and telemetry configs
│   ├── game/               # Core flight physics, entity loop, projectile collision
│   ├── types.ts            # TypeScript interfaces & game state types
│   ├── App.tsx             # State machine orchestrating screens & debriefing
│   └── main.tsx            # Application entry point
├── DCO.md                  # Developer Certificate of Origin 1.1
├── CONTRIBUTING.md          # Open-source contribution guidelines & sign-off
├── LICENSE                 # MIT Open Source License
└── package.json            # Project manifest & dependencies
```

---

## 📜 Certification & Licenses

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

### Developer Certificate of Origin (DCO)
All contributions must comply with the [Developer Certificate of Origin 1.1](./DCO.md). Every commit must include a Signed-off-by trailer in accordance with open-source industry standards.

---

<div align="center">
  <sub>Developed by <b>Harsh Sinha</b>. Built for space combat enthusiasts and the next generation of web gaming.</sub>
</div>
