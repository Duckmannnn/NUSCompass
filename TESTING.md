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
