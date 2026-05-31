import { useState } from 'react';

import graph from './data/graph.json';
import roomsData from './data/rooms.json';

import SearchBar from './components/SearchBar';

import { astar } from './utils/astar';
import { getRoomNodeId } from './utils/search';

const START_NODE_ID = 'F1-ENTRANCE';

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [route, setRoute] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(1);

  function handleSelectRoom(room) {
    const destinationNodeId = getRoomNodeId(room);
    const newRoute = astar(START_NODE_ID, destinationNodeId, graph);

    setSelectedRoom(room);
    setRoute(newRoute);
    setCurrentFloor(room.floor ?? 1);
  }

  return (
    <main className="app-shell">
      <section className="app-header">
        <p className="eyebrow">NUSCompass MVP</p>
        <h1>Indoor Navigation Proof of Concept</h1>
        <p>
          Search for a room and generate a basic route from the main entrance.
        </p>
      </section>

      <section className="app-layout">
        <aside className="sidebar">
          <SearchBar roomsData={roomsData} onSelectRoom={handleSelectRoom} />

          <div className="info-card">
            <h2>Selected room</h2>
            {selectedRoom ? (
              <>
                <p>
                  <strong>{selectedRoom.displayName ?? selectedRoom.name}</strong>
                </p>
                <p>Floor: {selectedRoom.floor}</p>
                <p>Node ID: {getRoomNodeId(selectedRoom)}</p>
              </>
            ) : (
              <p>No room selected yet.</p>
            )}
          </div>

          <div className="info-card">
            <h2>Current floor</h2>
            <p>Floor {currentFloor}</p>
          </div>
        </aside>

        <section className="main-panel">
          <div className="info-card">
            <h2>Route output</h2>

            {route.length > 0 ? (
              <ol className="route-list">
                {route.map((nodeId) => (
                  <li key={nodeId}>{nodeId}</li>
                ))}
              </ol>
            ) : (
              <p>Select a room to generate a route.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}