# NUSCompass - Kiến trúc Hệ thống

## 1. Cấu trúc Folder

```
NUSCompass/
├── public/
│   └── maps/               ← Ảnh bản đồ từng tầng (Tuấn cung cấp)
│       ├── floor1.png
│       ├── floor2.png
│       ├── floor3.png
│       └── floor4.png
│
├── src/
│   ├── components/         ← Tuấn phụ trách
│   │   ├── SearchBar.jsx
│   │   ├── FloorMap.jsx
│   │   ├── StepPanel.jsx
│   │   └── FloorSelector.jsx
│   │
│   ├── utils/              ← Minh phụ trách
│   │   ├── astar.js
│   │   └── search.js
│   │
│   ├── data/               ← Minh phụ trách
│   │   ├── graph.json
│   │   └── rooms.json
│   │
│   ├── styles/             ← Tuấn phụ trách
│   │   └── app.css
│   │
│   ├── App.jsx             ← Minh phụ trách
│   └── main.jsx
│
├── index.html
├── package.json
└── vite.config.js
```

---

## 2. Data Flow (Luồng dữ liệu)

```
User gõ tên phòng
        ↓
SearchBar.jsx (Tuấn)
  → Lọc rooms.json bằng search.js (Minh)
  → User click phòng
  → Gọi onRoomSelect(room) lên App.jsx
        ↓
App.jsx (Minh)
  → Nhận room từ SearchBar
  → Gọi astar(startId, room.id, graph)
  → Nhận route = ['F1-ENTRANCE', 'F1-CORRIDOR', ...]
  → setRoute(route)
        ↓
FloorMap.jsx (Tuấn)       StepPanel.jsx (Tuấn)
  → Nhận route qua props    → Nhận route qua props
  → Vẽ đường đỏ trên SVG    → Hiện danh sách bước
```

---

## 3. Ranh giới công việc

### Minh làm:
- `src/utils/astar.js` → Thuật toán A*
- `src/utils/search.js` → Logic tìm kiếm phòng
- `src/data/graph.json` → Dữ liệu bản đồ
- `src/data/rooms.json` → Dữ liệu phòng
- `src/App.jsx` → State management + nối logic với UI

### Tuấn làm:
- `src/components/SearchBar.jsx` → UI tìm kiếm
- `src/components/FloorMap.jsx` → UI bản đồ SVG
- `src/components/StepPanel.jsx` → UI hướng dẫn
- `src/components/FloorSelector.jsx` → UI chọn tầng
- `src/styles/app.css` → Style toàn bộ app
- `public/maps/` → Ảnh bản đồ từng tầng

---

## 4. Contract giữa Components

### SearchBar.jsx
```jsx
// Props nhận vào:
<SearchBar
  rooms={rooms.rooms}           // Array phòng từ rooms.json
  onRoomSelect={handleRoomSelect} // Callback khi user chọn phòng
/>

// Output (callback):
onRoomSelect({ id, name, floor, ... })
```

### FloorMap.jsx
```jsx
// Props nhận vào:
<FloorMap
  currentFloor={currentFloor}   // Số tầng đang xem (1, 2, 3, 4)
  floors={graph.floors}         // Danh sách tầng
  nodes={graph.nodes}           // Danh sách node (phòng + hành lang)
  route={route}                 // Mảng node ID từ A*
  selectedRoom={selectedRoom}   // Phòng đích
/>
```

### StepPanel.jsx
```jsx
// Props nhận vào:
<StepPanel
  route={route}                 // Mảng node ID từ A*
  nodes={graph.nodes}           // Danh sách node
  currentFloor={currentFloor}   // Số tầng đang xem
/>
```

### FloorSelector.jsx
```jsx
// Props nhận vào:
<FloorSelector
  floors={graph.floors}         // Danh sách tầng
  currentFloor={currentFloor}   // Tầng đang xem
  onFloorChange={handleFloorChange} // Callback khi đổi tầng
/>
```

---

## 5. State trong App.jsx

```jsx
const [currentFloor, setCurrentFloor] = useState(1);
// Tầng user đang xem (1, 2, 3, 4)

const [selectedRoom, setSelectedRoom] = useState(null);
// Phòng user đã chọn (object từ rooms.json)

const [route, setRoute] = useState([]);
// Mảng node ID từ A* (đường đi ngắn nhất)
```

---

## 6. Nguyên tắc quan trọng

```
✅ Data đi TỪ App.jsx XUỐNG component bằng props
✅ Event đi TỪ component LÊN App.jsx bằng callback
✅ A* chỉ tính route, không vẽ UI
✅ FloorMap chỉ vẽ route, không tính đường
✅ SearchBar chỉ chọn phòng, không biết A*
✅ Tuấn dùng mock data để code UI trước, không cần chờ Minh
```
