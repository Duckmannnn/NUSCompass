const VIEWBOX = {
  width: 1280,
  height: 882,
};

// -----------------------------------------------------------------------------
// NUSCompass — Eusoff Block C traced map data
// -----------------------------------------------------------------------------
// This file is intentionally based on the original floor-plan proportions.
// The visual floor plan is the source of truth; the navigation graph is built
// on top of it.
//
// Visual layer:
// - rooms: searchable room blocks such as C101, C302, C421
// - facilities: Toilet, EW Room, Kitchen, Lounge, Balcony, Laundry, Drying Yard
// - specials: large non-searchable blocks such as Resident Fellow's Flat / Roof
// - stairs: visual staircase blocks
// - corridorPaths: walkable strips following the original floor-plan geometry
//
// Graph layer:
// - every room/facility has a DOOR node
// - every DOOR connects to an ANCHOR on the corridor centerline
// - anchors connect to corridor spine nodes
// - route rendering uses edge.path so lines stay on the walkway
// -----------------------------------------------------------------------------

const CORE = {
  lowerY: 686,
  temasekX: 838,
  temasekMidY: 392,
  temasekTopY: 100,
  lowerLeftX: 520,
  lowerRightX: 987,
  entranceY: 760,
};

function getDoorPoint(x, y, width, height, side) {
  if (side === 'top') return { x: x + width / 2, y };
  if (side === 'bottom') return { x: x + width / 2, y: y + height };
  if (side === 'left') return { x, y: y + height / 2 };
  return { x: x + width, y: y + height / 2 };
}

function block({ id, label = id, floor, type, x, y, width, height, doorSide, zone }) {
  return {
    id,
    label,
    floor,
    type,
    x,
    y,
    width,
    height,
    doorSide,
    zone,
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
  return {
    id,
    label,
    floor,
    x,
    y,
    width,
    height,
    orientation,
    node,
  };
}

function makeBottomLeftRooms(floor, prefix) {
  const base = [
    [1, 353, 724, 59, 100],
    [3, 412, 724, 59, 100],
    [5, 471, 724, 60, 100],
    [7, 531, 724, 60, 100],
    [9, 591, 724, 58, 100],
  ];

  return base.map(([suffix, x, y, width, height]) =>
    room(`${prefix}${String(suffix).padStart(2, '0')}`, floor, x, y, width, height, 'top', 'lower')
  );
}

function makeBottomRightRooms(floor, prefix) {
  // Upper floors have four larger lower-right rooms. Keep them aligned so
  // single-room rows and larger room rows do not look randomly offset.
  return [
    room(`${prefix}10`, floor, 649, 704, 110, 164, 'top', 'lower'),
    room(`${prefix}11`, floor, 759, 704, 110, 164, 'top', 'lower'),
    room(`${prefix}12`, floor, 869, 704, 107, 164, 'top', 'lower'),
    room(`${prefix}13`, floor, 976, 704, 107, 164, 'top', 'lower'),
  ];
}

function makeMiddleRooms(floor, prefix) {
  const base = [
    [2, 353, 535, 60, 103],
    [4, 413, 535, 60, 103],
    [6, 473, 535, 60, 103],
    [8, 533, 535, 71, 103],
  ];

  return base.map(([suffix, x, y, width, height]) =>
    room(`${prefix}${String(suffix).padStart(2, '0')}`, floor, x, y, width, height, 'bottom', 'mid')
  );
}

function makeTopLeftStack(floor, ids) {
  const yValues = [125, 185, 245, 305, 363];

  return ids.map((id, index) =>
    room(id, floor, 704, yValues[index], 91, index < 3 ? 60 : 58, 'right', 'temasek-left')
  );
}

function makeTopRightStack(floor, ids) {
  const isSixStack = ids.length === 6;
  const yValues = isSixStack ? [95, 145, 195, 245, 295, 345] : [245, 304, 363];
  const heights = isSixStack ? [50, 50, 50, 50, 50, 50] : [59, 59, 58];

  return ids.map((id, index) =>
    room(id, floor, 879, yValues[index], 88, heights[index], 'left', 'temasek-right')
  );
}

const BASE_CORRIDOR_PATHS = [
  // Lower-left and middle corridor.
  'M150 555 H353 V535 H604 V637 H663 V620 H692 V705 H353 V724 H150 Z',
  // Lower-right corridor and service corridor.
  'M692 637 H879 V705 H1030 V735 H692 Z',
  // Temasek vertical corridor.
  'M795 52 H879 V637 H795 Z',
  // Connector from lower corridor into Temasek corridor.
  'M663 520 L735 420 H795 V637 H692 Z',
];

const BASE_OUTER_WALL_PATH =
  'M150 475 V565 H200 V555 H337 V535 H353 V535 H604 V637 H663 V620 H692 V520 L735 475 H795 V421 H704 V120 H795 V52 H879 V38 H1020 V22 H1110 V38 H1110 V220 H1020 V220 H1020 V245 H967 V476 H1024 V637 H1037 V679 H1083 V735 H1083 V868 H635 V852 H352 V824 H255 V800 H200 V790 H255';

function makeCommonStairs(floor) {
  return [
    stair(`F${floor}-STAIR-TOP-LEFT`, 'Top Left Stair', floor, 704, 52, 91, 58, 'vertical', {
      x: 750,
      y: 82,
    }),
    stair(`F${floor}-STAIR-TOP`, 'Temasek Stair', floor, 795, 25, 77, 28, 'horizontal', {
      x: CORE.temasekX,
      y: 52,
    }),
    stair(`F${floor}-STAIR-LEFT`, 'Left Stair', floor, 252, 655, 72, 56, 'vertical', {
      x: 288,
      y: CORE.lowerY,
    }),
    stair(`F${floor}-STAIR-RIGHT`, 'Right Stair', floor, 949, 656, 76, 61, 'vertical', {
      x: CORE.lowerRightX,
      y: CORE.lowerY,
    }),
  ];
}

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
      facility('F1-EW', 'EW Room', 1, 879, 421, 88, 55, 'left', 'temasek-right'),
      facility('F1-TOILET', 'Toilet', 1, 879, 476, 145, 161, 'left', 'temasek-right'),
      facility('F1-LAUNDRY', 'Laundry', 1, 793, 735, 131, 133, 'top', 'lower'),
      facility('F1-DRYING', 'Drying Yard', 1, 924, 735, 159, 133, 'top', 'lower'),
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
      facility('F2-KITCHEN', 'Kitchen', 2, 704, 421, 91, 104, 'right', 'connector-left'),
      facility('F2-TOILET', 'Toilet', 2, 879, 421, 145, 161, 'left', 'temasek-right'),
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
      facility('F3-LOUNGE', 'Lounge', 3, 704, 421, 91, 104, 'right', 'connector-left'),
      facility('F3-TOILET', 'Toilet', 3, 879, 421, 145, 161, 'left', 'temasek-right'),
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
      facility('F4-BALCONY', 'Balcony', 4, 704, 421, 91, 104, 'right', 'connector-left'),
      facility('F4-TOILET', 'Toilet', 4, 879, 421, 145, 161, 'left', 'temasek-right'),
    ],
    specials: [],
    stairs: makeCommonStairs(4),
  };
}

function makeNode(id, label, floor, x, y, type, extra = {}) {
  return { id, label, floor, x, y, type, ...extra };
}

function makeEdge(from, to, path, type = 'walk') {
  return {
    from,
    to,
    type,
    distance: pathDistance(path),
    path,
  };
}

function makeTwoWayEdge(from, to, path, type = 'walk') {
  return [makeEdge(from, to, path, type), makeEdge(to, from, [...path].reverse(), type)];
}

function pointDistance(a, b) {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y));
}

function pathDistance(path) {
  let total = 0;

  for (let index = 0; index < path.length - 1; index += 1) {
    total += pointDistance(path[index], path[index + 1]);
  }

  return Math.max(1, Math.round(total));
}

function getAnchorForBlock(item) {
  if (item.zone === 'lower' || item.zone === 'mid') {
    return { x: item.door.x, y: CORE.lowerY };
  }

  if (item.zone === 'connector-left') {
    return { x: CORE.temasekX, y: item.door.y };
  }

  if (item.zone === 'temasek-left' || item.zone === 'temasek-right') {
    return { x: CORE.temasekX, y: item.door.y };
  }

  return { x: item.door.x, y: CORE.lowerY };
}

function getSpineNodeForBlock(item, floor) {
  if (item.zone === 'lower' || item.zone === 'mid') {
    return `F${floor}-CORRIDOR-LOWER`;
  }

  if (item.zone === 'connector-left' || item.zone === 'temasek-left' || item.zone === 'temasek-right') {
    return `F${floor}-CORRIDOR-TEMASEK-MID`;
  }

  return `F${floor}-CORRIDOR-LOWER`;
}

function getSpinePoint(spineNodeId, floor) {
  const points = {
    [`F${floor}-STAIR-RIGHT`]: { x: CORE.lowerRightX, y: CORE.lowerY },
    [`F${floor}-CORRIDOR-LOWER-RIGHT`]: { x: CORE.lowerRightX, y: CORE.lowerY },
    [`F${floor}-CORRIDOR-LOWER`]: { x: CORE.temasekX, y: CORE.lowerY },
    [`F${floor}-CORRIDOR-LOWER-LEFT`]: { x: CORE.lowerLeftX, y: CORE.lowerY },
    [`F${floor}-CORRIDOR-TEMASEK-MID`]: { x: CORE.temasekX, y: CORE.temasekMidY },
    [`F${floor}-CORRIDOR-TEMASEK-TOP`]: { x: CORE.temasekX, y: CORE.temasekTopY },
  };

  return points[spineNodeId];
}

function getAnchorToSpinePath(anchor, spineNodeId, floor) {
  const spine = getSpinePoint(spineNodeId, floor);

  if (!spine) return [anchor];

  if (spineNodeId.endsWith('CORRIDOR-LOWER')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: spine.x, y: spine.y },
    ];
  }

  if (spineNodeId.endsWith('CORRIDOR-TEMASEK-MID')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: CORE.temasekX, y: anchor.y },
      { x: CORE.temasekX, y: spine.y },
    ];
  }

  return [
    { x: anchor.x, y: anchor.y },
    { x: spine.x, y: spine.y },
  ];
}

function addBlockToGraph(item, floor, nodes, edges) {
  if (!item.door || !item.nodeId) return;

  const doorNodeId = item.nodeId;
  const anchorNodeId = `${doorNodeId.replace('-DOOR', '')}-ANCHOR`;
  const anchor = getAnchorForBlock(item);
  const spineNodeId = getSpineNodeForBlock(item, floor);
  const anchorToSpinePath = getAnchorToSpinePath(anchor, spineNodeId, floor);

  nodes.push(
    makeNode(doorNodeId, `${item.label} Door`, floor, item.door.x, item.door.y, 'door', {
      roomId: item.id,
    }),
    makeNode(anchorNodeId, `${item.label} Anchor`, floor, anchor.x, anchor.y, 'corridor-anchor', {
      roomId: item.id,
    })
  );

  edges.push(
    ...makeTwoWayEdge(
      doorNodeId,
      anchorNodeId,
      [
        { x: item.door.x, y: item.door.y },
        { x: anchor.x, y: anchor.y },
      ],
      'door-access'
    ),
    ...makeTwoWayEdge(anchorNodeId, spineNodeId, anchorToSpinePath, 'walk')
  );
}

function makeFloorGraph(floor, layout) {
  const nodes = [];
  const edges = [];

  nodes.push(
    makeNode(`F${floor}-STAIR-RIGHT`, 'Right Stair', floor, CORE.lowerRightX, CORE.lowerY, 'stair'),
    makeNode(`F${floor}-CORRIDOR-LOWER-RIGHT`, 'Lower right corridor', floor, CORE.lowerRightX, CORE.lowerY, 'corridor'),
    makeNode(`F${floor}-CORRIDOR-LOWER`, 'Lower corridor', floor, CORE.temasekX, CORE.lowerY, 'corridor'),
    makeNode(`F${floor}-CORRIDOR-LOWER-LEFT`, 'Lower left corridor', floor, CORE.lowerLeftX, CORE.lowerY, 'corridor'),
    makeNode(`F${floor}-CORRIDOR-TEMASEK-MID`, 'Temasek corridor', floor, CORE.temasekX, CORE.temasekMidY, 'corridor'),
    makeNode(`F${floor}-CORRIDOR-TEMASEK-TOP`, 'Temasek top corridor', floor, CORE.temasekX, CORE.temasekTopY, 'corridor')
  );

  edges.push(
    ...makeTwoWayEdge(
      `F${floor}-STAIR-RIGHT`,
      `F${floor}-CORRIDOR-LOWER-RIGHT`,
      [
        { x: CORE.lowerRightX, y: CORE.lowerY },
        { x: CORE.lowerRightX, y: CORE.lowerY },
      ],
      'stair-access'
    ),
    ...makeTwoWayEdge(
      `F${floor}-CORRIDOR-LOWER-RIGHT`,
      `F${floor}-CORRIDOR-LOWER`,
      [
        { x: CORE.lowerRightX, y: CORE.lowerY },
        { x: CORE.temasekX, y: CORE.lowerY },
      ]
    ),
    ...makeTwoWayEdge(
      `F${floor}-CORRIDOR-LOWER`,
      `F${floor}-CORRIDOR-LOWER-LEFT`,
      [
        { x: CORE.temasekX, y: CORE.lowerY },
        { x: CORE.lowerLeftX, y: CORE.lowerY },
      ]
    ),
    ...makeTwoWayEdge(
      `F${floor}-CORRIDOR-LOWER`,
      `F${floor}-CORRIDOR-TEMASEK-MID`,
      [
        { x: CORE.temasekX, y: CORE.lowerY },
        { x: CORE.temasekX, y: CORE.temasekMidY },
      ]
    ),
    ...makeTwoWayEdge(
      `F${floor}-CORRIDOR-TEMASEK-MID`,
      `F${floor}-CORRIDOR-TEMASEK-TOP`,
      [
        { x: CORE.temasekX, y: CORE.temasekMidY },
        { x: CORE.temasekX, y: CORE.temasekTopY },
      ]
    )
  );

  layout.rooms.forEach((item) => addBlockToGraph(item, floor, nodes, edges));
  layout.facilities.forEach((item) => addBlockToGraph(item, floor, nodes, edges));

  return { nodes, edges };
}

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
        displayPoint: {
          x: item.x + item.width / 2,
          y: item.y + item.height / 2,
        },
      };
    });
}

function makeBlockCData() {
  const blockCLayout = {
    1: makeFloor1Layout(),
    2: makeFloor2Layout(),
    3: makeFloor3Layout(),
    4: makeFloor4Layout(),
  };

  const graph = {
    floors: [1, 2, 3, 4],
    nodes: [],
    edges: [],
  };

  Object.values(blockCLayout).forEach((layout) => {
    const floorGraph = makeFloorGraph(layout.floor, layout);
    graph.nodes.push(...floorGraph.nodes);
    graph.edges.push(...floorGraph.edges);
  });

  graph.nodes.push(
    makeNode('F1-ENTRANCE', 'Main Entrance', 1, CORE.lowerRightX, CORE.entranceY, 'entrance')
  );

  graph.edges.push(
    ...makeTwoWayEdge(
      'F1-ENTRANCE',
      'F1-STAIR-RIGHT',
      [
        { x: CORE.lowerRightX, y: CORE.entranceY },
        { x: CORE.lowerRightX, y: CORE.lowerY },
      ],
      'entrance'
    )
  );

  [1, 2, 3].forEach((floor) => {
    graph.edges.push(
      {
        from: `F${floor}-STAIR-RIGHT`,
        to: `F${floor + 1}-STAIR-RIGHT`,
        distance: 85,
        type: 'stairs',
      },
      {
        from: `F${floor + 1}-STAIR-RIGHT`,
        to: `F${floor}-STAIR-RIGHT`,
        distance: 85,
        type: 'stairs',
      }
    );
  });

  return {
    blockCLayout,
    graph,
    roomsData: makeRoomsData(blockCLayout),
  };
}

const generated = makeBlockCData();

export const blockCLayout = generated.blockCLayout;
export const graph = generated.graph;
export const roomsData = generated.roomsData;
