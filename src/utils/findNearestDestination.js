import { astar } from './astar';

function getEdgeCost(edge) {
  const cost = (edge.distance ?? 1) + (edge.penalty ?? 0);
  return Number.isFinite(cost) && cost >= 0 ? cost : Infinity;
}

export function calculateRouteCost(route, graph) {
  if (!Array.isArray(route) || route.length === 0) return Infinity;
  if (route.length === 1) return 0;

  let total = 0;

  for (let index = 0; index < route.length - 1; index += 1) {
    const from = route[index];
    const to = route[index + 1];
    let segmentCost = Infinity;

    for (const edge of graph?.edges ?? []) {
      if (edge.from !== from || edge.to !== to) continue;
      segmentCost = Math.min(segmentCost, getEdgeCost(edge));
    }

    if (!Number.isFinite(segmentCost)) return Infinity;
    total += segmentCost;
  }

  return total;
}

export function findNearestDestination({ startNodeId, destinations, graph }) {
  if (!startNodeId || !Array.isArray(destinations) || !graph) return null;

  let nearest = null;

  for (const destination of destinations) {
    if (!destination?.nodeId) continue;

    const route = astar(startNodeId, destination.nodeId, graph);
    const cost = calculateRouteCost(route, graph);

    if (!Number.isFinite(cost)) continue;

    const candidate = { destination, route, cost };

    if (
      !nearest ||
      candidate.cost < nearest.cost ||
      (candidate.cost === nearest.cost && candidate.route.length < nearest.route.length) ||
      (candidate.cost === nearest.cost &&
        candidate.route.length === nearest.route.length &&
        candidate.destination.id.localeCompare(nearest.destination.id) < 0)
    ) {
      nearest = candidate;
    }
  }

  return nearest;
}

export function findNearestToilet({ startRoomId, toiletGender, rooms, graph }) {
  if (!['male', 'female'].includes(toiletGender)) return null;

  const startRoom = rooms?.find((room) => room.id === startRoomId);
  if (!startRoom?.nodeId) return null;

  const toilets = rooms.filter((room) =>
    room.type === 'facility' &&
    room.name === 'Toilet' &&
    room.toiletGender === toiletGender &&
    room.nodeId
  );

  if (!Number.isFinite(startRoom.floor)) {
    return findNearestDestination({
      startNodeId: startRoom.nodeId,
      destinations: toilets,
      graph,
    });
  }

  const floorDistances = [...new Set(
    toilets
      .filter((toilet) => Number.isFinite(toilet.floor))
      .map((toilet) => Math.abs(toilet.floor - startRoom.floor))
  )].sort((first, second) => first - second);

  for (const floorDistance of floorDistances) {
    const result = findNearestDestination({
      startNodeId: startRoom.nodeId,
      destinations: toilets.filter((toilet) =>
        Number.isFinite(toilet.floor) &&
        Math.abs(toilet.floor - startRoom.floor) === floorDistance
      ),
      graph,
    });

    if (result) return result;
  }

  return findNearestDestination({
    startNodeId: startRoom.nodeId,
    destinations: toilets.filter((toilet) => !Number.isFinite(toilet.floor)),
    graph,
  });
}
