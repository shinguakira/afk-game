# AFK Game (Melvor-Idle-style)

An idle/incremental RPG inspired by **Melvor Idle**, built with **Vite + React + TypeScript**.
Progress saves to plain JSON files via a tiny **Express + TS** backend (no database).

## Core loop

Pick one action at a time — it auto-repeats on a timer, granting XP + items:

- **Gather**: Mining (ore), Woodcutting (logs)
- **Craft**: Smithing — smelt ore into bars, forge bars into weapons
- **Combat**: auto-battle monsters; uses HP, food, and your equipped weapon
- **Shop**: sell loot for gold, buy food
- **AFK / offline progress**: closing the game banks elapsed time (up to 24h) and awards
  what your active action would have produced when you return.

Skills feed each other: Mining → ore → Smithing → bars → weapons → Combat.

## Project layout

```
afk-game/
├─ client/   Vite + React + TS  (the game)
│  └─ src/game/data/   data-driven configs: items, skills, actions, monsters
└─ server/   Express + TS save server  → writes server/data/*.json
```

## Run it

```bash
npm install        # installs client + server (npm workspaces)
npm run dev        # starts save server (:3001) AND client (:5173) together
```

Open http://localhost:5173. The client proxies `/api/*` to the server.

### Build for production

```bash
npm run build      # builds client to client/dist
npm start          # runs the save server
```

## Adding content

Everything game-side is data-driven. To add a skill action, item, or monster, edit the
typed configs in `client/src/game/data/` — no engine changes needed for ordinary content.
