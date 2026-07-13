const MIN_FLOOR_TRANSITION_COST = 85;

function buildNodeMap(nodes) {
  return new Map(
    nodes.map((node) => [node.id, node])
  );
}

function getEdgeCost(edge) {
  return (
    (edge.distance ?? 1) +
    (edge.penalty ?? 0)
  );
}

/**
 * Graph data already contains the intended directed edges.
 * Duplicate from -> to edges are collapsed, preserving
 * the cheapest available cost.
 */
function buildAdjacencyList(nodes, edges) {
  const adjacencyMaps = new Map(
    nodes.map((node) => [
      node.id,
      new Map(),
    ])
  );

  for (const edge of edges) {
    const fromNeighbors =
      adjacencyMaps.get(edge.from);

    if (
      !fromNeighbors ||
      !adjacencyMaps.has(edge.to)
    ) {
      continue;
    }

    const cost = getEdgeCost(edge);

    if (
      !Number.isFinite(cost) ||
      cost < 0
    ) {
      continue;
    }

    const existingCost =
      fromNeighbors.get(edge.to);

    if (
      existingCost === undefined ||
      cost < existingCost
    ) {
      fromNeighbors.set(edge.to, cost);
    }
  }

  const adjacencyList = new Map();

  for (
    const [nodeId, neighborMap]
    of adjacencyMaps
  ) {
    adjacencyList.set(
      nodeId,
      [...neighborMap.entries()].map(
        ([id, cost]) => ({
          id,
          cost,
        })
      )
    );
  }

  return adjacencyList;
}

/**
 * Admissible and consistent heuristic:
 *
 * - Same floor: 0.
 * - Different floors: minimum stair cost per floor.
 */
function heuristic(currentNode, goalNode) {
  const floorDifference = Math.abs(
    currentNode.floor - goalNode.floor
  );

  return (
    floorDifference *
    MIN_FLOOR_TRANSITION_COST
  );
}

/**
 * Binary min-heap for the A* frontier.
 *
 * Smaller fScore has higher priority.
 * gScore is used as a tie-breaker.
 */
class MinHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(entry) {
    this.items.push(entry);
    this.bubbleUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) {
      return null;
    }

    const minimum = this.items[0];
    const last = this.items.pop();

    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return minimum;
  }

  hasHigherPriority(first, second) {
    if (first.fScore !== second.fScore) {
      return first.fScore < second.fScore;
    }

    return first.gScore < second.gScore;
  }

  bubbleUp(startIndex) {
    let index = startIndex;

    while (index > 0) {
      const parentIndex =
        Math.floor((index - 1) / 2);

      if (
        !this.hasHigherPriority(
          this.items[index],
          this.items[parentIndex]
        )
      ) {
        break;
      }

      [
        this.items[index],
        this.items[parentIndex],
      ] = [
        this.items[parentIndex],
        this.items[index],
      ];

      index = parentIndex;
    }
  }

  bubbleDown(startIndex) {
    let index = startIndex;

    while (true) {
      const leftIndex =
        index * 2 + 1;

      const rightIndex =
        index * 2 + 2;

      let smallestIndex = index;

      if (
        leftIndex < this.items.length &&
        this.hasHigherPriority(
          this.items[leftIndex],
          this.items[smallestIndex]
        )
      ) {
        smallestIndex = leftIndex;
      }

      if (
        rightIndex < this.items.length &&
        this.hasHigherPriority(
          this.items[rightIndex],
          this.items[smallestIndex]
        )
      ) {
        smallestIndex = rightIndex;
      }

      if (smallestIndex === index) {
        break;
      }

      [
        this.items[index],
        this.items[smallestIndex],
      ] = [
        this.items[smallestIndex],
        this.items[index],
      ];

      index = smallestIndex;
    }
  }
}

function reconstructPath(
  cameFrom,
  goalId
) {
  const path = [goalId];
  const visited = new Set([goalId]);

  let currentId = goalId;

  while (cameFrom.has(currentId)) {
    const previousId =
      cameFrom.get(currentId);

    if (
      !previousId ||
      visited.has(previousId)
    ) {
      return [];
    }

    visited.add(previousId);
    path.push(previousId);
    currentId = previousId;
  }

  path.reverse();

  return path;
}

export function astar(
  startId,
  goalId,
  graph
) {
  if (
    !startId ||
    !goalId ||
    !graph
  ) {
    return [];
  }

  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];

  const nodeMap =
    buildNodeMap(nodes);

  const startNode =
    nodeMap.get(startId);

  const goalNode =
    nodeMap.get(goalId);

  if (
    !startNode ||
    !goalNode
  ) {
    console.warn(
      'Start or goal node not found',
      {
        startId,
        goalId,
      }
    );

    return [];
  }

  if (startId === goalId) {
    return [startId];
  }

  const adjacencyList =
    buildAdjacencyList(nodes, edges);

  const openHeap =
    new MinHeap();

  const closedSet =
    new Set();

  const cameFrom =
    new Map();

  const gScore =
    new Map([[startId, 0]]);

  const startFScore =
    heuristic(startNode, goalNode);

  openHeap.push({
    id: startId,
    gScore: 0,
    fScore: startFScore,
  });

  while (openHeap.size > 0) {
    const current =
      openHeap.pop();

    if (!current) {
      break;
    }

    const bestKnownGScore =
      gScore.get(current.id) ??
      Infinity;

    /**
     * The heap has no decrease-key operation.
     *
     * When a better route is found, a new entry is pushed.
     * Older entries remain in the heap and are ignored here.
     */
    if (
      current.gScore !== bestKnownGScore
    ) {
      continue;
    }

    if (closedSet.has(current.id)) {
      continue;
    }

    if (current.id === goalId) {
      return reconstructPath(
        cameFrom,
        current.id
      );
    }

    closedSet.add(current.id);

    const neighbors =
      adjacencyList.get(current.id) ?? [];

    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.id)) {
        continue;
      }

      const neighborNode =
        nodeMap.get(neighbor.id);

      if (!neighborNode) {
        continue;
      }

      const tentativeGScore =
        current.gScore +
        neighbor.cost;

      const knownGScore =
        gScore.get(neighbor.id) ??
        Infinity;

      if (
        tentativeGScore >= knownGScore
      ) {
        continue;
      }

      const neighborFScore =
        tentativeGScore +
        heuristic(
          neighborNode,
          goalNode
        );

      cameFrom.set(
        neighbor.id,
        current.id
      );

      gScore.set(
        neighbor.id,
        tentativeGScore
      );

      openHeap.push({
        id: neighbor.id,
        gScore: tentativeGScore,
        fScore: neighborFScore,
      });
    }
  }

  return [];
}

export function getRouteNodes(
  routeIds,
  graph
) {
  const nodeMap = buildNodeMap(
    graph?.nodes ?? []
  );

  return routeIds
    .map((id) => nodeMap.get(id))
    .filter(Boolean);
}