# NUSCompass - Development Guide

## 1. Setup Project lần đầu

### Yêu cầu
- Node.js v18+ (kiểm tra: `node -v`)
- npm v9+ (kiểm tra: `npm -v`)
- Git

### Clone và setup
```bash
# Clone repo
git clone https://github.com/Duckmannnn/NUSCompass.git
cd NUSCompass

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Mở browser: `http://localhost:5173`

---

## 2. Setup Vite (Minh làm lần đầu)

```bash
# Trong folder NUSCompass, chạy:
npm create vite@latest . -- --template react

# Khi hỏi "Current directory is not empty", chọn: Ignore files and continue
# Khi hỏi framework: React
# Khi hỏi variant: JavaScript

npm install
npm run dev
```

---

## 3. Quy trình làm việc với Git

### Mỗi ngày bắt đầu code:
```bash
git pull origin main
```

### Sau khi code xong (commit):
```bash
git add .
git commit -m "feat: mô tả ngắn gọn bạn làm gì"
git push origin main
```

### Ví dụ commit message:
```bash
git commit -m "feat: add SearchBar component with autocomplete"
git commit -m "feat: implement A* algorithm"
git commit -m "fix: fix route not showing on floor 2"
git commit -m "style: update FloorMap CSS"
```

---

## 4. Quy ước đặt tên

### File:
```
Components:  PascalCase   → SearchBar.jsx, FloorMap.jsx
Utils:       camelCase    → astar.js, search.js
Data:        kebab-case   → graph.json, rooms.json
Styles:      kebab-case   → app.css
```

### Variable trong JS:
```javascript
// camelCase cho variable
const currentFloor = 1;
const selectedRoom = null;
const routeNodes = [];

// PascalCase cho component
function SearchBar() { ... }
function FloorMap() { ... }

// UPPER_CASE cho constant
const FLOOR_CHANGE_PENALTY = 100;
const MAX_SUGGESTIONS = 5;
```

### Node ID trong graph.json:
```
Format: F{floor}-{type}-{number}

Ví dụ:
  F1-101        → Floor 1, Room 101
  F1-STAIR-A    → Floor 1, Staircase A
  F2-COMMON     → Floor 2, Common Area
  F1-ENTRANCE   → Floor 1, Entrance
  F1-CORRIDOR-1 → Floor 1, Corridor 1
```

---

## 5. Phân chia công việc

### Minh làm:
```
src/utils/astar.js
src/utils/search.js
src/data/graph.json
src/data/rooms.json
src/App.jsx
```

### Tuấn làm:
```
src/components/SearchBar.jsx
src/components/FloorMap.jsx
src/components/StepPanel.jsx
src/components/FloorSelector.jsx
src/styles/app.css
public/maps/ (ảnh bản đồ)
```

---

## 6. Cách Tuấn code UI khi chưa có data thật

Tuấn dùng mock data này trong component để test UI trước:

```javascript
// Mock data tạm thời (xóa sau khi integrate với App.jsx)
const mockRoute = ["F1-ENTRANCE", "F1-CORRIDOR-1", "F1-101"];

const mockNodes = [
  { id: "F1-ENTRANCE", name: "Entrance", floor: 1, x: 400, y: 500 },
  { id: "F1-CORRIDOR-1", name: "Corridor", floor: 1, x: 300, y: 300 },
  { id: "F1-101", name: "Room 101", floor: 1, x: 150, y: 150 }
];

const mockFloors = [
  { id: 1, name: "Floor 1", width: 800, height: 600 },
  { id: 2, name: "Floor 2", width: 800, height: 600 },
  { id: 3, name: "Floor 3", width: 800, height: 600 },
  { id: 4, name: "Floor 4", width: 800, height: 600 }
];

const mockRooms = [
  { id: "F1-101", name: "Room 101", displayName: "Room 101", floor: 1 },
  { id: "F1-102", name: "Room 102", displayName: "Room 102", floor: 1 },
  { id: "F2-201", name: "Room 201", displayName: "Room 201", floor: 2 }
];
```

---

## 7. Checklist trước khi commit

### Minh:
```
[ ] graph.json có đủ nodes + edges chưa?
[ ] A* test pass với 3+ case (cùng tầng, khác tầng)?
[ ] console.log đã xóa hết chưa?
[ ] App.jsx state flow đúng chưa?
```

### Tuấn:
```
[ ] Component nhận đúng props chưa?
[ ] UI render không bị lỗi khi route rỗng?
[ ] SVG path vẽ đúng không?
[ ] CSS responsive mobile chưa?
[ ] console.log đã xóa hết chưa?
```

---

## 8. Test A* (Minh)

Khi viết astar.js xong, test với các case này:

```javascript
import graph from '../data/graph.json';
import { astar } from './astar';

// Case 1: Cùng tầng
const route1 = astar('F1-ENTRANCE', 'F1-101', graph);
console.log(route1);
// Expected: ['F1-ENTRANCE', ..., 'F1-101']

// Case 2: Khác tầng
const route2 = astar('F1-ENTRANCE', 'F2-201', graph);
console.log(route2);
// Expected: ['F1-ENTRANCE', ..., 'F1-STAIR-A', 'F2-STAIR-A', ..., 'F2-201']

// Case 3: Cùng điểm
const route3 = astar('F1-101', 'F1-101', graph);
console.log(route3);
// Expected: ['F1-101']

// Case 4: Không có đường
const route4 = astar('F1-101', 'F4-999', graph);
console.log(route4);
// Expected: []
```

---

## 9. Deploy lên Vercel

```bash
# Bước 1: Build production
npm run build

# Bước 2: Push lên GitHub
git add .
git commit -m "deploy: production build"
git push origin main

# Bước 3: Vào vercel.com
# - Connect GitHub repo NUSCompass
# - Vercel tự detect Vite và deploy
# - Nhận link: https://nuscompass.vercel.app
```

---

## 10. Deadline Checklist

```
Ngày 1-2 (Minh): graph.json + rooms.json (mock Eusoff 4 tầng)
Ngày 3-4 (Minh): astar.js + test pass
Ngày 5-6 (Tuấn): SearchBar + FloorMap + StepPanel + FloorSelector
Ngày 7   (Minh): App.jsx integrate
Ngày 8   (Both): Bug fix + polish
Ngày 9   (Minh): Deploy Vercel
Ngày 10  (Both): Video demo + poster → Submit
```
