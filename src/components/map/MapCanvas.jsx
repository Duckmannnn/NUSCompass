import { useMemo } from 'react';
import { blockCLayout } from '../../data/blockCData';

export default function MapCanvas({
  currentFloor,
  onRoomClick,
  route = [],
  currentStepIndex = 0,
  highlightedRoomId = null,
  startRoomId = null,
  graph = { nodes: [], edges: [] },
}) {
  const layout = blockCLayout[currentFloor];

  // ── Pre-build edge lookup map for O(1) access ─────────────────────────
  const edgeMap = useMemo(() => {
    const map = new Map();
    graph.edges.forEach(edge => {
      const key1 = `${edge.from}|${edge.to}`;
      const key2 = `${edge.to}|${edge.from}`;
      map.set(key1, edge);
      map.set(key2, edge);
    });
    return map;
  }, [graph.edges]);

  // ── Pre-build node lookup map for O(1) access ─────────────────────────
  const nodeMap = useMemo(() => {
    const map = new Map();
    graph.nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [graph.nodes]);

  if (!layout) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', fontSize: '20px', color: '#6b7280'
      }}>
        No map data for floor {currentFloor}
      </div>
    );
  }

  const { viewBox, corridorPaths, outerWallPath, rooms, facilities, specials, stairs } = layout;

  // ── Route helpers ──────────────────────────────────────────────────────

  const getRouteSegmentForCurrentFloor = () => {
    if (route.length === 0) return [];

    let segment = [];
    let collecting = false;

    for (const nodeId of route) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      if (node.floor === currentFloor) {
        segment.push(nodeId);
        collecting = true;
      } else if (collecting) {
        break;
      }
    }

    return segment;
  };

  const currentFloorRoute = getRouteSegmentForCurrentFloor();

  // Build SVG path strings using O(1) edge lookup
  const getRouteEdges = () => {
    if (currentFloorRoute.length < 2) return [];

    return currentFloorRoute.slice(0, -1).reduce((acc, fromNode, i) => {
      const toNode = currentFloorRoute[i + 1];
      const edge = edgeMap.get(`${fromNode}|${toNode}`);
      if (edge?.path) acc.push(edge.path);
      return acc;
    }, []);
  };

  const routeEdges = getRouteEdges();

  const pathToSvg = (path) => {
    if (!path || path.length === 0) return '';
    return path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Resolve a node ID to an (x, y) position — returns null if not found
  const getNodePosition = (nodeId) => {
    const node = nodeMap.get(nodeId);
    if (node) return { x: node.x, y: node.y };

    const room = rooms.find(r => r.nodeId === nodeId);
    if (room?.door) return room.door;

    const facility = facilities.find(f => f.nodeId === nodeId);
    if (facility?.door) return facility.door;

    return null; // ← Return null instead of hardcoded fallback
  };

  const getStairDirection = () => {
    if (currentFloorRoute.length === 0) return '↓';
    const lastLocalIdx = route.indexOf(currentFloorRoute[currentFloorRoute.length - 1]);
    if (lastLocalIdx < 0 || lastLocalIdx >= route.length - 1) return '↓';
    const nextNode = nodeMap.get(route[lastLocalIdx + 1]);
    if (!nextNode) return '↓';
    return nextNode.floor > currentFloor ? '↑' : '↓';
  };

  // Derived markers
  const firstNodeInSegment = currentFloorRoute[0];
  const lastNodeInSegment = currentFloorRoute[currentFloorRoute.length - 1];
  const isFirstSegment = firstNodeInSegment && route.indexOf(firstNodeInSegment) === 0;
  const isLastSegment  = lastNodeInSegment  && route.indexOf(lastNodeInSegment) === route.length - 1;
  const hasStairTransition = lastNodeInSegment && !isLastSegment;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      backgroundColor: '#f9fafb', position: 'relative'
    }}>
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        style={{ width: '100%', height: 'auto', minHeight: '600px', backgroundColor: '#ffffff' }}
      >
        {/* Outer wall */}
        <path d={outerWallPath} fill="#f3f4f6" stroke="#374151" strokeWidth="4" />

        {/* Corridor fills */}
        {corridorPaths.map((path, i) => (
          <path key={i} d={path} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
        ))}

        {/* Rooms */}
        {rooms.map((room) => {
          const isHighlighted = highlightedRoomId === room.id;
          return (
            <g key={room.id} onClick={() => onRoomClick?.(room)} style={{ cursor: 'pointer' }}>
              {isHighlighted && (
                <rect
                  x={room.x - 5} y={room.y - 5}
                  width={room.width + 10} height={room.height + 10}
                  fill="none" stroke="#fbbf24" strokeWidth="4" rx="6" opacity="0.8"
                >
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
                </rect>
              )}

              <rect
                x={room.x} y={room.y} width={room.width} height={room.height}
                fill={isHighlighted ? '#fef3c7' : '#dbeafe'}
                stroke={isHighlighted ? '#f59e0b' : '#3b82f6'}
                strokeWidth="3" rx="4"
              />
              <text
                x={room.x + room.width / 2} y={room.y + room.height / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="14" fontWeight="bold"
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
              x={facility.x} y={facility.y} width={facility.width} height={facility.height}
              fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" rx="4"
            />
            <text
              x={facility.x + facility.width / 2} y={facility.y + facility.height / 2}
              textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#92400e"
            >
              {facility.label}
            </text>
          </g>
        ))}

        {/* Special rooms */}
        {specials?.map((special) => (
          <g key={special.id}>
            <rect
              x={special.x} y={special.y} width={special.width} height={special.height}
              fill="#f3e8ff" stroke="#9333ea" strokeWidth="3" rx="4"
            />
            <text
              x={special.x + special.width / 2} y={special.y + special.height / 2}
              textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#6b21a8"
            >
              {special.label}
            </text>
          </g>
        ))}

        {/* Stairs */}
        {stairs?.map((stair) => (
          <g key={stair.id}>
            <rect
              x={stair.x} y={stair.y} width={stair.width} height={stair.height}
              fill="#d1fae5" stroke="#10b981" strokeWidth="2" rx="4"
            />
            <text
              x={stair.x + stair.width / 2} y={stair.y + stair.height / 2}
              textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#065f46"
            >
              🪜
            </text>
          </g>
        ))}

        {/* Route overlay — current floor only */}
        {routeEdges.length > 0 && (
          <g>
            {routeEdges.map((path, i) => (
              <path
                key={i} d={pathToSvg(path)}
                fill="none" stroke="#3b82f6" strokeWidth="4"
                strokeDasharray="8,4" opacity="0.7"
              />
            ))}

            {/* Start marker (green S) */}
            {isFirstSegment && (() => {
              const pos = getNodePosition(firstNodeInSegment);
              if (!pos) return null;
              return (
                <g>
                  <circle cx={pos.x} cy={pos.y} r="12" fill="#10b981" stroke="white" strokeWidth="3" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">S</text>
                </g>
              );
            })()}

            {/* End marker (red E) */}
            {isLastSegment && (() => {
              const pos = getNodePosition(lastNodeInSegment);
              if (!pos) return null;
              return (
                <g>
                  <circle cx={pos.x} cy={pos.y} r="12" fill="#ef4444" stroke="white" strokeWidth="3" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">E</text>
                </g>
              );
            })()}

            {/* Stair transition marker (amber ↑/↓) */}
            {hasStairTransition && (() => {
              const pos = getNodePosition(lastNodeInSegment);
              if (!pos) return null;
              return (
                <g>
                  <circle cx={pos.x} cy={pos.y} r="10" fill="#f59e0b" stroke="white" strokeWidth="3" />
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">
                    {getStairDirection()}
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}