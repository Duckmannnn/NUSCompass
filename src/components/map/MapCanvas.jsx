import { useMemo } from 'react';
import { blockCLayout } from '../../data/blockCData';

const EMPTY_GRAPH = {
  nodes: [],
  edges: [],
};

export default function MapCanvas({
  currentFloor,
  onRoomClick,
  route = [],
  highlightedRoomId = null,
  graph = EMPTY_GRAPH,
}) {
  const layout = blockCLayout[currentFloor];

  // Exact directed edge lookup for O(1) route rendering.
  const edgeMap = useMemo(() => {
    const map = new Map();

    for (const edge of graph.edges ?? []) {
      const forwardKey = `${edge.from}|${edge.to}`;

      map.set(forwardKey, edge);

      // Also support graph data that only stores one direction.
      const reverseKey = `${edge.to}|${edge.from}`;

      if (!map.has(reverseKey)) {
        map.set(reverseKey, {
          ...edge,
          from: edge.to,
          to: edge.from,
          path: Array.isArray(edge.path)
            ? [...edge.path].reverse()
            : edge.path,
        });
      }
    }

    return map;
  }, [graph.edges]);

  // Node lookup for O(1) access.
  const nodeMap = useMemo(() => {
    const map = new Map();

    for (const node of graph.nodes ?? []) {
      map.set(node.id, node);
    }

    return map;
  }, [graph.nodes]);

  if (!layout) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: '20px',
          color: '#6b7280',
        }}
      >
        No map data for floor {currentFloor}
      </div>
    );
  }

  const {
    viewBox,
    corridorPaths = [],
    outerWallPath,
    rooms = [],
    facilities = [],
    specials = [],
    stairs = [],
  } = layout;

  // All visible map destinations use the same interaction system.
  const mapItems = [
    ...rooms,
    ...facilities,
    ...specials,
  ];

  // ── Route helpers ──────────────────────────────────────────────────────

  const getRouteSegmentForCurrentFloor = () => {
    if (route.length === 0) {
      return [];
    }

    const segment = [];
    let collecting = false;

    for (const nodeId of route) {
      const node = nodeMap.get(nodeId);

      if (!node) {
        continue;
      }

      if (node.floor === currentFloor) {
        segment.push(nodeId);
        collecting = true;
      } else if (collecting) {
        break;
      }
    }

    return segment;
  };

  const currentFloorRoute =
    getRouteSegmentForCurrentFloor();

  const getRouteEdges = () => {
    if (currentFloorRoute.length < 2) {
      return [];
    }

    return currentFloorRoute
      .slice(0, -1)
      .reduce((paths, fromNode, index) => {
        const toNode =
          currentFloorRoute[index + 1];

        const edge = edgeMap.get(
          `${fromNode}|${toNode}`
        );

        if (edge?.path) {
          paths.push(edge.path);
        }

        return paths;
      }, []);
  };

  const routeEdges = getRouteEdges();

  const pathToSvg = (path) => {
    if (!path || path.length === 0) {
      return '';
    }

    return path
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      )
      .join(' ');
  };

  const getNodePosition = (nodeId) => {
    const node = nodeMap.get(nodeId);

    if (node) {
      return {
        x: node.x,
        y: node.y,
      };
    }

    const mapItem = mapItems.find(
      (item) => item.nodeId === nodeId
    );

    return mapItem?.door ?? null;
  };

  const getStairDirection = () => {
    if (currentFloorRoute.length === 0) {
      return '↓';
    }

    const lastNodeId =
      currentFloorRoute[
        currentFloorRoute.length - 1
      ];

    const lastLocalIndex =
      route.indexOf(lastNodeId);

    if (
      lastLocalIndex < 0 ||
      lastLocalIndex >= route.length - 1
    ) {
      return '↓';
    }

    const nextNode = nodeMap.get(
      route[lastLocalIndex + 1]
    );

    if (!nextNode) {
      return '↓';
    }

    return nextNode.floor > currentFloor
      ? '↑'
      : '↓';
  };

  const firstNodeInSegment =
    currentFloorRoute[0];

  const lastNodeInSegment =
    currentFloorRoute[
      currentFloorRoute.length - 1
    ];

  const isFirstSegment =
    firstNodeInSegment &&
    route.indexOf(firstNodeInSegment) === 0;

  const isLastSegment =
    lastNodeInSegment &&
    route.indexOf(lastNodeInSegment) ===
      route.length - 1;

  const hasStairTransition =
    lastNodeInSegment && !isLastSegment;

  // ── Interactive map items ──────────────────────────────────────────────

  const getMapItemPalette = (type) => {
    if (type === 'facility') {
      return {
        fill: '#fef3c7',
        stroke: '#f59e0b',
        text: '#92400e',
        fontSize: 12,
      };
    }

    if (type === 'special') {
      return {
        fill: '#f3e8ff',
        stroke: '#9333ea',
        text: '#6b21a8',
        fontSize: 12,
      };
    }

    return {
      fill: '#dbeafe',
      stroke: '#3b82f6',
      text: '#1e40af',
      fontSize: 14,
    };
  };

  const renderMapItem = (item) => {
    const isHighlighted =
      highlightedRoomId === item.id;

    // Only destinations with a real graph node can be selected.
    const isInteractive = Boolean(item.nodeId);

    const palette =
      getMapItemPalette(item.type);

    const activateItem = () => {
      if (!isInteractive) {
        return;
      }

      onRoomClick?.(item);
    };

    const handleKeyDown = (event) => {
      if (
        !isInteractive ||
        (event.key !== 'Enter' &&
          event.key !== ' ')
      ) {
        return;
      }

      event.preventDefault();
      activateItem();
    };

    return (
      <g
        key={item.id}
        onClick={activateItem}
        onKeyDown={handleKeyDown}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : undefined}
        aria-label={
          isInteractive
            ? `Select ${item.label}`
            : undefined
        }
        style={{
          cursor: isInteractive
            ? 'pointer'
            : 'default',
          outline: 'none',
        }}
      >
        <title>{item.label}</title>

        {isHighlighted && (
          <rect
            x={item.x - 6}
            y={item.y - 6}
            width={item.width + 12}
            height={item.height + 12}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="5"
            rx="7"
            opacity="0.85"
            pointerEvents="none"
            style={{
              filter:
                'drop-shadow(0 0 8px rgba(245, 158, 11, 0.9))',
            }}
          >
            <animate
              attributeName="opacity"
              values="0.85;0.3;0.85"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </rect>
        )}

        <rect
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
          fill={
            isHighlighted
              ? '#fef3c7'
              : palette.fill
          }
          stroke={
            isHighlighted
              ? '#f59e0b'
              : palette.stroke
          }
          strokeWidth={isHighlighted ? 4 : 3}
          rx="4"
        />

        <text
          x={item.x + item.width / 2}
          y={item.y + item.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={palette.fontSize}
          fontWeight={
            isHighlighted ? 'bold' : 'normal'
          }
          fill={
            isHighlighted
              ? '#92400e'
              : palette.text
          }
          pointerEvents="none"
        >
          {item.label}
        </text>
      </g>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#f9fafb',
        position: 'relative',
      }}
    >
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        style={{
          width: '100%',
          height: 'auto',
          minHeight: '600px',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Outer wall */}
        <path
          d={outerWallPath}
          fill="#f3f4f6"
          stroke="#374151"
          strokeWidth="4"
        />

        {/* Corridor fills */}
        {corridorPaths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="2"
          />
        ))}

        {/* Rooms, facilities and routable special destinations */}
        {mapItems.map(renderMapItem)}

        {/* Stairs */}
        {stairs.map((stair) => (
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
              pointerEvents="none"
            >
              🪜
            </text>
          </g>
        ))}

        {/* Route overlay — current floor only */}
        {routeEdges.length > 0 && (
          <g pointerEvents="none">
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

            {/* Start marker */}
            {isFirstSegment &&
              (() => {
                const position =
                  getNodePosition(
                    firstNodeInSegment
                  );

                if (!position) {
                  return null;
                }

                return (
                  <g>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="12"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="3"
                    />

                    <text
                      x={position.x}
                      y={position.y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="white"
                    >
                      S
                    </text>
                  </g>
                );
              })()}

            {/* End marker */}
            {isLastSegment &&
              (() => {
                const position =
                  getNodePosition(
                    lastNodeInSegment
                  );

                if (!position) {
                  return null;
                }

                return (
                  <g>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="12"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="3"
                    />

                    <text
                      x={position.x}
                      y={position.y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="white"
                    >
                      E
                    </text>
                  </g>
                );
              })()}

            {/* Stair transition marker */}
            {hasStairTransition &&
              (() => {
                const position =
                  getNodePosition(
                    lastNodeInSegment
                  );

                if (!position) {
                  return null;
                }

                return (
                  <g>
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="10"
                      fill="#f59e0b"
                      stroke="white"
                      strokeWidth="3"
                    />

                    <text
                      x={position.x}
                      y={position.y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="white"
                    >
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