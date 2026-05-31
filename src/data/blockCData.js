const VIEWBOX = {
  width: 1280,
  height: 720,
};

const ROOM_GROUPS = {
  1: {
    lowerLeft: ['C101', 'C103', 'C105', 'C107', 'C109'],
    midLeft: ['C102', 'C104', 'C106', 'C108'],
    lowerRight: ['C110', 'C111'],
    topLeft: ['C119', 'C118', 'C117', 'C115', 'C113'],
    topRight: ['C116', 'C114', 'C112'],
    facilities: [
      { id: 'F1-LAUNDRY', label: 'Laundry', x: 650, y: 575, width: 120, height: 76 },
      { id: 'F1-DRYING-YARD', label: 'Drying Yard', x: 770, y: 575, width: 150, height: 76 },
      { id: 'F1-TOILET', label: 'Toilet', x: 815, y: 382, width: 138, height: 78 },
      { id: 'F1-EW-ROOM', label: 'EW Room', x: 815, y: 315, width: 138, height: 58 },
    ],
  },

  2: {
    lowerLeft: ['C201', 'C203', 'C205', 'C207', 'C209'],
    midLeft: ['C202', 'C204', 'C206', 'C208'],
    lowerRight: ['C210', 'C211', 'C212', 'C213'],
    topLeft: ['C221', 'C220', 'C219', 'C217', 'C215'],
    topRight: ['C218', 'C216', 'C214'],
    facilities: [
      { id: 'F2-KITCHEN', label: 'Kitchen', x: 660, y: 382, width: 120, height: 78 },
      { id: 'F2-TOILET', label: 'Toilet', x: 815, y: 382, width: 138, height: 78 },
      { id: 'F2-ROOF', label: 'Roof', x: 900, y: 105, width: 190, height: 110 },
    ],
  },

  3: {
    lowerLeft: ['C301', 'C303', 'C305', 'C307', 'C309'],
    midLeft: ['C302', 'C304', 'C306', 'C308'],
    lowerRight: ['C310', 'C311', 'C312', 'C313'],
    topLeft: ['C323', 'C321', 'C319', 'C317', 'C315'],
    topRight: ['C322', 'C320', 'C318', 'C316', 'C314'],
    facilities: [
      { id: 'F3-LOUNGE', label: 'Lounge', x: 660, y: 382, width: 120, height: 78 },
      { id: 'F3-TOILET', label: 'Toilet', x: 815, y: 382, width: 138, height: 78 },
    ],
  },

  4: {
    lowerLeft: ['C401', 'C403', 'C405', 'C407', 'C409'],
    midLeft: ['C402', 'C404', 'C406', 'C408'],
    lowerRight: ['C410', 'C411', 'C412', 'C413'],
    topLeft: ['C423', 'C421', 'C419', 'C417', 'C415'],
    topRight: ['C424', 'C422', 'C420', 'C418', 'C416', 'C414'],
    facilities: [
      { id: 'F4-BALCONY', label: 'Balcony', x: 660, y: 382, width: 120, height: 78 },
      { id: 'F4-TOILET', label: 'Toilet', x: 815, y: 382, width: 138, height: 78 },
    ],
  },
};

function makeRoom(id, floor, x, y, width, height, doorSide = 'top') {
  const door = getDoorPoint(x, y, width, height, doorSide);

  return {
    id,
    label: id,
    floor,
    x,
    y,
    width,
    height,
    type: 'room',
    nodeId: `F${floor}-${id}-DOOR`,
    door,
  };
}

function getDoorPoint(x, y, width, height, side) {
  if (side === 'top') {
    return { x: x + width / 2, y };
  }

  if (side === 'bottom') {
    return { x: x + width / 2, y: y + height };
  }

  if (side === 'left') {
    return { x, y: y + height / 2 };
  }

  return { x: x + width, y: y + height / 2 };
}

function makeFloorRooms(floor) {
  const groups = ROOM_GROUPS[floor];
  const rooms = [];

  groups.lowerLeft.forEach((id, index) => {
    rooms.push(makeRoom(id, floor, 200 + index * 76, 500, 76, 72, 'top'));
  });

  groups.midLeft.forEach((id, index) => {
    rooms.push(makeRoom(id, floor, 225 + index * 86, 370, 86, 72, 'bottom'));
  });

  groups.lowerRight.forEach((id, index) => {
    rooms.push(makeRoom(id, floor, 650 + index * 120, 575, 120, 76, 'top'));
  });

  groups.topLeft.forEach((id, index) => {
    rooms.push(makeRoom(id, floor, 715, 105 + index * 52, 94, 52, 'right'));
  });

  groups.topRight.forEach((id, index) => {
    rooms.push(makeRoom(id, floor, 900, 105 + index * 52, 94, 52, 'left'));
  });

  return rooms;
}

function makeFloorLayout(floor) {
  return {
    floor,
    viewBox: VIEWBOX,

    corridorPaths: [
      'M190 445 H625 V360 H705 V82 H920 V360 H1035 V470 H1130 V575 H640 V500 H190 Z',
      'M640 500 H1130 V575 H640 Z',
      'M190 445 H625 V500 H190 Z',
    ],

    outerWallPath:
      'M170 500 H640 V575 H1130 V470 H1035 V360 H920 V182 H1050 V78 H705 V360 H625 V445 H170 Z',

    rooms: makeFloorRooms(floor),

    facilities: ROOM_GROUPS[floor].facilities,

    stairs: [
      {
        id: `F${floor}-STAIR-RIGHT`,
        label: 'Right Stair',
        x: 1015,
        y: 475,
        width: 84,
        height: 54,
        orientation: 'horizontal',
        node: { x: 1057, y: 502 },
      },
      {
        id: `F${floor}-STAIR-TOP`,
        label: 'Top Stair',
        x: 735,
        y: 35,
        width: 84,
        height: 46,
        orientation: 'horizontal',
        node: { x: 777, y: 82 },
      },
    ],
  };
}

function node(id, label, floor, x, y, type, extra = {}) {
  return {
    id,
    label,
    floor,
    x,
    y,
    type,
    ...extra,
  };
}

function edge(from, to, distance, path = null, type = 'walk') {
  return {
    from,
    to,
    distance,
    type,
    ...(path ? { path } : {}),
  };
}

function makeBidirectionalEdge(from, to, distance, path, type = 'walk') {
  const reversePath = path ? [...path].reverse() : null;

  return [
    edge(from, to, distance, path, type),
    edge(to, from, distance, reversePath, type),
  ];
}

function makeFloorGraph(floor, layout) {
  const nodes = [];
  const edges = [];

  const stairRightId = `F${floor}-STAIR-RIGHT`;
  const corridorRightId = `F${floor}-CORRIDOR-RIGHT`;
  const corridorLowerId = `F${floor}-CORRIDOR-LOWER`;
  const corridorLeftTurnId = `F${floor}-CORRIDOR-LEFT-TURN`;
  const corridorTopBaseId = `F${floor}-CORRIDOR-TOP-BASE`;
  const corridorTopMidId = `F${floor}-CORRIDOR-TOP-MID`;

  nodes.push(
    node(stairRightId, 'Right Stair', floor, 1057, 502, 'stair'),
    node(corridorRightId, 'Right corridor', floor, 1057, 542, 'corridor'),
    node(corridorLowerId, 'Lower corridor', floor, 620, 542, 'corridor'),
    node(corridorLeftTurnId, 'Left connector', floor, 620, 452, 'junction'),
    node(corridorTopBaseId, 'Top corridor base', floor, 855, 360, 'junction'),
    node(corridorTopMidId, 'Top corridor', floor, 855, 225, 'corridor')
  );

  edges.push(
    ...makeBidirectionalEdge(
      stairRightId,
      corridorRightId,
      40,
      [
        { x: 1057, y: 502 },
        { x: 1057, y: 542 },
      ],
      'stair-access'
    ),

    ...makeBidirectionalEdge(
      corridorRightId,
      corridorLowerId,
      437,
      [
        { x: 1057, y: 542 },
        { x: 620, y: 542 },
      ]
    ),

    ...makeBidirectionalEdge(
      corridorLowerId,
      corridorLeftTurnId,
      90,
      [
        { x: 620, y: 542 },
        { x: 620, y: 452 },
      ]
    ),

    ...makeBidirectionalEdge(
      corridorLeftTurnId,
      corridorTopBaseId,
      325,
      [
        { x: 620, y: 452 },
        { x: 620, y: 380 },
        { x: 855, y: 380 },
        { x: 855, y: 360 },
      ]
    ),

    ...makeBidirectionalEdge(
      corridorTopBaseId,
      corridorTopMidId,
      135,
      [
        { x: 855, y: 360 },
        { x: 855, y: 225 },
      ]
    )
  );

  layout.rooms.forEach((room) => {
    const doorNodeId = room.nodeId;
    const anchorNodeId = `F${floor}-${room.id}-ANCHOR`;

    const anchor = getAnchorForRoom(room);

    nodes.push(
      node(doorNodeId, `${room.id} Door`, floor, room.door.x, room.door.y, 'door', {
        roomId: room.id,
      }),
      node(anchorNodeId, `${room.id} Anchor`, floor, anchor.x, anchor.y, 'corridor-anchor', {
        roomId: room.id,
      })
    );

    edges.push(
      ...makeBidirectionalEdge(
        doorNodeId,
        anchorNodeId,
        Math.round(distanceBetween(room.door, anchor)),
        [
          { x: room.door.x, y: room.door.y },
          { x: anchor.x, y: anchor.y },
        ],
        'door-access'
      )
    );

    const spineNodeId = getSpineNodeForRoom(room, floor);
    const pathToSpine = getPathFromAnchorToSpine(anchor, spineNodeId, floor);

    edges.push(
      ...makeBidirectionalEdge(
        anchorNodeId,
        spineNodeId,
        getPathDistance(pathToSpine),
        pathToSpine
      )
    );
  });

  return { nodes, edges };
}

function getAnchorForRoom(room) {
  const idNumber = Number(room.id.slice(1));

  // Mid-left rooms like C302/C304/C306/C308.
  if (room.x >= 220 && room.x < 600 && room.y < 460) {
    return {
      x: room.door.x,
      y: 452,
    };
  }

  // Lower-left rooms like C301/C303/C305.
  if (room.x < 620 && room.y >= 500) {
    return {
      x: room.door.x,
      y: 490,
    };
  }

  // Lower-right rooms like C310-C313.
  if (room.x >= 640 && room.y >= 560) {
    return {
      x: room.door.x,
      y: 542,
    };
  }

  // Top-left cluster.
  if (room.x < 850 && room.y < 370) {
    return {
      x: 855,
      y: room.door.y,
    };
  }

  // Top-right cluster.
  return {
    x: 855,
    y: room.door.y,
  };
}

function getSpineNodeForRoom(room, floor) {
  // Mid-left room row connects to left turn.
  if (room.x >= 220 && room.x < 600 && room.y < 460) {
    return `F${floor}-CORRIDOR-LEFT-TURN`;
  }

  // Lower-left rooms also go through left turn / lower corridor.
  if (room.x < 620 && room.y >= 500) {
    return `F${floor}-CORRIDOR-LEFT-TURN`;
  }

  // Lower-right rooms connect to lower corridor.
  if (room.x >= 640 && room.y >= 560) {
    return `F${floor}-CORRIDOR-LOWER`;
  }

  // Top cluster connects to top corridor.
  return `F${floor}-CORRIDOR-TOP-MID`;
}

function getPathFromAnchorToSpine(anchor, spineNodeId, floor) {
  const spinePoints = {
    [`F${floor}-CORRIDOR-LEFT-TURN`]: { x: 620, y: 452 },
    [`F${floor}-CORRIDOR-LOWER`]: { x: 620, y: 542 },
    [`F${floor}-CORRIDOR-TOP-MID`]: { x: 855, y: 225 },
  };

  const spine = spinePoints[spineNodeId];

  if (!spine) {
    return [anchor];
  }

  if (spineNodeId.endsWith('LEFT-TURN')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: spine.x, y: anchor.y },
      { x: spine.x, y: spine.y },
    ];
  }

  if (spineNodeId.endsWith('LOWER')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: spine.x, y: spine.y },
    ];
  }

  return [
    { x: anchor.x, y: anchor.y },
    { x: 855, y: anchor.y },
    { x: 855, y: spine.y },
  ];
}

function distanceBetween(a, b) {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y));
}

function getPathDistance(path) {
  let total = 0;

  for (let i = 0; i < path.length - 1; i += 1) {
    total += distanceBetween(path[i], path[i + 1]);
  }

  return Math.round(total);
}

function makeRoomsData(layouts) {
  return Object.values(layouts)
    .flatMap((layout) => layout.rooms)
    .map((room) => ({
      id: room.id,
      displayName: `Eusoff Block C Room ${room.id}`,
      name: room.id,
      building: 'Eusoff Block C',
      floor: room.floor,
      type: 'room',
      nodeId: room.nodeId,
      displayPoint: {
        x: room.x + room.width / 2,
        y: room.y + room.height / 2,
      },
    }));
}

function makeBlockCData() {
  const layouts = {
    1: makeFloorLayout(1),
    2: makeFloorLayout(2),
    3: makeFloorLayout(3),
    4: makeFloorLayout(4),
  };

  const graph = {
    floors: [1, 2, 3, 4],
    nodes: [],
    edges: [],
  };

  Object.values(layouts).forEach((layout) => {
    const floorGraph = makeFloorGraph(layout.floor, layout);
    graph.nodes.push(...floorGraph.nodes);
    graph.edges.push(...floorGraph.edges);
  });

  graph.nodes.push(
    node('F1-ENTRANCE', 'Main Entrance', 1, 1057, 610, 'entrance')
  );

  graph.edges.push(
    ...makeBidirectionalEdge(
      'F1-ENTRANCE',
      'F1-CORRIDOR-RIGHT',
      68,
      [
        { x: 1057, y: 610 },
        { x: 1057, y: 542 },
      ],
      'entrance'
    )
  );

  [1, 2, 3].forEach((floor) => {
    graph.edges.push(
      ...makeBidirectionalEdge(
        `F${floor}-STAIR-RIGHT`,
        `F${floor + 1}-STAIR-RIGHT`,
        85,
        null,
        'stairs'
      )
    );
  });

  return {
    blockCLayout: layouts,
    graph,
    roomsData: makeRoomsData(layouts),
  };
}

const generated = makeBlockCData();

export const blockCLayout = generated.blockCLayout;
export const graph = generated.graph;
export const roomsData = generated.roomsData;