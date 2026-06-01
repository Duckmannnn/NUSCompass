# NUSCompass

NUSCompass is an indoor navigation web app for NUS spaces. The project aims to help students and visitors search for rooms and generate room-level indoor routes across campus buildings.

For Milestone 1, our technical proof of concept focuses on **Eusoff Block C**. The current app allows users to choose their current location and destination, then generates an indoor route across a manually traced four-floor map using graph-based A* pathfinding.

---

## 1. Project Overview

Navigating large campus buildings can be confusing, especially when users need to find specific rooms rather than just buildings. Standard map applications usually stop at outdoor navigation and do not provide detailed indoor routes through corridors, staircases, and floor transitions.

NUSCompass addresses this by modelling indoor spaces as a graph of rooms, doors, corridors, and stair nodes. Users can select where they are and where they want to go, and the app computes a route through the building.

The long-term goal is to build a campus indoor navigation tool that can support multiple NUS buildings and help users find rooms more quickly.

---

## 2. Milestone 1 Technical Proof of Concept

The current proof of concept implements indoor route generation for **Eusoff Block C**.

Implemented features:

* Search/select current location
* Search/select destination
* Generate a route between two indoor locations
* Render a four-floor Block C map
* Show the route overlay on the map
* Support stair transitions between floors
* Switch between floor views
* Show step-by-step route directions
* Debug graph mode for inspecting routing nodes and edges

The core user flow is:

```text
User chooses current location
→ User chooses destination
→ App finds the corresponding room nodes
→ A* computes a route on the indoor graph
→ FloorMap renders the route using corridor-aligned edge paths
→ StepPanel shows route instructions
```

This demonstrates the main technical feasibility of NUSCompass: room-level indoor navigation using a graph-based model.

---

## 3. Features and Design of Application

### 3.1 Current Location and Destination Search

Users can search for both their current location and target destination. The current interface supports room and facility entries such as rooms, toilets, lounges, and other mapped Block C spaces.

### 3.2 Indoor Map Rendering

The app renders a custom SVG floor map for Eusoff Block C. The current map includes:

* Room blocks
* Facility blocks
* Corridors
* Staircases
* Door markers
* Route overlay
* Start and destination markers

The map is manually traced from available floor-plan references. This is sufficient for the Milestone 1 proof of concept, and the geometry will be refined in later milestones.

### 3.3 A* Pathfinding

The routing system models indoor navigation as a graph:

* Rooms connect to door nodes
* Door nodes connect to corridor anchor nodes
* Corridor anchors connect to corridor spine nodes
* Stair nodes connect different floors

The app uses A* pathfinding to compute a route between the selected start and destination nodes.

### 3.4 Step-by-Step Directions

After a route is generated, the app displays route steps to help users understand how to move through the building. The current directions are basic and will be improved with more natural landmark-based instructions in future milestones.

---

## 4. System Architecture

The MVP is frontend-only and built with React + Vite.

```text
React UI
  ├── App.jsx
  │   ├── manages current location and destination state
  │   ├── runs A* route calculation
  │   └── passes route data to map and direction components
  │
  ├── components/
  │   ├── FloorMap.jsx
  │   ├── FloorSelector.jsx
  │   ├── StepPanel.jsx
  │   └── SearchBar.jsx
  │
  ├── data/
  │   └── blockCData.js
  │
  ├── utils/
  │   ├── astar.js
  │   └── search.js
  │
  └── styles/
      └── app.css
```

### Important Files

#### `src/App.jsx`

Main controller of the app. It stores the selected current location, selected destination, current floor, and generated route.

#### `src/data/blockCData.js`

Stores the manually traced Block C map data and generated routing graph. This includes room positions, facility positions, corridor paths, stair nodes, graph nodes, and graph edges.

#### `src/utils/astar.js`

Implements the A* pathfinding algorithm used to find a route between two graph nodes.

#### `src/components/FloorMap.jsx`

Renders the indoor map using SVG and draws the route overlay based on the computed route.

#### `src/components/FloorSelector.jsx`

Allows users to switch between floor views.

#### `src/components/StepPanel.jsx`

Displays step-by-step route directions.

#### `src/styles/app.css`

Contains global styling and the visual theme for the app.

---

## 5. Tech Stack

```text
Frontend:
- React
- Vite
- JavaScript
- CSS
- SVG

Routing:
- Static graph data
- A* pathfinding

Current MVP:
- Frontend-only
- No backend
- No database
```

The current MVP intentionally avoids backend complexity so that the team can focus on proving the core indoor navigation workflow first.

---

## 6. Quick Start

Clone the repository:

```bash
git clone https://github.com/Duckmannnn/NUSCompass.git
cd NUSCompass
```

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open the URL printed by Vite in the terminal. It is usually:

```text
http://localhost:5173
```

If the port is busy, Vite may use another port such as:

```text
http://localhost:5174
```

---

## 7. Build

Before pushing important changes, run:

```bash
npm run build
```

If the build passes, the project is safe to commit and push.

The production build output goes into:

```text
dist/
```

Do not manually edit or commit `dist/`.

---

## 8. Current Limitations

The current proof of concept is functional but still limited:

* The map currently supports Eusoff Block C only.
* Floor-plan geometry is manually traced and may not be perfectly accurate yet.
* The route instructions are basic and not fully natural-language yet.
* There is no real-time indoor positioning.
* There is no backend, database, or user account system.
* The current map data needs further validation against real building measurements.

These limitations are acceptable for Milestone 1 because the main goal is to prove the technical feasibility of indoor route generation.

---

## 9. Development Plan

### Milestone 1: Technical Proof of Concept

Completed / in progress:

* Set up React + Vite project
* Set up GitHub repository and version control
* Implement graph-based indoor routing
* Implement A* pathfinding
* Implement Eusoff Block C four-floor map prototype
* Implement current location and destination search
* Render route overlay on map
* Add floor switching and basic route directions

### Milestone 2: Improve Product Usability

Planned:

* Refine floor-plan accuracy
* Improve mobile-friendly UI
* Improve route instructions using clearer landmarks
* Add more realistic room/facility labels
* Improve map interaction and visual feedback
* Add more test cases for graph correctness

### Milestone 3: Expansion and Polish

Planned:

* Add more buildings or more complete Eusoff coverage
* Improve data encoding workflow for future maps
* Prepare final demo flow
* Improve deployment and user testing
* Polish UI for final presentation

---

## 10. Team Split

### Minh

Main responsibilities:

* Project setup
* Graph data structure
* A* pathfinding logic
* Block C map data encoding
* App integration
* GitHub workflow
* Milestone documentation

### Tuấn

Main responsibilities:

* UI component review
* Map rendering improvements
* CSS polish
* Testing route cases
* Poster/video support
* Future frontend component development

The current MVP is still small, so responsibilities may overlap as the team iterates quickly.

---

## 11. Development Workflow

Before coding:

```bash
git checkout main
git pull origin main
```

Create a new branch:

```bash
git checkout -b your-branch-name
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

---

## 12. Milestone 1 Demo Flow

Recommended demo cases:

```text
C111 → C302
C302 → C421
C101 → C312
C214 → C313
```

Recommended video flow:

1. Introduce the indoor navigation problem.
2. Show the NUSCompass app.
3. Select a current location.
4. Select a destination.
5. Show the generated route.
6. Switch between floor views.
7. Show debug graph mode briefly.
8. Explain current limitations and next steps.

---

## 13. MVP Scope

The current MVP is frontend-only.

For now, we do not need:

* Backend
* API
* Database
* Login system
* Admin panel
* Real-time user reports
* Real-time indoor positioning

These may be future improvements after the basic navigation workflow is validated.

---

## 14. Important Notes

Do not commit:

```text
node_modules/
dist/
```

These are generated automatically.
