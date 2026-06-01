import { useMemo, useState } from 'react';

function getNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]));
}

function getEdgeKey(from, to) {
  return `${from}__${to}`;
}

function getEdgeMap(edges) {
  const edgeMap = new Map();

  edges.forEach((edge) => {
    edgeMap.set(getEdgeKey(edge.from, edge.to), edge);
  });

  return edgeMap;
}

function pointsToString(points) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function getRouteSegments(route, graph, currentFloor) {
  const nodeMap = getNodeMap(graph.nodes ?? []);
  const edgeMap = getEdgeMap(graph.edges ?? []);

  const segments = [];

  for (let i = 0; i < route.length - 1; i += 1) {
    const fromId = route[i];
    const toId = route[i + 1];

    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);

    if (!fromNode || !toNode) {
      continue;
    }

    const sameFloor =
      String(fromNode.floor) === String(currentFloor) &&
      String(toNode.floor) === String(currentFloor);

    if (!sameFloor) {
      continue;
    }

    const edge = edgeMap.get(getEdgeKey(fromId, toId));

    const path = edge?.path ?? [
      { x: fromNode.x, y: fromNode.y },
      { x: toNode.x, y: toNode.y },
    ];

    segments.push({
      fromId,
      toId,
      path,
      edge,
    });
  }

  return segments;
}

function flattenSegmentPoints(segments) {
  const points = [];

  segments.forEach((segment, segmentIndex) => {
    segment.path.forEach((point, pointIndex) => {
      const shouldSkipFirstPoint = segmentIndex > 0 && pointIndex === 0;

      if (!shouldSkipFirstPoint) {
        points.push(point);
      }
    });
  });

  return points;
}

function getRouteNodesOnFloor(route, graph, currentFloor) {
  const nodeMap = getNodeMap(graph.nodes ?? []);

  return route
    .map((nodeId) => nodeMap.get(nodeId))
    .filter((node) => node && String(node.floor) === String(currentFloor));
}

function getDestinationNode(selectedNodeId, graph) {
  if (!selectedNodeId) {
    return null;
  }

  return (graph.nodes ?? []).find((node) => node.id === selectedNodeId) ?? null;
}

function getStartNodeForFloor(routeNodesOnFloor) {
  return routeNodesOnFloor[0] ?? null;
}

function getStairNodesOnFloor(routeNodesOnFloor) {
  return routeNodesOnFloor.filter((node) => node.type === 'stair');
}

function getRoomClassName(room, selectedNodeId) {
  const isTargetRoom = room.nodeId === selectedNodeId;

  return isTargetRoom ? 'map-room target-room' : 'map-room';
}

function DoorTick({ point, side }) {
  const length = 13;

  if (side === 'top') {
    return (
      <line
        className="door-tick"
        x1={point.x}
        y1={point.y}
        x2={point.x}
        y2={point.y + length}
      />
    );
  }

  if (side === 'bottom') {
    return (
      <line
        className="door-tick"
        x1={point.x}
        y1={point.y}
        x2={point.x}
        y2={point.y - length}
      />
    );
  }

  if (side === 'left') {
    return (
      <line
        className="door-tick"
        x1={point.x}
        y1={point.y}
        x2={point.x + length}
        y2={point.y}
      />
    );
  }

  return (
    <line
      className="door-tick"
      x1={point.x}
      y1={point.y}
      x2={point.x - length}
      y2={point.y}
    />
  );
}

function StairShape({ stair }) {
  const stepCount = 4;
  const padding = 9;
  const stepGap = stair.height / (stepCount + 1);

  return (
    <g>
      <rect
        className="map-stair-box"
        x={stair.x}
        y={stair.y}
        width={stair.width}
        height={stair.height}
        rx="7"
      />

      {Array.from({ length: stepCount }).map((_, index) => {
        const y = stair.y + padding + index * stepGap;

        return (
          <line
            key={`${stair.id}-step-${index}`}
            className="map-stair-step"
            x1={stair.x + padding}
            y1={y}
            x2={stair.x + stair.width - padding}
            y2={y}
          />
        );
      })}
    </g>
  );
}

function Marker({ node, type, label }) {
  if (!node) {
    return null;
  }

  return (
    <g>
      <circle className={`map-marker ${type}`} cx={node.x} cy={node.y} r="16" />
      <text className="map-marker-label" x={node.x + 22} y={node.y - 8}>
        {label}
      </text>
    </g>
  );
}

export default function FloorMap({
  graph,
  route,
  currentFloor,
  selectedNodeId,
  selectedRoom,
  blockCLayout,
}) {
  const [showDebug, setShowDebug] = useState(false);

  const layout = blockCLayout?.[currentFloor];

  const routeSegments = useMemo(
    () => getRouteSegments(route, graph, currentFloor),
    [route, graph, currentFloor]
  );

  const routePoints = useMemo(
    () => flattenSegmentPoints(routeSegments),
    [routeSegments]
  );

  const routeNodesOnFloor = useMemo(
    () => getRouteNodesOnFloor(route, graph, currentFloor),
    [route, graph, currentFloor]
  );

  const startNode = getStartNodeForFloor(routeNodesOnFloor);
  const destinationNode = getDestinationNode(selectedNodeId, graph);
  const destinationIsOnCurrentFloor =
    destinationNode && String(destinationNode.floor) === String(currentFloor);

  const stairNodes = getStairNodesOnFloor(routeNodesOnFloor);

  if (!layout) {
    return (
      <div className="map-card">
        <div className="map-toolbar">
          <div>
            <p className="section-kicker">Map</p>
            <h2>Floor {currentFloor}</h2>
          </div>
        </div>

        <div className="map-empty">No layout data for this floor.</div>
      </div>
    );
  }

  return (
    <div className="map-card">
      <div className="map-toolbar">
        <div>
          <p className="section-kicker">Map</p>
          <h2>Floor {currentFloor} · Eusoff Block C</h2>
          <p>
            Redrawn indoor map. Route uses door nodes, corridor spines, and
            edge paths.
          </p>
        </div>

        <button
          type="button"
          className={showDebug ? 'debug-toggle active' : 'debug-toggle'}
          onClick={() => setShowDebug((value) => !value)}
        >
          {showDebug ? 'Hide graph' : 'Debug graph'}
        </button>
      </div>

      <div className="map-stage">
        <svg
          className="floor-map"
          viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
          role="img"
          aria-label={`Eusoff Block C floor ${currentFloor} map`}
        >
          <defs>
            <marker
              id="route-arrow"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path className="route-arrow" d="M 0 0 L 12 6 L 0 12 z" />
            </marker>
          </defs>

          <rect className="map-paper" width="1280" height="720" />

          <g className="corridor-layer">
            {layout.corridorPaths.map((path, index) => (
              <path key={`corridor-${index}`} className="map-corridor" d={path} />
            ))}
          </g>

          <path className="map-wall" d={layout.outerWallPath} />

          <g className="room-layer">
            {layout.rooms.map((room) => (
              <g key={room.id}>
                <rect
                  className={getRoomClassName(room, selectedNodeId)}
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                />

                <DoorTick point={room.door} side={room.doorSide} />

                <text
                  className="room-label"
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2}
                >
                  {room.label}
                </text>
              </g>
            ))}
          </g>

          <g className="facility-layer">
            {layout.facilities.map((facility) => (
              <g key={facility.id}>
                <rect
                  className="map-facility"
                  x={facility.x}
                  y={facility.y}
                  width={facility.width}
                  height={facility.height}
                  rx="7"
                />

                {facility.door && (
                  <DoorTick point={facility.door} side={facility.doorSide} />
                )}

                <text
                  className="facility-label"
                  x={facility.x + facility.width / 2}
                  y={facility.y + facility.height / 2}
                >
                  {facility.label}
                </text>
              </g>
            ))}
          </g>

          <g className="stair-layer">
            {layout.stairs.map((stair) => (
              <g key={stair.id}>
                <StairShape stair={stair} />
                <text
                  className="stair-label"
                  x={stair.x + stair.width / 2}
                  y={stair.y + stair.height + 18}
                >
                  Stair
                </text>
              </g>
            ))}
          </g>

          {showDebug && (
            <g className="debug-layer">
              {graph.edges
                .filter((edge) => {
                  const nodeMap = getNodeMap(graph.nodes ?? []);
                  const fromNode = nodeMap.get(edge.from);
                  const toNode = nodeMap.get(edge.to);

                  return (
                    fromNode &&
                    toNode &&
                    String(fromNode.floor) === String(currentFloor) &&
                    String(toNode.floor) === String(currentFloor)
                  );
                })
                .map((edge) => {
                  const nodeMap = getNodeMap(graph.nodes ?? []);
                  const fromNode = nodeMap.get(edge.from);
                  const toNode = nodeMap.get(edge.to);

                  const path = edge.path ?? [
                    { x: fromNode.x, y: fromNode.y },
                    { x: toNode.x, y: toNode.y },
                  ];

                  return (
                    <polyline
                      key={`debug-edge-${edge.from}-${edge.to}`}
                      className="debug-edge"
                      points={pointsToString(path)}
                    />
                  );
                })}

              {(graph.nodes ?? [])
                .filter((node) => String(node.floor) === String(currentFloor))
                .map((node) => (
                  <g key={`debug-node-${node.id}`}>
                    <circle
                      className={`debug-node ${node.type}`}
                      cx={node.x}
                      cy={node.y}
                      r={node.type === 'door' ? 5 : 6}
                    />
                    {(node.type === 'door' ||
                      node.type === 'stair' ||
                      node.type === 'junction') && (
                      <text className="debug-node-label" x={node.x + 8} y={node.y - 8}>
                        {node.label}
                      </text>
                    )}
                  </g>
                ))}
            </g>
          )}

          {routePoints.length > 1 && (
            <g className="route-layer">
              <polyline
                className="route-halo"
                points={pointsToString(routePoints)}
              />
              <polyline
                className="route-line"
                markerEnd="url(#route-arrow)"
                points={pointsToString(routePoints)}
              />

              {routePoints.slice(1, -1).map((point, index) => (
                <circle
                  key={`route-joint-${index}`}
                  className="route-joint"
                  cx={point.x}
                  cy={point.y}
                  r="7"
                />
              ))}
            </g>
          )}

          <Marker node={startNode} type="start" label="Start" />

          {stairNodes.map((node) => (
            <Marker key={`stair-marker-${node.id}`} node={node} type="stair" label="Stair" />
          ))}

          {destinationIsOnCurrentFloor && (
            <Marker
              node={destinationNode}
              type="destination"
              label={selectedRoom?.id ?? selectedRoom?.name ?? 'Destination'}
            />
          )}
        </svg>

        <div className="map-legend">
          <span>
            <i className="legend-dot route" /> Route
          </span>
          <span>
            <i className="legend-dot start" /> Start
          </span>
          <span>
            <i className="legend-dot stair" /> Stair
          </span>
          <span>
            <i className="legend-dot destination" /> Destination
          </span>
        </div>

        <div className="map-floor-mini">
          {[1, 2, 3, 4].map((floor) => (
            <span
              key={floor}
              className={String(floor) === String(currentFloor) ? 'active' : ''}
            >
              F{floor}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}