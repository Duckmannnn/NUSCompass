import { describe, expect, it } from 'vitest';
import { graph, roomsData } from '../data/blockCData.js';
import { astar } from './astar.js';

const RANDOM_SEED = 20260713;
const RANDOM_CASE_COUNT = 100;
const RANDOM_ORIGIN_COUNT = 5;

function getEdgeCost(edge) {
  return (edge.distance ?? 1) + (edge.penalty ?? 0);
}

function addConnection(adjacencyList, from, to, cost) {
  if (!adjacencyList.has(from)) {
    adjacencyList.set(from, []);
  }

  adjacencyList.get(from).push({
    id: to,
    cost,
  });
}

function buildAdjacencyList(graphData) {
  const adjacencyList = new Map();

  for (const node of graphData.nodes) {
    adjacencyList.set(node.id, []);
  }

  for (const edge of graphData.edges) {
    const cost = getEdgeCost(edge);

    // Match production A*: treat edges as bidirectional.
    addConnection(adjacencyList, edge.from, edge.to, cost);
    addConnection(adjacencyList, edge.to, edge.from, cost);
  }

  return adjacencyList;
}

/**
 * Simple O(V² + E) Dijkstra reference implementation.
 * It is intentionally not optimized because it is used as a
 * correctness oracle, not production routing code.
 */
class TestMinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }

  push(id, priority) {
    this.heap.push({
      id,
      priority,
    });

    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) {
      return null;
    }

    const minimum = this.heap[0];
    const last = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return minimum;
  }

  bubbleUp(index) {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex =
        Math.floor((currentIndex - 1) / 2);

      if (
        this.heap[parentIndex].priority <=
        this.heap[currentIndex].priority
      ) {
        break;
      }

      [
        this.heap[parentIndex],
        this.heap[currentIndex],
      ] = [
        this.heap[currentIndex],
        this.heap[parentIndex],
      ];

      currentIndex = parentIndex;
    }
  }

  bubbleDown(index) {
    let currentIndex = index;

    while (true) {
      const leftIndex =
        currentIndex * 2 + 1;

      const rightIndex =
        currentIndex * 2 + 2;

      let smallestIndex = currentIndex;

      if (
        leftIndex < this.heap.length &&
        this.heap[leftIndex].priority <
          this.heap[smallestIndex].priority
      ) {
        smallestIndex = leftIndex;
      }

      if (
        rightIndex < this.heap.length &&
        this.heap[rightIndex].priority <
          this.heap[smallestIndex].priority
      ) {
        smallestIndex = rightIndex;
      }

      if (smallestIndex === currentIndex) {
        break;
      }

      [
        this.heap[currentIndex],
        this.heap[smallestIndex],
      ] = [
        this.heap[smallestIndex],
        this.heap[currentIndex],
      ];

      currentIndex = smallestIndex;
    }
  }
}

/**
 * Dijkstra reference implementation.
 *
 * It does not use a heuristic, so it remains an independent
 * correctness oracle for A*. The priority queue only improves speed.
 */
function dijkstraAllDistances(
  startId,
  adjacencyList
) {
  const distances = new Map();

  for (const nodeId of adjacencyList.keys()) {
    distances.set(nodeId, Infinity);
  }

  if (!distances.has(startId)) {
    return distances;
  }

  const queue = new TestMinPriorityQueue();

  distances.set(startId, 0);
  queue.push(startId, 0);

  while (queue.size > 0) {
    const current = queue.pop();

    const knownDistance =
      distances.get(current.id);

    // Ignore stale queue entries.
    if (current.priority !== knownDistance) {
      continue;
    }

    for (
      const neighbor of
      adjacencyList.get(current.id) ?? []
    ) {
      const candidateDistance =
        current.priority + neighbor.cost;

      const neighborDistance =
        distances.get(neighbor.id) ?? Infinity;

      if (
        candidateDistance < neighborDistance
      ) {
        distances.set(
          neighbor.id,
          candidateDistance
        );

        queue.push(
          neighbor.id,
          candidateDistance
        );
      }
    }
  }

  return distances;
}

function makeUndirectedEdgeKey(from, to) {
  return from < to
    ? `${from}\0${to}`
    : `${to}\0${from}`;
}

function buildEdgeCostMap(graphData) {
  const edgeCostMap = new Map();

  for (const edge of graphData.edges) {
    const key = makeUndirectedEdgeKey(
      edge.from,
      edge.to
    );

    const cost = getEdgeCost(edge);

    const currentCost =
      edgeCostMap.get(key) ?? Infinity;

    edgeCostMap.set(
      key,
      Math.min(currentCost, cost)
    );
  }

  return edgeCostMap;
}

function calculateRouteCost(route, edgeCostMap) {
  if (route.length === 0) {
    return Infinity;
  }

  let totalCost = 0;

  for (
    let index = 0;
    index < route.length - 1;
    index += 1
  ) {
    const from = route[index];
    const to = route[index + 1];

    const key = makeUndirectedEdgeKey(from, to);
    const cost = edgeCostMap.get(key);

    if (cost === undefined) {
      throw new Error(
        `Invalid route: no edge connects "${from}" and "${to}"`
      );
    }

    totalCost += cost;
  }

  return totalCost;
}

function createSeededRandom(seed) {
  let state = seed >>> 0;

  return function nextRandom() {
    state =
      (1664525 * state + 1013904223) >>> 0;

    return state / 2 ** 32;
  };
}

function sampleUniqueItems(items, count, random) {
  const shuffled = [...items];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      random() * (index + 1)
    );

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(
    0,
    Math.min(count, shuffled.length)
  );
}

function createRandomRouteCases(
  destinations,
  caseCount,
  originCount,
  seed
) {
  if (destinations.length < 2) {
    throw new Error(
      'At least two routable destinations are required'
    );
  }

  const random = createSeededRandom(seed);

  const origins = sampleUniqueItems(
    destinations,
    originCount,
    random
  );

  const cases = [];

  for (
    let index = 0;
    index < caseCount;
    index += 1
  ) {
    const start =
      origins[index % origins.length];

    let goal =
      destinations[
        Math.floor(random() * destinations.length)
      ];

    while (goal.nodeId === start.nodeId) {
      goal =
        destinations[
          Math.floor(
            random() * destinations.length
          )
        ];
    }

    cases.push({
      startId: start.id,
      goalId: goal.id,
      startNodeId: start.nodeId,
      goalNodeId: goal.nodeId,
    });
  }

  return cases;
}

const graphNodeIds = new Set(
  graph.nodes.map((node) => node.id)
);

const routableDestinations = roomsData.filter(
  (destination) => destination.nodeId
);

const adjacencyList =
  buildAdjacencyList(graph);

const edgeCostMap =
  buildEdgeCostMap(graph);

const randomizedRouteCases =
  createRandomRouteCases(
    routableDestinations,
    RANDOM_CASE_COUNT,
    RANDOM_ORIGIN_COUNT,
    RANDOM_SEED
  );

describe('astar', () => {
  it('returns the start node when start and goal are the same', () => {
    const testGraph = {
      nodes: [
        {
          id: 'A',
          x: 0,
          y: 0,
          floor: 1,
        },
      ],
      edges: [],
    };

    expect(
      astar('A', 'A', testGraph)
    ).toEqual(['A']);
  });

  it('provides a graph node for every routable destination', () => {
    const missingDestinations =
      routableDestinations.filter(
        (destination) =>
          !graphNodeIds.has(
            destination.nodeId
          )
      );

    expect(
      missingDestinations.map(
        (destination) => ({
          id: destination.id,
          nodeId: destination.nodeId,
        })
      )
    ).toEqual([]);
  });

  it('routes from RF Flat to another destination', () => {
    const rfFlat = roomsData.find(
      (destination) =>
        destination.id === 'RF-FLAT'
    );

    const destination = roomsData.find(
      (candidate) =>
        candidate.id === 'C424'
    );

    expect(rfFlat).toBeDefined();
    expect(destination).toBeDefined();

    expect(
      graphNodeIds.has(rfFlat.nodeId)
    ).toBe(true);

    const route = astar(
      rfFlat.nodeId,
      destination.nodeId,
      graph
    );

    expect(route.length).toBeGreaterThan(0);
    expect(route[0]).toBe(rfFlat.nodeId);

    expect(
      route.at(-1)
    ).toBe(destination.nodeId);

    expect(
      calculateRouteCost(
        route,
        edgeCostMap
      )
    ).toBeLessThan(Infinity);
  });

    it('contains only finite graph coordinates and edge costs', () => {
    const invalidNodes = graph.nodes.filter(
        (node) =>
        !Number.isFinite(node.x) ||
        !Number.isFinite(node.y) ||
        !Number.isFinite(node.floor)
    );

    const invalidEdges = graph.edges.filter(
        (edge) =>
        !Number.isFinite(getEdgeCost(edge))
    );

    expect(
        invalidNodes.map((node) => ({
        id: node.id,
        x: node.x,
        y: node.y,
        floor: node.floor,
        }))
    ).toEqual([]);

    expect(
        invalidEdges.map((edge) => ({
        from: edge.from,
        to: edge.to,
        distance: edge.distance,
        penalty: edge.penalty,
        }))
    ).toEqual([]);
    });
    it('routes from the floor 3 toilet to C316', () => {
  const start = roomsData.find(
    (item) => item.id === 'F3-TOILET'
  );

  const goal = roomsData.find(
    (item) => item.id === 'C316'
  );

  expect(start).toBeDefined();
  expect(goal).toBeDefined();

  const route = astar(
    start.nodeId,
    goal.nodeId,
    graph
  );

  expect(route.length).toBeGreaterThan(0);
  expect(route[0]).toBe(start.nodeId);
  expect(route.at(-1)).toBe(goal.nodeId);
});
  it('matches Dijkstra for 100 seeded random destination pairs', () => {
    expect(
      randomizedRouteCases
    ).toHaveLength(RANDOM_CASE_COUNT);

    const distancesByStart = new Map();

    for (
      const routeCase of randomizedRouteCases
    ) {
      const {
        startId,
        goalId,
        startNodeId,
        goalNodeId,
      } = routeCase;

      if (
        !distancesByStart.has(startNodeId)
      ) {
        distancesByStart.set(
          startNodeId,
          dijkstraAllDistances(
            startNodeId,
            adjacencyList
          )
        );
      }

      const dijkstraCost =
        distancesByStart
          .get(startNodeId)
          .get(goalNodeId) ?? Infinity;

      const route = astar(
        startNodeId,
        goalNodeId,
        graph
      );

      expect(
        dijkstraCost,
        `Dijkstra could not connect ${startId} to ${goalId}`
      ).toBeLessThan(Infinity);

      expect(
        route.length,
        `A* returned no route for ${startId} -> ${goalId}`
      ).toBeGreaterThan(0);

      expect(route[0]).toBe(startNodeId);

      expect(
        route.at(-1)
      ).toBe(goalNodeId);

      const astarCost =
        calculateRouteCost(
          route,
          edgeCostMap
        );

      expect(
        astarCost,
        `A* was not optimal for ${startId} -> ${goalId}`
      ).toBeCloseTo(dijkstraCost, 6);
    }
  });
});
