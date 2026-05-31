function getNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]));
}

function getViewBox(nodes) {
  if (!nodes || nodes.length === 0) {
    return '0 0 800 600';
  }

  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);

  const minX = Math.min(...xs) - 80;
  const minY = Math.min(...ys) - 80;
  const maxX = Math.max(...xs) + 80;
  const maxY = Math.max(...ys) + 80;

  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
}

export default function FloorMap({
  graph,
  route,
  currentFloor,
  selectedNodeId,
}) {
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];

  const nodeMap = getNodeMap(nodes);

  const floorNodes = nodes.filter(
    (node) => String(node.floor) === String(currentFloor)
  );

  const floorNodeIds = new Set(floorNodes.map((node) => node.id));

  const floorEdges = edges.filter(
    (edge) => floorNodeIds.has(edge.from) && floorNodeIds.has(edge.to)
  );

  const routeSet = new Set(route);

  const routeSegments = [];

  for (let i = 0; i < route.length - 1; i += 1) {
    const fromNode = nodeMap.get(route[i]);
    const toNode = nodeMap.get(route[i + 1]);

    if (!fromNode || !toNode) {
      continue;
    }

    const bothOnCurrentFloor =
      String(fromNode.floor) === String(currentFloor) &&
      String(toNode.floor) === String(currentFloor);

    if (bothOnCurrentFloor) {
      routeSegments.push({
        from: fromNode,
        to: toNode,
      });
    }
  }

  return (
    <div className="map-card">
      <div className="map-header">
        <div>
          <p className="section-label">Map preview</p>
          <h2>Floor {currentFloor}</h2>
        </div>

        <p className="map-meta">
          {floorNodes.length} nodes · {floorEdges.length} edges
        </p>
      </div>

      <svg className="floor-map" viewBox={getViewBox(floorNodes)}>
        {floorEdges.map((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);

          if (!fromNode || !toNode) {
            return null;
          }

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              className="map-edge"
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
            />
          );
        })}

        {routeSegments.map((segment) => (
          <line
            key={`route-${segment.from.id}-${segment.to.id}`}
            className="route-edge"
            x1={segment.from.x}
            y1={segment.from.y}
            x2={segment.to.x}
            y2={segment.to.y}
          />
        ))}

        {floorNodes.map((node) => {
          const isRouteNode = routeSet.has(node.id);
          const isSelectedNode = node.id === selectedNodeId;

          return (
            <g key={node.id}>
              <circle
                className={[
                  'map-node',
                  isRouteNode ? 'route-node' : '',
                  isSelectedNode ? 'selected-node' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                cx={node.x}
                cy={node.y}
                r={isSelectedNode ? 10 : isRouteNode ? 7 : 4}
              />

              {(isSelectedNode || isRouteNode) && (
                <text className="map-label" x={node.x + 10} y={node.y - 10}>
                  {node.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}