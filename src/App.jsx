import graph from './data/graph.json';
import roomsData from './data/rooms.json';

export default function App() {
  return (
    <div>
      <h1>NUSCompass</h1>
      <p>React + Vite is running.</p>

      <h2>Data check</h2>
      <p>Floors: {graph.floors.length}</p>
      <p>Nodes: {graph.nodes.length}</p>
      <p>Edges: {graph.edges.length}</p>
      <p>Rooms: {roomsData.rooms.length}</p>
    </div>
  );
}
