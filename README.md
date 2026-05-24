# NUSCompass

NUSCompass is an indoor navigation web app for NUS COM1.

The MVP goal is simple:

```txt
User searches for a room
→ app finds the room
→ app calculates a route
→ app draws the route on a map
→ app shows step-by-step directions
```

## Current Status

The project currently has a working React + Vite scaffold.

This means:

- `npm install` works
- `npm run dev` works
- `npm run build` works
- `graph.json` and `rooms.json` already exist
- the app can import and display data from JSON files

Real navigation components are still under development.

Current `App.jsx` is mainly a data-check screen, not the final app UI.

## Tech Stack

```txt
Frontend:
- React
- Vite
- JavaScript
- CSS
- SVG

Data:
- Static JSON files
- No database in the current MVP

Deploy:
- GitHub
- Vercel later
```

## Quick Start

Clone the repo:

```bash
git clone https://github.com/Duckmannnn/NUSCompass.git
cd NUSCompass
```

Install dependencies:

```bash
npm install
```

Run local development server:

```bash
npm run dev
```

Open the URL printed by Vite in the terminal.

Usually it is:

```txt
http://localhost:5173
```

If that port is busy, Vite may use another port, for example:

```txt
http://localhost:5174
```

## Build

Before pushing important changes, run:

```bash
npm run build
```

If the build passes, the project is safe to commit and push.

The build output goes into:

```txt
dist/
```

Do not edit or commit `dist/`.

Vercel will generate `dist/` automatically during deployment.

## Project Structure

```txt
NUSCompass/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── public/
│   └── maps/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── data/
    │   ├── graph.json
    │   └── rooms.json
    ├── components/
    ├── utils/
    └── styles/
        └── app.css
```

## File Responsibilities

```txt
src/main.jsx
```

Starts the React app and renders `App.jsx`.

```txt
src/App.jsx
```

Main controller of the app.

Later, this file will connect:

```txt
SearchBar
→ A* route calculation
→ FloorMap
→ StepPanel
```

```txt
src/data/graph.json
```

Logical map data.

It stores:

- floors
- nodes
- edges

```txt
src/data/rooms.json
```

Search data for room autocomplete.

```txt
src/components/
```

UI components.

Tuấn will mainly work here.

```txt
src/utils/
```

Logic/helper functions.

Minh will mainly work here.

```txt
src/styles/app.css
```

Global styling.

## Team Split

### Minh

Main responsibility:

- data structure
- `graph.json`
- `rooms.json`
- A* algorithm
- `src/utils/`
- `src/App.jsx`
- integration
- GitHub/Vercel setup

### Tuan

Main responsibility:

- UI components
- SVG map rendering
- CSS styling
- map assets

Tuấn should mainly work in:

```txt
src/components/
src/styles/app.css
public/maps/
```

## Development Workflow

Do not push directly to `main` unless the team has agreed.

Every time before coding:

```bash
git checkout main
git pull origin main
```

Create a new branch:

```bash
git checkout -b your-branch-name
```

Example:

```bash
git checkout -b tuan-ui
```

Before pushing:

```bash
npm run build
```

If the build passes:

```bash
git add .
git commit -m "feat: describe your change"
git push -u origin your-branch-name
```

Then open a Pull Request on GitHub.

## MVP Scope

The current MVP is frontend-only.

For now, we do not need:

- backend
- API
- database
- WebSocket
- admin panel
- login system
- real-time user reports

Those can be future improvements after the basic navigation demo works.

## Important Notes

Do not commit:

```txt
node_modules/
dist/
```

These are generated automatically.

Use this command to view the project tree clearly:

```bash
tree -L 3 -I "node_modules|dist|.git"
```
