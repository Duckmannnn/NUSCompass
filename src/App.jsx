import { useMemo, useState } from 'react';

import { graph, roomsData } from './data/blockCData';

import FloorMap from './components/FloorMap';
import FloorSelector from './components/FloorSelector';
import SearchBar from './components/SearchBar';

import { astar } from './utils/astar';
import { getRoomNodeId } from './utils/search';
import StepPanel from './components/StepPanel';

const START_NODE_ID = 'F1-ENTRANCE';

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

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [route, setRoute] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(1);

  const floors = useMemo(() => getFloorsFromGraph(graph), []);

  function handleSelectRoom(room) {
    const destinationNodeId = getRoomNodeId(room);
    const newRoute = astar(START_NODE_ID, destinationNodeId, graph);

    setSelectedRoom(room);
    setRoute(newRoute);
    setCurrentFloor(room.floor ?? 1);
  }

  const selectedNodeId = selectedRoom ? getRoomNodeId(selectedRoom) : null;

  console.log('Block C rooms:', roomsData.length);
  console.log('Block C nodes:', graph.nodes.length);
  console.log('Block C edges:', graph.edges.length);

  return (
    <main className="app-shell">
      <section className="app-header">
        <p className="eyebrow">NUSCompass MVP</p>
        <h1>Indoor Navigation Proof of Concept</h1>
        <p>
          Search for a room and generate a basic indoor route from the main
          entrance.
        </p>
      </section>

      <section className="app-layout">
        <aside className="sidebar">
          <SearchBar roomsData={roomsData} onSelectRoom={handleSelectRoom} />

          <FloorSelector
            floors={floors}
            currentFloor={currentFloor}
            onChangeFloor={setCurrentFloor}
          />

          <div className="info-card">
            <h2>Selected room</h2>

            {selectedRoom ? (
              <>
                <p>
                  <strong>{getRoomLabel(selectedRoom)}</strong>
                </p>
                <p>Floor: {selectedRoom.floor}</p>
                <p>Node ID: {selectedNodeId}</p>
                <p>Route length: {route.length} nodes</p>
              </>
            ) : (
              <p>No room selected yet.</p>
            )}
          </div>
        </aside>

        <section className="main-panel">
          <FloorMap
            graph={graph}
            route={route}
            currentFloor={currentFloor}
            selectedNodeId={selectedNodeId}
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
              <p>Select a room to generate a route.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}