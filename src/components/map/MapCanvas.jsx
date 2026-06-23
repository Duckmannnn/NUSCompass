// src/components/map/MapCanvas.jsx
import { blockCLayout } from '../../data/blockCData';

export default function MapCanvas({ 
  currentFloor, 
  onRoomClick, 
  route = [], 
  currentStepIndex = 0,
  highlightedRoomId = null,
  startRoomId = null,
  graph = { nodes: [], edges: [] }
}) {
  const layout = blockCLayout[currentFloor];
  
  if (!layout) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        fontSize: '20px',
        color: '#6b7280'
      }}>
        No map data for floor {currentFloor}
      </div>
    );
  }

  const { viewBox, corridorPaths, outerWallPath, rooms, facilities, specials, stairs } = layout;

  // Split route into segments by floor
  const getRouteSegmentForCurrentFloor = () => {
    if (route.length === 0) return [];
    
    const segment = [];
    let startIndex = -1;
    let endIndex = -1;
    
    // Find the continuous segment on current floor
    for (let i = 0; i < route.length; i++) {
      const nodeId = route[i];
      const node = graph.nodes.find(n => n.id === nodeId);
      
      if (node && node.floor === currentFloor) {
        if (startIndex === -1) {
          startIndex = i;
        }
        endIndex = i;
      } else if (startIndex !== -1) {
        // We've left the current floor, stop here
        break;
      }
    }
    
    if (startIndex === -1) return [];
    
    // Include the stair node at the end if it exists
    return route.slice(startIndex, endIndex + 1);
  };

  const currentFloorRoute = getRouteSegmentForCurrentFloor();

  // Get route edges with paths from graph
  const getRouteEdges = () => {
    if (currentFloorRoute.length < 2) return [];
    
    const edges = [];
    for (let i = 0; i < currentFloorRoute.length - 1; i++) {
      const fromNode = currentFloorRoute[i];
      const toNode = currentFloorRoute[i + 1];
      
      // Find edge in graph
      const edge = graph.edges.find(e => 
        (e.from === fromNode && e.to === toNode) ||
        (e.from === toNode && e.to === fromNode)
      );
      
      if (edge && edge.path) {
        edges.push(edge.path);
      }
    }
    return edges;
  };

  const routeEdges = getRouteEdges();

  // Convert path array to SVG path string
  const pathToSvg = (path) => {
    if (!path || path.length === 0) return '';
    return path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Get node position for markers
  const getNodePosition = (nodeId) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node) {
      return { x: node.x, y: node.y };
    }
    
    const room = rooms.find(r => r.nodeId === nodeId);
    if (room && room.door) {
      return room.door;
    }
    
    const facility = facilities.find(f => f.nodeId === nodeId);
    if (facility && facility.door) {
      return facility.door;
    }
    
    return { x: 500, y: 400 };
  };

  // Find which step in the current floor segment corresponds to the global currentStepIndex
  const getCurrentStepInSegment = () => {
    if (currentFloorRoute.length === 0) return -1;
    
    const firstNodeInSegment = currentFloorRoute[0];
    const firstNodeIndexInFullRoute = route.indexOf(firstNodeInSegment);
    
    if (firstNodeIndexInFullRoute === -1) return -1;
    
    return currentStepIndex - firstNodeIndexInFullRoute;
  };

  const localStepIndex = getCurrentStepInSegment();

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'auto', 
      backgroundColor: '#f9fafb',
      position: 'relative'
    }}>
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        style={{
          width: '100%',
          height: 'auto',
          minHeight: '600px',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Outer wall */}
        <path
          d={outerWallPath}
          fill="#f3f4f6"
          stroke="#374151"
          strokeWidth="4"
        />

        {/* Corridor paths */}
        {corridorPaths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="2"
          />
        ))}

        {/* Rooms */}
        {rooms.map((room) => {
          const isHighlighted = highlightedRoomId === room.id;
          
          return (
            <g
              key={room.id}
              onClick={() => onRoomClick && onRoomClick(room)}
              style={{ cursor: 'pointer' }}
            >
              {isHighlighted && (
                <rect
                  x={room.x - 5}
                  y={room.y - 5}
                  width={room.width + 10}
                  height={room.height + 10}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  rx="6"
                  opacity="0.8"
                >
                  <animate
                    attributeName="opacity"
                    values="0.8;0.3;0.8"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}
              
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={isHighlighted ? '#fef3c7' : '#dbeafe'}
                stroke={isHighlighted ? '#f59e0b' : '#3b82f6'}
                strokeWidth="3"
                rx="4"
              />
              
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill={isHighlighted ? '#92400e' : '#1e40af'}
              >
                {room.label}
              </text>
            </g>
          );
        })}

        {/* Facilities */}
        {facilities.map((facility) => (
          <g key={facility.id}>
            <rect
              x={facility.x}
              y={facility.y}
              width={facility.width}
              height={facility.height}
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="3"
              rx="4"
            />
            <text
              x={facility.x + facility.width / 2}
              y={facility.y + facility.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#92400e"
            >
              {facility.label}
            </text>
          </g>
        ))}

        {/* Specials */}
        {specials && specials.map((special) => (
          <g key={special.id}>
            <rect
              x={special.x}
              y={special.y}
              width={special.width}
              height={special.height}
              fill="#f3e8ff"
              stroke="#9333ea"
              strokeWidth="3"
              rx="4"
            />
            <text
              x={special.x + special.width / 2}
              y={special.y + special.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#6b21a8"
            >
              {special.label}
            </text>
          </g>
        ))}

        {/* Stairs */}
        {stairs && stairs.map((stair) => (
          <g key={stair.id}>
            <rect
              x={stair.x}
              y={stair.y}
              width={stair.width}
              height={stair.height}
              fill="#d1fae5"
              stroke="#10b981"
              strokeWidth="2"
              rx="4"
            />
            <text
              x={stair.x + stair.width / 2}
              y={stair.y + stair.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#065f46"
            >
              🪜
            </text>
          </g>
        ))}

        {/* Route overlay - ONLY for current floor */}
        {routeEdges.length > 0 && (
          <g>
            {/* Route path */}
            {routeEdges.map((path, index) => (
              <path
                key={index}
                d={pathToSvg(path)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="8,4"
                opacity="0.7"
              />
            ))}
            
            {/* Start marker (only if this is the first segment) */}
            {currentFloorRoute.length > 0 && route.indexOf(currentFloorRoute[0]) === 0 && (
              <g>
                <circle
                  cx={getNodePosition(currentFloorRoute[0]).x}
                  cy={getNodePosition(currentFloorRoute[0]).y}
                  r="12"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x={getNodePosition(currentFloorRoute[0]).x}
                  y={getNodePosition(currentFloorRoute[0]).y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                >
                  S
                </text>
              </g>
            )}
            
            {/* End marker (only if this is the last segment) */}
            {currentFloorRoute.length > 0 && route.indexOf(currentFloorRoute[currentFloorRoute.length - 1]) === route.length - 1 && (
              <g>
                <circle
                  cx={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).x}
                  cy={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).y}
                  r="12"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).x}
                  y={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                >
                  E
                </text>
              </g>
            )}
            
            {/* Stair transition marker */}
            {currentFloorRoute.length > 0 && route.indexOf(currentFloorRoute[currentFloorRoute.length - 1]) !== route.length - 1 && (
              <g>
                <circle
                  cx={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).x}
                  cy={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).y}
                  r="10"
                  fill="#f59e0b"
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).x}
                  y={getNodePosition(currentFloorRoute[currentFloorRoute.length - 1]).y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                >
                  ↓
                </text>
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}