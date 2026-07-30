# NUSCompass — Project Log

> **Estimated active team effort: 282 hours**  
> **Minh: 141 hours · Tuấn: 141 hours**

This log includes implementation, design, research, code reading, debugging, testing, rework and documentation.

The hours are reconstructed estimates based on the project history and the team's development process. They should be adjusted only if either member remembers a materially different workload.

---

## 1. Effort Summary

| Area | Minh | Tuấn | Total |
|---|---:|---:|---:|
| Project setup and technical research | 10h | 8h | 18h |
| A*, room search and first working demo | 20h | 10h | 30h |
| Floor-plan tracing and graph modelling | 28h | 30h | 58h |
| Figma UX study and interactive prototype | 4h | 12h | 16h |
| Architecture and UI/UX implementation | 18h | 22h | 40h |
| Product-flow research and design documentation | 5h | 3h | 8h |
| Testing, debugging and A* hardening | 22h | 20h | 42h |
| Overview map and interaction | 10h | 12h | 22h |
| Multi-block experiment and architecture research | 6h | 6h | 12h |
| Nearest toilets, CI, deployment and hotfixes | 10h | 4h | 14h |
| Documentation, poster, video and final demo preparation | 8h | 14h | 22h |
| **Total** | **141h** | **141h** | **282h** |

---

# 2. What Counts as Development Time

The total includes more than the final coding time.

For each feature or bug, the actual work often followed this sequence:

```text
read existing code
→ reproduce the problem
→ inspect related state or graph data
→ form a possible cause
→ test the hypothesis
→ change code or data
→ run the app
→ re-test old routes
→ run lint, tests and build
→ check the deployed result
```

Time is therefore counted for:

- studying tools and technical concepts;
- reading unfamiliar code;
- comparing commits;
- Figma practice;
- visual tracing;
- graph planning;
- unsuccessful experiments;
- reproducing bugs;
- root-cause analysis;
- implementing fixes;
- regression testing;
- reviewing pull requests and deployments.

---

# 3. Project Setup and Technical Research

**Period:** 23–24 May 2026  
**Time:** Minh 10h · Tuấn 8h

| Member | Work | Time |
|---|---|---:|
| Minh | Created repository and React/Vite scaffold | 3h |
| Minh | Learned Vite structure, npm commands and build process | 2h |
| Minh | Learned Git branches, commits, push and pull-request workflow | 2h |
| Minh | Researched frontend-only architecture for an indoor-navigation MVP | 2h |
| Minh | Planned first data and routing structure | 1h |
| Tuấn | Reviewed product idea and expected user flow | 2h |
| Tuấn | Researched indoor-navigation interfaces | 2h |
| Tuấn | Discussed floors, rooms, facilities and route presentation | 2h |
| Tuấn | Reviewed how the demo should be presented to users | 2h |

**Evidence**

- [`Initial commit`](https://github.com/Duckmannnn/NUSCompass/commit/41a629e09f25cb978e408b07c7af44cf14b94cef)
- [`chore: scaffold Vite React app`](https://github.com/Duckmannnn/NUSCompass/commit/8296a99e92e59f11cb4b86dd211779e90bcae024)

---

# 4. A*, Room Search and First Working Demo

**Period:** Late May 2026  
**Time:** Minh 20h · Tuấn 10h

| Member | Work | Time |
|---|---|---:|
| Minh | Studied weighted graphs and A* pathfinding | 4h |
| Minh | Read examples and planned node/edge data structures | 2h |
| Minh | Implemented first A* version | 5h |
| Minh | Debugged path reconstruction and graph lookup | 2h |
| Minh | Implemented room-search utility | 2h |
| Minh | Connected search results to route generation | 2h |
| Minh | Built first complete SVG navigation demo | 3h |
| Tuấn | Tested room-search behaviour | 2h |
| Tuấn | Tested representative route cases | 3h |
| Tuấn | Reviewed floor switching and route instructions | 2h |
| Tuấn | Reported visual and usability problems | 3h |

**Result**

```text
room search
→ destination node
→ A*
→ route node list
→ first SVG route demo
```

**Evidence**

- [`feat: implement astar`](https://github.com/Duckmannnn/NUSCompass/commit/770fd984d862b28134af4dc4a299f2d50d2e7a41)
- [`feat: implement room search utility`](https://github.com/Duckmannnn/NUSCompass/commit/e5b658abf34a510b852e0cf33784682ee6810741)
- [`feat: connect room search to route generation`](https://github.com/Duckmannnn/NUSCompass/commit/a7cbc8df0210f9685491c8a275569431afca0e59)
- [`feat: complete milestone 1 navigation demo`](https://github.com/Duckmannnn/NUSCompass/commit/863ad20abd3a0dd6f5dcdc7df5fd80c028dc278a)

---

# 5. Floor Plans, Figma Tracing and Graph Modelling

**Period:** 31 May–June 2026  
**Time:** Minh 28h · Tuấn 30h

| Member | Work | Time |
|---|---|---:|
| Minh | Added Block C floor-plan references | 2h |
| Minh | Studied SVG coordinate systems and route rendering | 3h |
| Minh | Built first code-generated Block C layout | 5h |
| Minh | Created rooms, facilities, stairs, nodes and edges | 6h |
| Minh | Rebuilt graph with door nodes and corridor anchors | 5h |
| Minh | Added corridor spines, junctions and edge paths | 4h |
| Minh | Integrated traced coordinates and re-tested routes | 3h |
| Tuấn | Learned Figma vector and layout tools | 6h |
| Tuấn | Practised tracing and coordinate alignment | 3h |
| Tuấn | Traced and refined Block C floors | 9h |
| Tuấn | Corrected room proportions and spacing | 4h |
| Tuấn | Reviewed stairs, facilities and corridor shapes | 4h |
| Tuấn | Compared rendered map with original references | 2h |
| Tuấn | Tested visual route alignment after graph changes | 2h |

## Problems investigated

- direct lines crossed walls or rooms;
- room blocks had inaccurate proportions;
- room centres were incorrectly treated as access points;
- corridors were visually wide but graphically represented by too few nodes;
- stair nodes connected floors but did not always align visually;
- edge costs produced unexpected routes;
- changing map coordinates sometimes broke route rendering.

## Graph architecture upgrade

```text
Before:
room centre
→ direct line
→ room centre

After:
room door
→ corridor anchor
→ corridor spine
→ junction or stair
→ destination anchor
→ destination door
```

**Evidence**

- [`feat: add Eusoff Block C floor plan images`](https://github.com/Duckmannnn/NUSCompass/commit/ca4e2c70c16815a25b0d627b247e41ed8ba6891a)
- [`feat: add Block C navigation data model`](https://github.com/Duckmannnn/NUSCompass/commit/0f871a6ca552f00b5a1213c2bc212329bef51919)
- [`feat: render Block C SVG floor map with routed edge paths`](https://github.com/Duckmannnn/NUSCompass/commit/f231ea4327721aa2567a0b9332fe96deaedf5da2)
- [`refactor: rebuild Block C graph with door nodes and corridor spines`](https://github.com/Duckmannnn/NUSCompass/commit/68a72562e7f471498a7cce6c2c0a66aff1f05bfa)
- [`feat: add traced Block C floor maps and indoor routing graph`](https://github.com/Duckmannnn/NUSCompass/commit/8207c661f027c1f5c8df5dae8dfe0860f12fdb02)
- [`feat: complete Block C indoor routing proof of concept`](https://github.com/Duckmannnn/NUSCompass/commit/e533001215d1f0b722d66b02cf66c7766a52e210)

---

# 6. Figma UX Study and Interactive Prototype

**Time:** Minh 4h · Tuấn 12h

This work was separate from tracing the Block C floor plans. It focused on prototyping the application flow and screen interactions in Figma.

## Tuấn

| Work | Time |
|---|---:|
| Learned Figma frames, components and prototype links | 3h |
| Studied how to create clickable multi-screen prototypes | 2h |
| Designed the campus-overview screen | 1.5h |
| Designed block and room information cards | 1.5h |
| Designed optional starting-point selection | 1h |
| Designed route-overview and step-guide screens | 1.5h |
| Linked screens and tested the complete prototype flow | 1.5h |

## Minh

| Work | Time |
|---|---:|
| Reviewed whether the Figma flow could use the existing routing engine | 1h |
| Converted prototype requirements into React state requirements | 1.5h |
| Identified which parts of M1 could be reused | 0.5h |
| Planned the implementation handoff between routing and UI work | 1h |

## Prototype flow

```text
Campus overview
→ block information card
→ Block C floor view
→ room detail card
→ optional guide setup
→ route overview
→ step guide
```

## Main design decision

```text
Where is this place?
→ destination only

How do I get there?
→ starting point + destination
```

The app should allow users to inspect a place before forcing them to provide a starting point.

**Evidence**

- [`docs/milestone-2/design/README.md`](./docs/milestone-2/design/README.md)
- [`docs/milestone-2/design/design-notes.md`](./docs/milestone-2/design/design-notes.md)
- M2 Figma prototype linked from the design README
- Architecture commit containing Figma references and UI handoff notes:
  [`feat: implement M2 3-screen architecture with card overlays`](https://github.com/Duckmannnn/NUSCompass/commit/c1e030947ab393112a61422e6056e7e5d8c9b90a)

---

# 7. Product-Flow Research and Design Documentation

**Time:** Minh 5h · Tuấn 3h

| Member | Work | Time |
|---|---|---:|
| Minh | Converted the prototype into architecture notes | 2h |
| Minh | Planned the location-centred state model | 1h |
| Minh | Documented separation between visual map and routing graph | 1h |
| Minh | Documented route-step view metadata | 1h |
| Tuấn | Reviewed destination-first flow and card behaviour | 1h |
| Tuấn | Reviewed search, “View in floor map” and “Navigate there” actions | 1h |
| Tuấn | Reviewed route overview before step navigation | 1h |

## Product decisions documented

- destination-first Home screen;
- search should not immediately jump to another view;
- blocks and rooms should open information cards;
- `Navigate there` sets the destination;
- `View in floor map` opens the exact block and floor;
- route overview appears before step-by-step navigation.

## Architecture decisions documented

```text
selectedLocationId
= location currently being viewed

destinationLocationId
= location selected for navigation

startLocationId
= optional route origin
```

The documentation also proposed:

```text
visual map data
≠
routing graph data
```

and route steps with view metadata:

```js
{
  text: 'Enter Block C and continue to C111.',
  view: {
    mode: 'indoor',
    block: 'C',
    floor: 1
  }
}
```

These decisions reduced ambiguity before implementation and explained why the original M1 architecture had to change.

**Evidence**

- [`docs/milestone-2/design/design-notes.md`](./docs/milestone-2/design/design-notes.md)

---

# 8. Architecture and UI/UX Implementation

**Period:** June 2026  
**Time:** Minh 18h · Tuấn 22h

| Member | Work | Time |
|---|---|---:|
| Minh | Read and analysed the growing `App.jsx` implementation | 2h |
| Minh | Planned shared navigation state | 2h |
| Minh | Added `NavigationContext` | 4h |
| Minh | Split the app into three screens | 4h |
| Minh | Integrated A* and Block C data with the new architecture | 3h |
| Minh | Debugged route, floor and destination state | 3h |
| Tuấn | Planned UI flow and screen hierarchy | 3h |
| Tuấn | Designed and refined cards and navigation controls | 4h |
| Tuấn | Improved spacing, colours and visual hierarchy | 4h |
| Tuấn | Tested overlays, buttons and screen transitions | 4h |
| Tuấn | Found inconsistent button and highlight states | 3h |
| Tuấn | Re-tested UI after graph and state fixes | 4h |

## Architecture change

```text
Before:
one App.jsx
- search
- map
- floor
- route
- directions
- debug output

After:
HomeScreen
ExploreScreen
NavigationScreen
NavigationContext
MapCanvas
cards and overlays
```

## Why the change was required

The application needed to share and reset:

- current screen;
- selected block;
- current floor;
- selected room;
- highlighted room;
- start room;
- destination room;
- destination intent;
- route;
- route step;
- loading state;
- error state;
- active card.

**Evidence**

- [`fix`](https://github.com/Duckmannnn/NUSCompass/commit/d56f827bada6f5ef5337f424937c12e92540e76e)
- [`feat: implement M2 3-screen architecture with card overlays`](https://github.com/Duckmannnn/NUSCompass/commit/c1e030947ab393112a61422e6056e7e5d8c9b90a)
- [`add cards for room and block info`](https://github.com/Duckmannnn/NUSCompass/commit/eda74c14b4ee941ec0393662fb3354d163d977d4)
- [`feat: implement overview map and fix critical bugs`](https://github.com/Duckmannnn/NUSCompass/commit/9f42fedbfb504bb46a311d20eb9cf881d20ec4d9)
- [`fix bug graph và flow UI`](https://github.com/Duckmannnn/NUSCompass/commit/9439a6c95b3316534d508e6853798149d4e46ec9)
- [`fix bug and make overview screen`](https://github.com/Duckmannnn/NUSCompass/commit/10de03a14cd736dbf79db58f84b1b218564a84f4)

---

# 9. Testing, Debugging and A* Hardening

**Period:** June–13 July 2026  
**Time:** Minh 22h · Tuấn 20h

This phase includes time spent reproducing bugs and finding their causes, not only writing the final fixes.

## Minh

| Work | Time |
|---|---:|
| Set up Vitest | 2h |
| Studied test design for graph algorithms | 2h |
| Wrote synthetic graph tests | 3h |
| Added real Block C route tests | 3h |
| Built an independent Dijkstra checker | 3h |
| Added deterministic random route cases | 2h |
| Analysed weaknesses in the first A* version | 2h |
| Rewrote A* with a binary min-heap | 3h |
| Fixed lint and integration failures | 2h |

## Tuấn

| Work | Time |
|---|---:|
| Tested same-floor routes | 3h |
| Tested multi-floor routes | 4h |
| Reproduced route and floor-order bugs | 3h |
| Checked stair direction and floor transitions | 3h |
| Compared route lines with the floor plan | 2h |
| Tested button, overlay and highlight regressions | 3h |
| Verified fixes on local and deployed versions | 2h |

## Root-cause workflow

For significant bugs, the team used:

```text
1. Record exact start and destination.
2. Reproduce the failure.
3. Decide whether the problem belongs to:
   - map geometry,
   - graph topology,
   - edge cost,
   - A*,
   - React state,
   - or rendering.
4. Inspect related nodes, edges and state transitions.
5. Apply the smallest fix.
6. Add or update a regression test.
7. Re-run previous route cases.
```

## A* fixes

- replaced linear frontier scanning with a min-heap;
- respected directed edge data;
- preserved the cheapest duplicate edge;
- ignored invalid costs;
- skipped stale heap entries;
- guarded route reconstruction;
- changed to a safe floor-transition heuristic.

**Evidence**

- [`test(vitest): configure baseline test environment`](https://github.com/Duckmannnn/NUSCompass/commit/099935207510a60ba1e0af84344628405cf89e83)
- [`feat(routing): optimize A* with min heap and add tests`](https://github.com/Duckmannnn/NUSCompass/commit/d6cfdb172547acbf6365b4d16ff26bd1b31d1e7c)
- [`chore: restore lint config and fix lint errors`](https://github.com/Duckmannnn/NUSCompass/commit/5040635143472ad7cf21159c0803ece6f0ef968d)

---

# 10. Overview Map and Interaction

**Period:** 17–19 July 2026  
**Time:** Minh 10h · Tuấn 12h

| Member | Work | Time |
|---|---|---:|
| Minh | Read and integrated overview data | 2h |
| Minh | Connected block selection to Context and Explore | 2h |
| Minh | Debugged viewport and screen-state integration | 3h |
| Minh | Fixed map and destination interaction | 3h |
| Tuấn | Refined overview SVG and layout | 3h |
| Tuấn | Tested zoom and pan behaviour | 2h |
| Tuấn | Investigated drag-versus-click errors | 2h |
| Tuấn | Improved room/facility interaction | 3h |
| Tuấn | Verified keyboard and highlight behaviour | 2h |

**Features**

- overview SVG;
- mapped and unmapped blocks;
- zoom;
- drag;
- resize fitting;
- click suppression after dragging;
- keyboard interaction;
- destination highlighting.

**Evidence**

- [`feat(map): add Eusoff overview SVG and map data`](https://github.com/Duckmannnn/NUSCompass/commit/323e51e94c7c8f1f08a7356092c519eaa474f0de)
- [`feat(ux): integrate interactive overview navigation flow`](https://github.com/Duckmannnn/NUSCompass/commit/cd37117c88fb6813fe485f6482a0793b631bf3b8)
- [`fix(map): enable destination selection and highlighting`](https://github.com/Duckmannnn/NUSCompass/commit/46d610bb6d9d67ff4ff3f27ff4a2c2c3d269b829)

---

# 11. Multi-Block Experiment and Architecture Research

**Time:** Minh 6h · Tuấn 6h

| Member | Work | Time |
|---|---|---:|
| Minh | Studied how the current Block C data could support another block | 2h |
| Minh | Tested inter-block graph and passage ideas | 2h |
| Minh | Evaluated required architecture changes | 2h |
| Tuấn | Tried additional block and floor-plan layouts | 3h |
| Tuấn | Compared scale, stair and corridor alignment | 2h |
| Tuấn | Reviewed whether incomplete Block B should be presented | 1h |

## Problems found

- inconsistent scale;
- incorrect room positions;
- stairs did not align;
- inter-block passage was unclear;
- current files were too specific to Block C;
- every block required a separate graph and test set.

## Decision

The team deferred incomplete Block B support and focused on a stronger Block C proof of concept.

---

# 12. Nearest Toilets, CI, Deployment and Hotfixes

**Period:** Late July 2026  
**Time:** Minh 10h · Tuấn 4h

| Member | Work | Time |
|---|---|---:|
| Minh | Added toilet gender metadata and quick destinations | 2h |
| Minh | Implemented nearest-destination resolver | 2h |
| Minh | Wrote tests | 1h |
| Minh | Reproduced and traced the Floor 3 men's-toilet bug | 1h |
| Minh | Changed floor-priority policy | 1h |
| Minh | Reproduced and fixed stale highlight state | 1h |
| Minh | Added GitHub Actions and verified deployment | 2h |
| Tuấn | Tested male and female toilet cases | 1h |
| Tuấn | Identified unexpected floor selection | 1h |
| Tuấn | Tested destination reset and highlighting | 1h |
| Tuấn | Verified deployed behaviour | 1h |

## Bug 1: wrong toilet floor

```text
Observed:
Floor 3 men's-toilet request selected Floor 1.

Root cause:
resolver compared global route cost only.

Fix:
nearest reachable floor first,
then route cost within that floor group.
```

## Bug 2: stale room highlight

```text
Observed:
the previous destination remained orange after reset.

Root cause:
route state and visual highlight state were reset separately.

Fix:
clear destination, selected room and highlight together.
```

**Evidence**

- [`add functionality for gendered toilets`](https://github.com/Duckmannnn/NUSCompass/commit/c9e5d2b8f15ec1535647992298f6b76b5dc6491b)
- [`fix(navigation): prefer nearest reachable toilet floor`](https://github.com/Duckmannnn/NUSCompass/commit/79a18997e641799c3438e1790b33c83145dcddba)
- [`fix(navigation): clear stale destination highlight`](https://github.com/Duckmannnn/NUSCompass/commit/d99dcc8ee7d4bfa241b927d85618c63d95eec035)
- [`ci: add GitHub Actions checks`](https://github.com/Duckmannnn/NUSCompass/commit/5e3d10840318291df26e8286ec3f5ff690919d87)

---

# 13. Documentation, Poster, Video and Final Demo Preparation

**Period:** Late July 2026 — Milestone 3 close-out  
**Time:** Minh 8h · Tuấn 14h

| Member | Work | Time |
|---|---|---:|
| Minh | Audited commit history and current architecture | 2h |
| Minh | Rewrote technical README | 3h |
| Minh | Rebuilt the project log | 1h |
| Minh | Reviewed the final poster, video script and slide deck for technical accuracy | 1h |
| Minh | Re-tested the Milestone 3 demo flow and live deployment | 1h |
| Tuấn | Reviewed technical explanations | 2h |
| Tuấn | Planned the poster structure | 2h |
| Tuấn | Planned the video and website-demo flow | 2h |
| Tuấn | Designed and refined the final A1 poster, diagrams and print layout | 3h |
| Tuấn | Designed and refined the final video slide deck and visual assets | 2h |
| Tuấn | Rehearsed the website feature demonstration and prepared the recording sequence | 1.5h |
| Tuấn | Prepared narration timing, transition notes and the final video assembly plan | 1.5h |

## Milestone 3 presentation work

The final presentation work included:

- checking that poster and video claims matched the current implementation;
- replacing outdated architecture and feature descriptions;
- preparing the A1 poster for print export;
- designing slides for the problem, A* overview, map-development process, reliability and future plans;
- planning direct website demonstrations for zooming, dragging, floor exploration, room selection, room-to-room navigation and nearest-toilet routing;
- aligning narration with website interactions, slides and technical evidence;
- re-checking the live deployment before the final demonstration.

Additional work documented elsewhere in the log:

- interactive Figma prototype;
- M2 design notes;
- destination-first UX research;
- component and data-flow planning;
- separation of selected location, destination and starting point;
- route-overview and step-guide planning.

---

# 14. Bug Investigation Register

| Problem | Investigation required | Final fix |
|---|---|---|
| Route crossed rooms | Compared graph nodes with map geometry | Added corridor-aligned `edge.path` |
| Wrong room access point | Traced route start into room centres | Added door nodes |
| Rough corridor route | Inspected long graph edges and turns | Added anchors, spines and junctions |
| Floor order incorrect | Compared UI order with route-node floors | Derived order from actual route |
| Persistent glow | Traced highlight lifecycle | Cleared stale highlight state |
| No loading feedback | Inspected route-calculation state | Added loading state |
| Drag selected building | Reproduced browser click after drag | Added movement threshold |
| Unavailable blocks unclear | Tested overview user flow | Added mapped/unmapped states |
| A* reverse routes | Inspected adjacency construction | Respected directed edges |
| A* stale candidates | Traced repeated heap entries | Ignored stale entries |
| Toilet Floor 3 bug | Compared route cost and floor expectation | Added floor-priority groups |
| `men` matched `women` | Reproduced substring search | Added explicit filtering |
| Lint failed after merge | Compared configs and branch changes | Restored config and fixed errors |
| Block B failed visually | Compared scale, stairs and corridors | Deferred incomplete expansion |

---

# 15. Final Contribution Summary

## Minh — 141 hours

- technical research;
- A* and graph architecture;
- Block C runtime data;
- React state integration;
- bug root-cause analysis;
- automated testing;
- CI and deployment;
- technical documentation;
- final poster, script and live-demo verification.

## Tuấn — 141 hours

- Figma floor-plan tracing;
- Figma interactive prototyping;
- destination-first UX flow design;
- map tracing and refinement;
- UI/UX design;
- overview and map interaction;
- repeated manual testing;
- bug reproduction;
- usability review;
- regression verification;
- final A1 poster design;
- video slide design, demo rehearsal and production planning.

## Total — 282 hours

```text
Minh:
routing correctness, architecture and integration

Tuấn:
visual correctness, interaction and user-facing testing
```

---

# 16. Evidence

- [README](./README.md)
- [Commit history](https://github.com/Duckmannnn/NUSCompass/commits/main)
- [Pull requests](https://github.com/Duckmannnn/NUSCompass/pulls)
- [GitHub Actions](https://github.com/Duckmannnn/NUSCompass/actions)
- [Live demo](https://nus-compass.vercel.app/)
- [`src/utils/astar.js`](./src/utils/astar.js)
- [`src/utils/astar.test.js`](./src/utils/astar.test.js)
- [`src/utils/findNearestDestination.js`](./src/utils/findNearestDestination.js)
- [`src/utils/findNearestDestination.test.js`](./src/utils/findNearestDestination.test.js)
- [`src/data/blockCData.js`](./src/data/blockCData.js)
- [`src/context/NavigationContext.jsx`](./src/context/NavigationContext.jsx)
- [`src/components/map/MapCanvas.jsx`](./src/components/map/MapCanvas.jsx)
- [`src/components/map/OverviewMap.jsx`](./src/components/map/OverviewMap.jsx)