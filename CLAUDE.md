# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive 3D portfolio application built with React Three Fiber. Features a WebGL-rendered 3D room environment with interactive elements including a clickable monitor displaying a Windows XP iframe, animated objects, and background music.

## Commands

All commands run from the `my_room/` directory:

```bash
npm start          # Start development server
npm run build      # Production build
npm run format     # Format code with Prettier
npm run eslint     # Run ESLint
```

## Architecture

### Technology Stack
- **React Three Fiber** (R3F) - React renderer for Three.js
- **React Three Drei** - Helper components for R3F
- **@tweenjs/tween.js** - Camera transition animations
- **@react-spring/three** - Spring-based object animations
- **r3f-pack** - Build tooling

### Directory Structure
```
my_room/
├── src/
│   ├── scenes/        # 3D scene components (Monitor, Game, Camera, etc.)
│   ├── provider/      # React Context for global state
│   ├── zoomIn/        # Loading screen and Tween animation updater
│   └── components/    # UI components (music button)
└── public/
    ├── models/        # GLTF 3D models (Draco-compressed)
    ├── mp3/           # Audio files
    ├── videos/        # Video textures
    └── img/           # Images
```

### State Management
Global state via React Context in `provider/Provider.tsx`:
- `start` - Loading screen dismissed
- `hovered` - Cursor over interactive element
- `isZoomed` - Monitor zoom/iframe visibility

### Scene Components
Each 3D object is a separate component in `scenes/`:
- Loads GLTF model via `useGLTF` hook from Drei
- Returns mesh/group with geometry and materials
- May include animations (`useFrame`) or interactions

### Animation Patterns
- **Tween.js**: Camera position transitions (zoom to monitor)
- **@react-spring/three**: Object rotations with spring physics
- **useFrame**: Per-frame updates (Box rotation, video texture)

### 3D Model Workflow
Models use Draco compression. To regenerate JSX from GLTF:
```bash
npx gltfjsx ./public/models/room-draco.glb
```

### Camera Controls
OrbitControls with constraints:
- Auto-rotation when not zoomed
- Hemisphere lock (polar angle limits)
- Azimuth angle restrictions
- Zoom/pan disabled
