# Milestone 2 Design Notes

## Purpose

Milestone 1 proved that NUSCompass can support indoor routing inside Eusoff Block C using React, Vite, custom map data, and A* pathfinding.

Milestone 2 does not rewrite M1. Instead, it improves the user experience around the existing routing proof-of-concept.

```txt
M1 = technical proof-of-concept for Block C indoor routing
M2 = product-flow upgrade with Eusoff overview and destination-first navigation
```

The main goal of M2 is to make NUSCompass feel more like a real navigation product. Users should be able to search for a place first, inspect it, and only choose a starting point when they actually need directions.

---

## Design Reference

The live prototype and design entry point are documented in:

```txt
docs/milestone-2/design/README.md
```

The current M2 prototype covers this flow:

```txt
1. Campus overview with destination search
2. Block information card
3. Block C indoor floor view
4. Room detail card
5. Optional guide setup after choosing a destination
6. Route overview with step preview
7. Step guide with contextual map switching
```

A PDF snapshot can be exported later and stored as:

```txt
docs/milestone-2/design/nuscompass-m2-ux-prototype.pdf
```

---

## Core UX Principle

M2 separates two user questions:

```txt
Where is this place?
→ only needs a destination

How do I get there?
→ needs both a starting point and a destination
```

This is why M2 uses a destination-first flow. The app should not force users to enter a starting point just to inspect a room, block, or facility.

---

## M1 vs M2

| Area           | Milestone 1                  | Milestone 2                         |
| -------------- | ---------------------------- | ----------------------------------- |
| Main goal      | Prove indoor routing works   | Improve the navigation product flow |
| Scope          | Eusoff Block C               | Eusoff overview + Block C detail    |
| First action   | Choose start and destination | Search or click a destination       |
| Starting point | Required immediately         | Optional until guided navigation    |
| Map view       | Block C indoor map           | Campus overview + indoor floor view |
| Demo target    | Indoor route inside Block C  | Dining Hall → C111 flow             |

Key distinction:

```txt
M1 proves the routing engine.
M2 improves how users discover, inspect, and follow routes.
```

---

## Locked Product Decisions

### 1. Destination-first home screen

The app should open with the Eusoff campus overview.

The first search box is for destinations, such as rooms, blocks, facilities, offices, or other searchable places.

Search should eventually support all location types in the data. For the first M2 build, the searchable data can stay small.

---

### 2. Search should not auto-jump too early

If a user searches for `C111` from the campus overview, the app should stay on the campus overview first.

Expected behavior:

```txt
Search C111
→ show C111 card
→ show a representative pin near Block C
→ allow View in floor map
→ allow Navigate there
```

This avoids sudden view switching and keeps the flow easy to understand.

---

### 3. Blocks and rooms use cards

Clicking a block should show a block card.

Example:

```txt
Click Block C
→ show Block C card
→ Explore opens Block C indoor view
```

Clicking a room should show a room card.

Example:

```txt
Click C111
→ highlight C111
→ show C111 card
→ allow Navigate there
```

Other blocks such as A, B, D, E, and Office can be clickable, but they may show simple overview-only cards until more detailed data is added.

---

### 4. Navigate there sets the destination

When the user clicks `Navigate there`, the selected location becomes the destination.

Example:

```txt
Viewing C111
→ click Navigate there
→ destination = C111
→ return to campus overview
→ ask user to choose a starting point
```

Starting point is optional until this stage.

---

### 5. View in floor map opens exact location

`View in floor map` should open the correct block and floor for a selected location.

Example:

```txt
Selected location = C111
→ open Block C
→ open Floor 1
→ highlight C111
```

This action answers “where exactly is this place?” It should not automatically start navigation.

---

### 6. Route overview comes before step guide

After the user chooses both a starting point and a destination, the app should show a route overview first.

Example:

```txt
Starting point: Dining Hall
Destination: C111
→ show route overview
→ show step preview
→ show Start navigation button
```

Step-by-step navigation only begins after the user clicks `Start navigation`.

---

## Architecture Principles

### 1. Location-centric model

M2 should treat `location` as the central concept.

A location can be:

```txt
Block C
C111
Dining Hall
Office
Laundry
Covered walkway landmark
```

Search, cards, pins, start point, destination, and route labels should all work through locations.

---

### 2. Selected location and destination are different

The app should keep these separate:

```txt
selectedLocationId    = place currently being viewed or clicked
destinationLocationId = place the user wants to navigate to
startLocationId       = optional starting point for guided navigation
```

Looking at a place is not the same as navigating to it.

---

### 3. Visual map and routing graph are separate

Campus visual data and routing data should not be mixed.

```txt
campusMap.js   = visual data for drawing the Eusoff overview
campusGraph.js = routing nodes and edges for pathfinding
```

The app should not route directly using SVG polygons or decorative map shapes.

---

### 4. Route steps include view metadata

Each route step should know which map view should be shown.

Example:

```js
{
  text: 'Follow the covered walkway toward Block C.',
  view: { mode: 'campus' }
}
```

Example:

```js
{
  text: 'Enter Block C and continue to C111.',
  view: { mode: 'indoor', block: 'C', floor: 1 }
}
```

This allows step navigation to switch between campus overview and indoor maps.

---

## First M2 Build Scope

The first M2 build should focus on one complete flow:

```txt
Campus overview
→ search or select C111
→ show C111 card
→ View in floor map
→ open Block C Floor 1
→ highlight C111
→ Navigate there
→ return to campus overview
→ choose Dining Hall as starting point
→ show route overview
→ start step guide
```

The first build does not need:

```txt
Full room database
Full Dining Hall indoor map
Detailed Block B indoor map
Perfect multi-block graph
Advanced graphBuilder cleanup
```

Those can come after the main flow works.

---

## Non-goals for Now

To keep M2 manageable, avoid these for the first build:

```txt
Rewriting the entire M1 app
Replacing the existing Block C routing too early
Splitting blockCData.js before the new flow is stable
Adding every Eusoff room immediately
Merging Tuấn's prototype repo directly
Making graphBuilder too complex before demo routes work
```

M1 stability is more important than architectural perfection.
