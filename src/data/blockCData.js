// =============================================================================
// NUSCompass — Eusoff Block C map & graph data
// =============================================================================
// Architecture:
//   Visual layer  → SVG geometry (rooms, corridors, stairs, facilities)
//   Graph layer   → Routing nodes + weighted edges for A*
//
// Per-room model:
//   DOOR node      – at the doorway
//   CORRIDOR node  – on the corridor directly in front of the door
//   DOOR ↔ CORRIDOR edge (type: door-access)
//
// Corridor topology:
//   Temasek wing  – vertical chain, sorted by y
//   Lower wing    – horizontal chain, sorted by x
//   JUNCTION node – intersection of both chains
//   Stairs        – four nodes per floor, connected to nearest corridor node
// =============================================================================

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEWBOX = { width: 1280, height: 882 };

const CORE = {
  lowerY: 686,
  temasekX: 838,
  temasekMidY: 392,
  temasekTopY: 100,
  lowerLeftX: 520,
  lowerRightX: 987,
  entranceY: 760,
};

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function getDoorPoint(x, y, width, height, side) {
  if (side === 'top')    return { x: x + width / 2, y };
  if (side === 'bottom') return { x: x + width / 2, y: y + height };
  if (side === 'left')   return { x, y: y + height / 2 };
  return { x: x + width, y: y + height / 2 };
}

function block({ id, label = id, floor, type, x, y, width, height, doorSide, zone }) {
  return {
    id, label, floor, type, x, y, width, height, doorSide, zone,
    door: doorSide ? getDoorPoint(x, y, width, height, doorSide) : null,
    nodeId: doorSide ? `F${floor}-${id}-DOOR` : null,
  };
}

function room(id, floor, x, y, width, height, doorSide, zone) {
  return block({ id, floor, type: 'room', x, y, width, height, doorSide, zone });
}

function facility(id, label, floor, x, y, width, height, doorSide, zone) {
  return block({ id, label, floor, type: 'facility', x, y, width, height, doorSide, zone });
}

function special(id, label, floor, x, y, width, height, doorSide = null, zone = null) {
  return block({ id, label, floor, type: 'special', x, y, width, height, doorSide, zone });
}

function stair(id, label, floor, x, y, width, height, orientation, node) {
  return { id, label, floor, x, y, width, height, orientation, node };
}

// ---------------------------------------------------------------------------
// Layout generators — rooms
// ---------------------------------------------------------------------------

function makeBottomLeftRooms(floor, prefix) {
  return [
    [1, 353, 724, 59, 100],
    [3, 412, 724, 59, 100],
    [5, 471, 724, 60, 100],
    [7, 531, 724, 60, 100],
    [9, 591, 724, 58, 100],
  ].map(([suffix, x, y, w, h]) =>
    room(`${prefix}${String(suffix).padStart(2, '0')}`, floor, x, y, w, h, 'top', 'lower')
  );
}

function makeBottomRightRooms(floor, prefix) {
  return [
    room(`${prefix}10`, floor, 649, 704, 110, 164, 'top', 'lower'),
    room(`${prefix}11`, floor, 759, 704, 110, 164, 'top', 'lower'),
    room(`${prefix}12`, floor, 869, 704, 107, 164, 'top', 'lower'),
    room(`${prefix}13`, floor, 976, 704, 107, 164, 'top', 'lower'),
  ];
}

function makeMiddleRooms(floor, prefix) {
  return [
    [2, 353, 535, 60, 103],
    [4, 413, 535, 60, 103],
    [6, 473, 535, 60, 103],
    [8, 533, 535, 71, 103],
  ].map(([suffix, x, y, w, h]) =>
    room(`${prefix}${String(suffix).padStart(2, '0')}`, floor, x, y, w, h, 'bottom', 'mid')
  );
}

function makeTopLeftStack(floor, ids) {
  const yValues = [125, 185, 245, 305, 363];
  return ids.map((id, i) =>
    room(id, floor, 704, yValues[i], 91, i < 3 ? 60 : 58, 'right', 'temasek-left')
  );
}

function makeTopRightStack(floor, ids) {
  const isSixStack = ids.length === 6;
  const yValues = isSixStack ? [95, 145, 195, 245, 295, 345] : [245, 304, 363];
  const heights = isSixStack ? [50, 50, 50, 50, 50, 50] : [59, 59, 58];
  return ids.map((id, i) =>
    room(id, floor, 879, yValues[i], 88, heights[i], 'left', 'temasek-right')
  );
}

// ---------------------------------------------------------------------------
// Shared geometry — walls, corridors, stairs
// ---------------------------------------------------------------------------

const BASE_CORRIDOR_PATHS = [
  'M150 555 H353 V535 H604 V637 H663 V620 H692 V705 H353 V724 H150 Z',
  'M692 637 H879 V705 H1030 V735 H692 Z',
  'M795 52 H879 V637 H795 Z',
  'M663 520 L735 420 H795 V637 H692 Z',
];

const BASE_OUTER_WALL_PATH =
  'M150 475 V565 H200 V555 H337 V535 H353 V535 H604 V637 H663 V620 H692 V520 L735 475 H795 V421 H704 V120 H795 V52 H879 V38 H1020 V22 H1110 V38 H1110 V220 H1020 V220 H1020 V245 H967 V476 H1024 V637 H1037 V679 H1083 V735 H1083 V868 H635 V852 H352 V824 H255 V800 H200 V790 H255';

function makeCommonStairs(floor) {
  return [
    stair(`F${floor}-STAIR-TOP-LEFT`, 'Top Left Stair',  floor, 704, 52,  91, 58, 'vertical',   { x: 750,            y: 82           }),
    stair(`F${floor}-STAIR-TOP`,      'Temasek Stair',   floor, 795, 25,  77, 28, 'horizontal',  { x: CORE.temasekX,  y: 52           }),
    stair(`F${floor}-STAIR-LEFT`,     'Left Stair',      floor, 252, 655, 72, 56, 'vertical',   { x: 288,            y: CORE.lowerY  }),
    stair(`F${floor}-STAIR-RIGHT`,    'Right Stair',     floor, 949, 656, 76, 61, 'vertical',   { x: CORE.lowerRightX, y: CORE.lowerY }),
  ];
}

// ---------------------------------------------------------------------------
// Floor layout generators
// ---------------------------------------------------------------------------

function makeFloor1Layout() {
  return {
    floor: 1,
    viewBox: VIEWBOX,
    corridorPaths: BASE_CORRIDOR_PATHS,
    outerWallPath: BASE_OUTER_WALL_PATH,
    rooms: [
      ...makeBottomLeftRooms(1, 'C1'),
      room('C110', 1, 649, 704, 72, 148, 'top', 'lower'),
      room('C111', 1, 721, 704, 72, 148, 'top', 'lower'),
      ...makeMiddleRooms(1, 'C1'),
      ...makeTopLeftStack(1, ['C119', 'C118', 'C117', 'C115', 'C113']),
      ...makeTopRightStack(1, ['C116', 'C114', 'C112']),
    ],
    facilities: [
      facility('F1-EW',      'EW Room',     1, 879, 421, 88,  55,  'left', 'temasek-right'),
      facility('F1-TOILET',  'Toilet',      1, 879, 476, 145, 161, 'left', 'temasek-right'),
      facility('F1-LAUNDRY', 'Laundry',     1, 793, 735, 131, 133, 'top',  'lower'),
      facility('F1-DRYING',  'Drying Yard', 1, 924, 735, 159, 133, 'top',  'lower'),
    ],
    specials: [special('F1-RF', 'RF Flat', 1, 879, 38, 231, 182, 'left', 'temasek-right')],
    stairs: makeCommonStairs(1),
  };
}

function makeFloor2Layout() {
  return {
    floor: 2,
    viewBox: VIEWBOX,
    corridorPaths: BASE_CORRIDOR_PATHS,
    outerWallPath: BASE_OUTER_WALL_PATH,
    rooms: [
      ...makeBottomLeftRooms(2, 'C2'),
      ...makeBottomRightRooms(2, 'C2'),
      ...makeMiddleRooms(2, 'C2'),
      ...makeTopLeftStack(2, ['C221', 'C220', 'C219', 'C217', 'C215']),
      ...makeTopRightStack(2, ['C218', 'C216', 'C214']),
    ],
    facilities: [
      facility('F2-KITCHEN', 'Kitchen', 2, 704, 421, 91,  104, 'right', 'connector-left'),
      facility('F2-TOILET',  'Toilet',  2, 879, 421, 145, 161, 'left',  'temasek-right'),
    ],
    specials: [special('F2-ROOF', 'Roof', 2, 879, 38, 231, 182)],
    stairs: makeCommonStairs(2),
  };
}

function makeFloor3Layout() {
  return {
    floor: 3,
    viewBox: VIEWBOX,
    corridorPaths: BASE_CORRIDOR_PATHS,
    outerWallPath: BASE_OUTER_WALL_PATH,
    rooms: [
      ...makeBottomLeftRooms(3, 'C3'),
      ...makeBottomRightRooms(3, 'C3'),
      ...makeMiddleRooms(3, 'C3'),
      ...makeTopLeftStack(3, ['C323', 'C321', 'C319', 'C317', 'C315']),
      ...makeTopRightStack(3, ['C322', 'C320', 'C318', 'C316', 'C314']),
    ],
    facilities: [
      facility('F3-LOUNGE', 'Lounge', 3, 704, 421, 91,  104, 'right', 'connector-left'),
      facility('F3-TOILET', 'Toilet', 3, 879, 421, 145, 161, 'left',  'temasek-right'),
    ],
    specials: [],
    stairs: makeCommonStairs(3),
  };
}

function makeFloor4Layout() {
  return {
    floor: 4,
    viewBox: VIEWBOX,
    corridorPaths: BASE_CORRIDOR_PATHS,
    outerWallPath: BASE_OUTER_WALL_PATH,
    rooms: [
      ...makeBottomLeftRooms(4, 'C4'),
      ...makeBottomRightRooms(4, 'C4'),
      ...makeMiddleRooms(4, 'C4'),
      ...makeTopLeftStack(4, ['C423', 'C421', 'C419', 'C417', 'C415']),
      ...makeTopRightStack(4, ['C424', 'C422', 'C420', 'C418', 'C416', 'C414']),
    ],
    facilities: [
      facility('F4-BALCONY', 'Balcony', 4, 704, 421, 91,  104, 'right', 'connector-left'),
      facility('F4-TOILET',  'Toilet',  4, 879, 421, 145, 161, 'left',  'temasek-right'),
    ],
    specials: [],
    stairs: makeCommonStairs(4),
  };
}

// ---------------------------------------------------------------------------
// Graph helpers
// ---------------------------------------------------------------------------

function makeNode(id, label, floor, x, y, type, extra = {}) {
  return { id, label, floor, x, y, type, ...extra };
}

function pointDistance(a, b) {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y));
}

function pathDistance(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += pointDistance(path[i], path[i + 1]);
  }
  return Math.max(1, Math.round(total));
}

function makeEdge(from, to, path, type = 'walk') {
  return { from, to, type, distance: pathDistance(path), path };
}

function makeTwoWayEdge(from, to, path, type = 'walk') {
  return [makeEdge(from, to, path, type), makeEdge(to, from, [...path].reverse(), type)];
}

// Returns the corridor projection point for a room/facility based on its zone.
function getCorridorPoint(item) {
  const { x: dx, y: dy } = item.door;
  const isTemasek =
    item.zone === 'temasek-left' ||
    item.zone === 'temasek-right' ||
    item.zone === 'connector-left';
  return isTemasek
    ? { x: CORE.temasekX, y: dy }
    : { x: dx, y: CORE.lowerY };
}

// ---------------------------------------------------------------------------
// Graph builder — per floor
// ---------------------------------------------------------------------------

function makeFloorGraph(floor, layout) {
  const nodes = [];
  const edges = [];

  const allBlocks = [...layout.rooms, ...layout.facilities];
  const corridorNodes = [];

  // Step 1 — DOOR + CORRIDOR node pair for each room / facility
  allBlocks.forEach((item) => {
    if (!item.door || !item.nodeId) return;

    const doorNodeId = item.nodeId;
    const corridorNodeId = `F${floor}-CORRIDOR-${item.id}`;
    const corridorPt = getCorridorPoint(item);

    nodes.push(makeNode(doorNodeId, `${item.label} Door`, floor, item.door.x, item.door.y, 'door', { roomId: item.id }));
    nodes.push(makeNode(corridorNodeId, `${item.label} Corridor`, floor, corridorPt.x, corridorPt.y, 'corridor', { roomId: item.id }));

    edges.push(...makeTwoWayEdge(
      doorNodeId,
      corridorNodeId,
      [{ x: item.door.x, y: item.door.y }, corridorPt],
      'door-access'
    ));

    corridorNodes.push({ id: corridorNodeId, point: corridorPt, zone: item.zone });
  });

  // Step 2 — chain corridor nodes within each wing
  const connectChain = (list) => {
    for (let i = 0; i < list.length - 1; i++) {
      edges.push(...makeTwoWayEdge(
        list[i].id,
        list[i + 1].id,
        [list[i].point, list[i + 1].point],
        'walk'
      ));
    }
  };

  const temasekNodes = corridorNodes
    .filter((n) => n.zone === 'temasek-left' || n.zone === 'temasek-right' || n.zone === 'connector-left')
    .sort((a, b) => a.point.y - b.point.y);

  const lowerNodes = corridorNodes
    .filter((n) => n.zone === 'lower' || n.zone === 'mid')
    .sort((a, b) => a.point.x - b.point.x);

  connectChain(temasekNodes);
  connectChain(lowerNodes);

  // Step 3 — junction node connecting both wings
  const junctionPt = { x: CORE.temasekX, y: CORE.lowerY };
  const junctionId = `F${floor}-JUNCTION`;

  nodes.push(makeNode(junctionId, 'Corridor Junction', floor, junctionPt.x, junctionPt.y, 'corridor'));

  if (temasekNodes.length > 0) {
    const bottom = temasekNodes[temasekNodes.length - 1];
    edges.push(...makeTwoWayEdge(bottom.id, junctionId, [bottom.point, junctionPt], 'walk'));
  }

  lowerNodes.forEach((n) => {
    edges.push(...makeTwoWayEdge(junctionId, n.id, [junctionPt, n.point], 'walk'));
  });

  // Step 4 — stair nodes, each connected to the nearest corridor node
  const stairDefs = [
    { id: `F${floor}-STAIR-RIGHT`,    x: CORE.lowerRightX, y: CORE.lowerY },
    { id: `F${floor}-STAIR-LEFT`,     x: 288,              y: CORE.lowerY },
    { id: `F${floor}-STAIR-TOP-LEFT`, x: 750,              y: 82          },
    { id: `F${floor}-STAIR-TOP`,      x: CORE.temasekX,    y: 52          },
  ];

  stairDefs.forEach((s) => {
    nodes.push(makeNode(s.id, 'Stair', floor, s.x, s.y, 'stair'));

    let nearest = null;
    let minDist = Infinity;
    corridorNodes.forEach((cn) => {
      const d = Math.hypot(cn.point.x - s.x, cn.point.y - s.y);
      if (d < minDist) { minDist = d; nearest = cn; }
    });

    if (nearest) {
      edges.push(...makeTwoWayEdge(
        s.id,
        nearest.id,
        [{ x: s.x, y: s.y }, nearest.point],
        'stair-access'
      ));
    }
  });

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Rooms data (for search & display)
// ---------------------------------------------------------------------------

function makeRoomsData(layouts) {
  return Object.values(layouts)
    .flatMap((layout) => [
      ...layout.rooms,
      ...layout.facilities,
      ...(layout.specials ?? []).filter((item) => item.nodeId),
    ])
    .map((item) => {
      const isRoom = item.type === 'room';
      return {
        id: item.id,
        displayName: isRoom ? `Eusoff Block C Room ${item.id}` : `${item.label} · Eusoff Block C`,
        name: isRoom ? item.id : item.label,
        building: 'Eusoff Block C',
        floor: item.floor,
        type: item.type,
        nodeId: item.nodeId,
        displayPoint: { x: item.x + item.width / 2, y: item.y + item.height / 2 },
      };
    });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function makeBlockCData() {
  const blockCLayout = {
    1: makeFloor1Layout(),
    2: makeFloor2Layout(),
    3: makeFloor3Layout(),
    4: makeFloor4Layout(),
  };

  const graph = { floors: [1, 2, 3, 4], nodes: [], edges: [] };

  Object.values(blockCLayout).forEach((layout) => {
    const { nodes, edges } = makeFloorGraph(layout.floor, layout);
    graph.nodes.push(...nodes);
    graph.edges.push(...edges);
  });

  // Main entrance node
  graph.nodes.push(makeNode('F1-ENTRANCE', 'Main Entrance', 1, CORE.lowerRightX, CORE.entranceY, 'entrance'));

  const entranceCorridor = graph.nodes.find((n) => n.id === 'F1-CORRIDOR-C110');
  if (entranceCorridor) {
    graph.edges.push(...makeTwoWayEdge(
      'F1-ENTRANCE',
      entranceCorridor.id,
      [
        { x: CORE.lowerRightX, y: CORE.entranceY },
        { x: entranceCorridor.x, y: entranceCorridor.y },
      ],
      'entrance'
    ));
  }

  // Inter-floor stair edges
  [1, 2, 3].forEach((floor) => {
    ['STAIR-RIGHT', 'STAIR-LEFT', 'STAIR-TOP-LEFT', 'STAIR-TOP'].forEach((type) => {
      graph.edges.push(
        { from: `F${floor}-${type}`,     to: `F${floor + 1}-${type}`, distance: 85, type: 'stairs' },
        { from: `F${floor + 1}-${type}`, to: `F${floor}-${type}`,     distance: 85, type: 'stairs' }
      );
    });
  });

  return { blockCLayout, graph, roomsData: makeRoomsData(blockCLayout) };
}

const generated = makeBlockCData();

export const blockCLayout = generated.blockCLayout;
export const graph       = generated.graph;
export const roomsData   = generated.roomsData;