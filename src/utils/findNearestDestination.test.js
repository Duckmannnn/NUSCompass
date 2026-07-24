import { describe, expect, it } from 'vitest';
import { graph, roomsData } from '../data/blockCData';
import { filterQuickDestinations } from '../data/quickDestinations';
import {
  calculateRouteCost,
  findNearestDestination,
  findNearestToilet,
} from './findNearestDestination';

function node(id) {
  return { id, floor: 1, x: 0, y: 0 };
}

describe('nearest destination routing', () => {
  it('calculates directed route cost using the cheapest duplicate edge', () => {
    const testGraph = {
      nodes: [node('A'), node('B'), node('C')],
      edges: [
        { from: 'A', to: 'B', distance: 8 },
        { from: 'A', to: 'B', distance: 3, penalty: 2 },
        { from: 'B', to: 'C', distance: 4 },
      ],
    };

    expect(calculateRouteCost(['A', 'B', 'C'], testGraph)).toBe(9);
    expect(calculateRouteCost(['C', 'B'], testGraph)).toBe(Infinity);
  });

  it('chooses the lowest route cost and ignores unreachable destinations', () => {
    const testGraph = {
      nodes: [node('S'), node('A'), node('B'), node('C'), node('X')],
      edges: [
        { from: 'S', to: 'A', distance: 2 },
        { from: 'A', to: 'B', distance: 2 },
        { from: 'S', to: 'C', distance: 8 },
      ],
    };

    const result = findNearestDestination({
      startNodeId: 'S',
      destinations: [
        { id: 'longer-route', nodeId: 'B' },
        { id: 'short-route', nodeId: 'C' },
        { id: 'unreachable', nodeId: 'X' },
      ],
      graph: testGraph,
    });

    expect(result.destination.id).toBe('longer-route');
    expect(result.cost).toBe(4);
  });

  it('filters quick destinations without matching men inside women', () => {
    expect(filterQuickDestinations('men').map((item) => item.toiletGender)).toEqual(['male']);
    expect(filterQuickDestinations('women').map((item) => item.toiletGender)).toEqual(['female']);
    expect(filterQuickDestinations('toilet')).toHaveLength(2);
    expect(filterQuickDestinations('')).toHaveLength(2);
  });

  it('uses only toilets matching the requested gender', () => {
    const testGraph = {
      nodes: [node('S'), node('M'), node('F')],
      edges: [
        { from: 'S', to: 'M', distance: 5 },
        { from: 'S', to: 'F', distance: 1 },
      ],
    };
    const rooms = [
      { id: 'START', name: 'Start', type: 'room', nodeId: 'S' },
      { id: 'MEN', name: 'Toilet', type: 'facility', toiletGender: 'male', nodeId: 'M' },
      { id: 'WOMEN', name: 'Toilet', type: 'facility', toiletGender: 'female', nodeId: 'F' },
    ];

    expect(findNearestToilet({
      startRoomId: 'START',
      toiletGender: 'male',
      rooms,
      graph: testGraph,
    }).destination.id).toBe('MEN');

    expect(findNearestToilet({
      startRoomId: 'START',
      toiletGender: 'female',
      rooms,
      graph: testGraph,
    }).destination.id).toBe('WOMEN');
  });

  it('works with the real Block C graph', () => {
    const toilets = roomsData.filter((room) => room.name === 'Toilet');
    const genderById = Object.fromEntries(
      toilets.map((room) => [room.id, room.toiletGender])
    );

    expect(genderById).toEqual({
      'F1-TOILET': 'male',
      'F2-TOILET': 'female',
      'F3-TOILET': 'female',
      'F4-TOILET': 'male',
    });
    expect(toilets.every((room) => room.nodeId)).toBe(true);

    const male = findNearestToilet({
      startRoomId: 'C316',
      toiletGender: 'male',
      rooms: roomsData,
      graph,
    });
    const female = findNearestToilet({
      startRoomId: 'C316',
      toiletGender: 'female',
      rooms: roomsData,
      graph,
    });

    expect(['F1-TOILET', 'F4-TOILET']).toContain(male.destination.id);
    expect(['F2-TOILET', 'F3-TOILET']).toContain(female.destination.id);
    expect(male.route[0]).toBe(roomsData.find((room) => room.id === 'C316').nodeId);
    expect(male.route.at(-1)).toBe(male.destination.nodeId);
    expect(female.route.at(-1)).toBe(female.destination.nodeId);
    expect(Number.isFinite(male.cost)).toBe(true);
    expect(Number.isFinite(female.cost)).toBe(true);
  });
});
