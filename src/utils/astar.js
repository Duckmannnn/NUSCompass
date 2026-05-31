function buildNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]));
}

function buildAdjacencyList(edges) {
  const adjacencyList = new Map();

  function addConnection(from, to, cost) {
    if (!adjacencyList.has(from)) {
      adjacencyList.set(from, []);
    }

    adjacencyList.get(from).push({ id: to, cost });
  }

  for (const edge of edges) {
    const cost = (edge.distance ?? 1) + (edge.penalty ?? 0);

    // Make edges bidirectional for indoor navigation.
    addConnection(edge.from, edge.to, cost);
    addConnection(edge.to, edge.from, cost);
  }

  return adjacencyList;
}

function heuristic(currentNode, goalNode) {
  const dx = currentNode.x - goalNode.x;
  const dy = currentNode.y - goalNode.y;
  const floorDifference = Math.abs(currentNode.floor - goalNode.floor);

  return Math.sqrt(dx * dx + dy * dy) + floorDifference * 120;
}

function getLowestScoreNode(openSet, fScore) {
  let bestNodeId = null;
  let bestScore = Infinity;

  for (const nodeId of openSet) {
    const score = fScore.get(nodeId) ?? Infinity;

    if (score < bestScore) {
      bestScore = score;
      bestNodeId = nodeId;
    }
  }

  return bestNodeId;
}

function reconstructPath(cameFrom, currentId) {
  const path = [currentId];

  while (cameFrom.has(currentId)) {
    currentId = cameFrom.get(currentId);
    path.unshift(currentId);
  }

  return path;
}

export function astar(startId, goalId, graph) {
  if (!startId || !goalId || !graph) {
    return [];
  }

  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];

  const nodeMap = buildNodeMap(nodes);
  const adjacencyList = buildAdjacencyList(edges);

  const startNode = nodeMap.get(startId);
  const goalNode = nodeMap.get(goalId);

  if (!startNode || !goalNode) {
    console.warn("Start or goal node not found", { startId, goalId });
    return [];
  }

  if (startId === goalId) {
    return [startId];
  }

  const openSet = new Set([startId]);
  const cameFrom = new Map();

  const gScore = new Map();
  const fScore = new Map();

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startNode, goalNode));

  while (openSet.size > 0) {
    const currentId = getLowestScoreNode(openSet, fScore);

    if (currentId === goalId) {
      return reconstructPath(cameFrom, currentId);
    }

    openSet.delete(currentId);

    const neighbors = adjacencyList.get(currentId) ?? [];

    for (const neighbor of neighbors) {
      const tentativeGScore = (gScore.get(currentId) ?? Infinity) + neighbor.cost;

      if (tentativeGScore < (gScore.get(neighbor.id) ?? Infinity)) {
        cameFrom.set(neighbor.id, currentId);
        gScore.set(neighbor.id, tentativeGScore);

        const neighborNode = nodeMap.get(neighbor.id);

        if (!neighborNode) {
          continue;
        }

        fScore.set(
          neighbor.id,
          tentativeGScore + heuristic(neighborNode, goalNode)
        );

        openSet.add(neighbor.id);
      }
    }
  }

  return [];
}

export function getRouteNodes(routeIds, graph) {
  const nodeMap = buildNodeMap(graph.nodes ?? []);

  return routeIds.map((id) => nodeMap.get(id)).filter(Boolean);
}