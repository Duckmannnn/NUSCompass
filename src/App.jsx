import { useEffect, useMemo, useState } from 'react';
import { blockCLayout, graph, roomsData } from './data/blockCData';

import FloorMap from './components/FloorMap';
import FloorSelector from './components/FloorSelector';
import StepPanel from './components/StepPanel';

import { astar } from './utils/astar';

function getFloorsFromGraph(graphData) {
  const floorValues = [
    ...(graphData.floors ?? []).map((floor) => {
      if (typeof floor === 'object') {
        return floor.floor ?? floor.level ?? floor.id ?? floor.name;
      }

      return floor;
    }),
    ...(graphData.nodes ?? []).map((node) => node.floor),
  ];

  return Array.from(
    new Set(floorValues.filter((floor) => floor !== undefined && floor !== null))
  ).sort((a, b) => Number(a) - Number(b));
}

function getRoomLabel(room) {
  return room?.displayName ?? room?.name ?? room?.id ?? 'Unknown room';
}

function getRoomOptionLabel(room) {
  return `${room.name ?? room.id} · Floor ${room.floor}`;
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function filterRooms(rooms, query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return rooms.slice(0, 8);
  }

  return rooms
    .filter((room) => {
      const searchableText = [
        room.id,
        room.name,
        room.displayName,
        room.building,
        `floor ${room.floor}`,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    })
    .slice(0, 8);
}

function RoomSearchField({ id, label, value, rooms, onSelectRoom }) {
  const selectedRoom = rooms.find((room) => room.id === value);
  const [query, setQuery] = useState(selectedRoom?.name ?? selectedRoom?.id ?? '');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedRoom?.name ?? selectedRoom?.id ?? '');
  }, [selectedRoom]);

  const suggestions = useMemo(() => filterRooms(rooms, query), [rooms, query]);

  function handleSelect(room) {
    onSelectRoom(room);
    setQuery(room.name ?? room.id);
    setIsOpen(false);
  }

  return (
    <div className="room-search-field">
      <label htmlFor={id}>{label}</label>

      <div className="room-search-box">
        <input
          id={id}
          type="text"
          value={query}
          placeholder="Try C302, Toilet, Lounge..."
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && suggestions[0]) {
              event.preventDefault();
              handleSelect(suggestions[0]);
            }

            if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />

        {isOpen && (
          <div className="room-search-results">
            {suggestions.length > 0 ? (
              suggestions.map((room) => (
                <button
                  key={`${id}-${room.id}`}
                  type="button"
                  className={room.id === value ? 'room-result active' : 'room-result'}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(room)}
                >
                  <span>
                    <strong>{room.name ?? room.id}</strong>
                    <small>{room.displayName ?? room.building ?? 'Eusoff Block C'}</small>
                  </span>
                  <em>F{room.floor}</em>
                </button>
              ))
            ) : (
              <div className="room-result empty">No matching rooms found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [startRoomId, setStartRoomId] = useState('C111');
  const [destinationRoomId, setDestinationRoomId] = useState('C302');
  const [route, setRoute] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(1);

  const floors = useMemo(() => getFloorsFromGraph(graph), []);

  const startRoom = useMemo(
    () => roomsData.find((room) => room.id === startRoomId),
    [startRoomId]
  );

  const destinationRoom = useMemo(
    () => roomsData.find((room) => room.id === destinationRoomId),
    [destinationRoomId]
  );

  const startNodeId = startRoom?.nodeId;
  const destinationNodeId = destinationRoom?.nodeId;

  // Existing map components use selectedRoom/selectedNodeId for destination.
  const selectedRoom = destinationRoom;
  const selectedNodeId = destinationNodeId;

  useEffect(() => {
    if (!startNodeId || !destinationNodeId) {
      setRoute([]);
      return;
    }

    const newRoute = astar(startNodeId, destinationNodeId, graph);
    setRoute(newRoute);
    setCurrentFloor(destinationRoom?.floor ?? startRoom?.floor ?? 1);
  }, [startNodeId, destinationNodeId, startRoom, destinationRoom]);

  function handleSelectStartRoom(room) {
    setStartRoomId(room.id);
    setCurrentFloor(room.floor ?? 1);
  }

  function handleSelectDestinationRoom(room) {
    setDestinationRoomId(room.id);
    setCurrentFloor(room.floor ?? 1);
  }

  console.log('Block C rooms:', roomsData.length);
  console.log('Block C nodes:', graph.nodes.length);
  console.log('Block C edges:', graph.edges.length);

  return (
    <main className="app-shell">
      <section className="app-header">
        <p className="eyebrow">NUSCompass MVP</p>
        <h1>Indoor Navigation Proof of Concept</h1>
        <p>
          Select where you are and where you want to go. NUSCompass generates an
          indoor route through Eusoff Block C.
        </p>
      </section>

      <section className="app-layout">
        <aside className="sidebar">
          <div className="route-picker">
            <RoomSearchField
              id="start-room-search"
              label="You are at"
              value={startRoomId}
              rooms={roomsData}
              onSelectRoom={handleSelectStartRoom}
            />

            <RoomSearchField
              id="destination-room-search"
              label="Go to"
              value={destinationRoomId}
              rooms={roomsData}
              onSelectRoom={handleSelectDestinationRoom}
            />

            <div className="route-summary">
              <strong>
                {startRoom?.name ?? startRoomId} → {destinationRoom?.name ?? destinationRoomId}
              </strong>
              <span>
                Floor {startRoom?.floor ?? '?'} to Floor {destinationRoom?.floor ?? '?'}
              </span>
            </div>
          </div>

          <FloorSelector
            floors={floors}
            currentFloor={currentFloor}
            onChangeFloor={setCurrentFloor}
          />

          <div className="info-card">
            <h2>Current route</h2>

            {startRoom && destinationRoom ? (
              <>
                <p>
                  From: <strong>{getRoomLabel(startRoom)}</strong>
                </p>
                <p>
                  To: <strong>{getRoomLabel(destinationRoom)}</strong>
                </p>
                <p>Start node: {startNodeId}</p>
                <p>Destination node: {destinationNodeId}</p>
                <p>Route length: {route.length} nodes</p>
              </>
            ) : (
              <p>Select both a start location and a destination.</p>
            )}
          </div>
        </aside>

        <section className="main-panel">
          <FloorMap
            graph={graph}
            route={route}
            currentFloor={currentFloor}
            selectedNodeId={selectedNodeId}
            selectedRoom={selectedRoom}
            startRoom={startRoom}
            startNodeId={startNodeId}
            blockCLayout={blockCLayout}
          />

          <StepPanel graph={graph} route={route} selectedRoom={selectedRoom} />

          <div className="info-card">
            <h2>Route output</h2>

            {route.length > 0 ? (
              <ol className="route-list">
                {route.map((nodeId) => (
                  <li key={nodeId}>{nodeId}</li>
                ))}
              </ol>
            ) : (
              <p>Select a start location and a destination to generate a route.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
