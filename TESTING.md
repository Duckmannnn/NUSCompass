# Testing Documentation - NUSCompass

## 1. Test Strategy & Planning

### 1.1 Testing Approach
NUSCompass employs a comprehensive multi-level testing strategy to ensure the reliability, accuracy, and usability of the indoor navigation system. Our approach covers the entire software development lifecycle, from algorithmic logic to end-user experience.

We categorize our testing into four main levels:
1. **Unit Testing:** Verifying individual functions and algorithms (e.g., A* pathfinding).
2. **Integration Testing:** Ensuring different components work together seamlessly (e.g., Search -> Route Generation).
3. **System Testing:** Validating the complete application against requirements.
4. **User Acceptance Testing (UAT):** Gathering real-world feedback from target users.

### 1.2 Test Environment
- **Browsers:** Google Chrome (v120+), Safari (v17+), Firefox (v120+)
- **Devices:** Desktop (1920x1080), Tablet (iPad), Mobile (iPhone/Android)
- **Tools:** Browser DevTools, React Developer Tools, Manual observation.

---

## 2. Test Case Design

### 2.1 Unit Testing (Algorithm & Logic)
*Focus: Core logic, mathematical accuracy, edge cases.*

| Test ID | Test Scenario | Input Data | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UT-01** | Shortest path between adjacent rooms | Start: C101, End: C102 | Path: [C101, C102], Distance: ~5m | ✅ PASS |
| **UT-02** | Pathfinding across multiple floors | Start: C101 (F1), End: C305 (F3) | Path includes stair nodes, correct floor transitions | ✅ PASS |
| **UT-03** | Same start and destination | Start: C101, End: C101 | Path: [C101], Distance: 0m | ✅ PASS |
| **UT-04** | No route exists (disconnected graph) | Start: Node A, End: Node B (no edges) | Empty path `[]`, Distance: 0 | ✅ PASS |
| **UT-05** | Search with partial string | Query: "C10" | Returns C101, C102, C103... | ✅ PASS |
| **UT-06** | Case-insensitive search | Query: "c101" | Returns C101 | ✅ PASS |

### 2.2 Integration Testing (Component Interaction)
*Focus: Data flow between React Context, Components, and Utilities.*

| Test ID | Test Scenario | Action | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **IT-01** | Search to Route Generation | 1. Type "C305" in search<br>2. Click result | Map highlights C305, Route overlay appears, Step panel updates | ✅ PASS |
| **IT-02** | Floor Switching with Active Route | 1. Generate route F1 to F3<br>2. Click Floor 2 button | Map renders Floor 2, Route overlay shows path through F2 | ✅ PASS |
| **IT-03** | Clearing Destination | 1. Generate route<br>2. Click "Cancel" | Route overlay disappears, Step panel resets, Start/Dest cleared | ✅ PASS |

### 2.3 System Testing (End-to-End Workflows)
*Focus: Complete user journeys and overall system stability.*

**Workflow 1: Standard Navigation**
1. User opens app.
2. Searches for destination "C407".
3. Sets current location as "C101".
4. System calculates route.
5. User follows step-by-step directions.
6. **Result:** Route is optimal, directions are clear, UI updates correctly. ✅

**Workflow 2: Multi-Floor Navigation**
1. User is on Floor 1, wants to go to Floor 4.
2. System generates path involving stairs.
3. User clicks through Floor 1 -> 2 -> 3 -> 4.
4. **Result:** Map transitions smoothly, route segments update per floor. ✅
---

## 3. User Acceptance Testing (UAT) & Bug Tracking

### 3.1 Testing Setup
We conducted iterative testing sessions with team members and a small group of NUS students to validate the core navigation features. Instead of a one-time perfect test, we adopted a continuous testing approach, identifying bugs and fixing them day by day.
- **Participants:** 2 team members (internal testing) + 3 NUS students (external testing).
- **Duration:** Ongoing over 2 weeks.
- **Methodology:** Task-based observation, bug reporting, and daily hotfixes.

### 3.2 Quantitative Results (Initial vs. After Fixes)
Users rated their experience on a scale of 1 to 5. The scores below reflect the improvement after we addressed the initial batch of bugs.

| Metric | Initial Score | Current Score | Notes |
| :--- | :---: | :---: | :--- |
| **Ease of Use** | 3.2 | 4.0 | UI was confusing initially; improved button labels and flow. |
| **Route Accuracy** | 3.5 | 4.2 | Fixed floor transition logic and route sorting issues. |
| **Performance** | 4.0 | 4.5 | Search debounce improved typing experience. |
| **Visual Clarity** | 3.8 | 4.0 | Map rendering is clear, still refining SVG shapes. |
| **Overall Satisfaction** | **3.6** | **4.1** | App is functional but still needs polish for production. |

### 3.3 Real-World Bugs Found & Fixed
During the testing phase, we encountered several critical bugs. Below is a summary of the issues found and our ongoing efforts to resolve them:

**Bug 1: Route Overview Sorting Logic (Critical)**
- **Issue:** When navigating from a higher floor to a lower floor (e.g., Floor 4 to Floor 1), the Route Overview panel displayed the floors in dictionary order (Floor 1, Floor 2, Floor 3, Floor 4) instead of the actual travel direction.
- **Root Cause:** The `floorList` array was hardcoded to sort in ascending order `(a - b)`.
- **Fix:** Updated the sorting logic in `NavigationScreen.jsx` to dynamically sort based on the start and end floor nodes from the actual route graph.
- **Status:** ✅ Fixed.

**Bug 2: "Exploring" Button Not Resetting State**
- **Issue:** When the user clicked the "Exploring" button without selecting a destination, the app did not navigate back to the HomeScreen as expected. The button appeared disabled or did nothing.
- **Root Cause:** The `handleSmartButton` function lacked a condition for `!startRoomId`, and the button had a `disabled` attribute blocking the click event.
- **Fix:** Removed the strict `disabled` condition and added `navigateTo('home')` logic when no start room is selected.
- **Status:** ✅ Fixed.

**Bug 3: Inaccurate Start/End Floor Detection**
- **Issue:** The system sometimes failed to correctly identify the starting floor, causing the route overview to display the wrong initial floor.
- **Root Cause:** The code was picking the first floor from an unsorted object key list instead of the actual first node in the calculated path.
- **Fix:** Changed logic to extract `startFloor` and `endFloor` directly from `graph.nodes.find(n => n.id === route[0])`.
- **Status:** ✅ Fixed.

**Bug 4: SVG Map Shapes Not Matching Reality**
- **Issue:** The overview map blocks looked like simple rectangles or distorted polygons, not matching the actual Eusoff Hall layout.
- **Root Cause:** Manual coordinate estimation was inaccurate.
- **Fix:** Currently iterating on SVG paths, planning to use vector tracing tools for pixel-perfect accuracy in the next milestone.
- **Status:** 🔄 In Progress.

---

## 4. Test Execution Log

This log tracks our daily testing and debugging efforts.

| Date | Test Phase | Focus Area | Bugs Found | Bugs Fixed | Notes |
| :--- | :--- | :--- | :---: | :---: | :--- |
| 15/06 | Unit Testing | A* Algorithm | 2 | 2 | Fixed edge case where start == end node. |
| 18/06 | Integration | Route Generation | 1 | 1 | Fixed path reconstruction returning undefined. |
| 22/06 | System Testing | Navigation Flow | 3 | 2 | Found Route Overview sorting bug. Fixed 2, 1 pending. |
| 24/06 | UI/UX Testing | Button States | 1 | 1 | Fixed "Exploring" button not navigating to Home. |
| 26/06 | User Testing | External Users | 4 | 1 | External users found UI confusing. Refactoring text. |
| 28/06 | Regression | All Features | 0 | 2 | Fixed remaining sorting and floor detection bugs. |

---

## 5. Automation Strategy (Future Work)

While the current milestone focused heavily on manual testing and daily bug fixing to stabilize the core features, we recognize the need for automated testing to prevent regressions.

### 5.1 Tool Selection
- **Unit & Integration Tests:** Jest + React Testing Library.
- **End-to-End (E2E) Tests:** Cypress.

### 5.2 Implementation Plan
1. **Setup:** Configure Jest in the Vite environment.
2. **Unit Tests:** Write automated scripts for `astar.js` to ensure pathfinding logic remains intact during refactoring.
3. **E2E Tests:** Create Cypress scripts to simulate a user searching for a room and verifying the route overlay appears.
4. **CI/CD Integration:** Integrate tests into GitHub Actions to run automatically on every Pull Request.

### 5.3 Coverage Goals
- Achieve **>80% code coverage** for all utility functions (`src/utils/`).
- Achieve **100% coverage** for critical pathfinding logic.
