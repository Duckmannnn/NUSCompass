const VIEWBOX = {
  width: 1280,
  height: 720,
};

const SPINE = {
  leftY: 468,
  lowerY: 542,
  connectorX: 640,
  topX: 855,
  topBaseY: 390,
  topMidY: 225,
  stairRightX: 1080,
  stairRightY: 542,
};

const ROOM_SETS = {
  1: {
    lowerLeft: ['C101', 'C103', 'C105', 'C107', 'C109'],
    midLeft: ['C102', 'C104', 'C106', 'C108'],
    lowerRight: ['C110', 'C111'],
    topLeft: ['C119', 'C118', 'C117', 'C115', 'C113'],
    topRight: ['C116', 'C114', 'C112'],
    facilities: [
      block('F1-LAUNDRY', 'Laundry', 900, 575, 120, 76, 'top'),
      block('F1-DRYING-YARD', 'Drying Yard', 1020, 575, 130, 76, 'top'),
      block('F1-TOILET', 'Toilet', 815, 365, 145, 80, 'bottom'),
      block('F1-EW-ROOM', 'EW Room', 815, 300, 145, 62, 'bottom'),
    ],
  },

  2: {
    lowerLeft: ['C201', 'C203', 'C205', 'C207', 'C209'],
    midLeft: ['C202', 'C204', 'C206', 'C208'],
    lowerRight: ['C210', 'C211', 'C212', 'C213'],
    topLeft: ['C221', 'C220', 'C219', 'C217', 'C215'],
    topRight: ['C218', 'C216', 'C214'],
    facilities: [
      block('F2-KITCHEN', 'Kitchen', 660, 365, 140, 80, 'bottom'),
      block('F2-TOILET', 'Toilet', 830, 365, 145, 80, 'bottom'),
      block('F2-ROOF', 'Roof', 900, 85, 190, 110, 'left'),
    ],
  },

  3: {
    lowerLeft: ['C301', 'C303', 'C305', 'C307', 'C309'],
    midLeft: ['C302', 'C304', 'C306', 'C308'],
    lowerRight: ['C310', 'C311', 'C312', 'C313'],
    topLeft: ['C323', 'C321', 'C319', 'C317', 'C315'],
    topRight: ['C322', 'C320', 'C318', 'C316', 'C314'],
    facilities: [
      block('F3-LOUNGE', 'Lounge', 660, 365, 140, 80, 'bottom'),
      block('F3-TOILET', 'Toilet', 830, 365, 145, 80, 'bottom'),
    ],
  },

  4: {
    lowerLeft: ['C401', 'C403', 'C405', 'C407', 'C409'],
    midLeft: ['C402', 'C404', 'C406', 'C408'],
    lowerRight: ['C410', 'C411', 'C412', 'C413'],
    topLeft: ['C423', 'C421', 'C419', 'C417', 'C415'],
    topRight: ['C424', 'C422', 'C420', 'C418', 'C416', 'C414'],
    facilities: [
      block('F4-BALCONY', 'Balcony', 660, 365, 140, 80, 'bottom'),
      block('F4-TOILET', 'Toilet', 830, 365, 145, 80, 'bottom'),
    ],
  },
};

function block(id, label, x, y, width, height, doorSide) {
  const door = getDoorPoint(x, y, width, height, doorSide);

  return {
    id,
    label,
    x,
    y,
    width,
    height,
    doorSide,
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

function room(id, floor, x, y, width, height, doorSide, zone) {
  const door = getDoorPoint(x, y, width, height, doorSide);

  return {
    id,
    label: id,
    floor,
    x,
    y,
    width,
    height,
    doorSide,
    door,
    zone,
    type: 'room',
    nodeId: `F${floor}-${id}-DOOR`,
  };
}

function makeFloorRooms(floor) {
  const set = ROOM_SETS[floor];
  const rooms = [];

  set.midLeft.forEach((id, index) => {
    rooms.push(
      room(id, floor, 170 + index * 112, 340, 112, 86, 'bottom', 'mid-left')
    );
  });

  set.lowerLeft.forEach((id, index) => {
    rooms.push(
      room(id, floor, 170 + index * 92, 500, 92, 76, 'top', 'lower-left')
    );
  });

  set.lowerRight.forEach((id, index) => {
    rooms.push(
      room(id, floor, 650 + index * 125, 575, 125, 76, 'top', 'lower-right')
    );
  });

  set.topLeft.forEach((id, index) => {
    rooms.push(
      room(id, floor, 710, 105 + index * 55, 96, 55, 'right', 'top-left')
    );
  });

  const topRightHeight = set.topRight.length >= 6 ? 48 : 55;
  const topRightStartY = set.topRight.length >= 6 ? 78 : 105;

  set.topRight.forEach((id, index) => {
    rooms.push(
      room(
        id,
        floor,
        910,
        topRightStartY + index * topRightHeight,
        96,
        topRightHeight,
        'left',
        'top-right'
      )
    );
  });

  return rooms;
}

function makeFloorLayout(floor) {
  const rooms = makeFloorRooms(floor);
  const rawFacilities = ROOM_SETS[floor].facilities;

  const facilities = rawFacilities.map((facility) => ({
    ...facility,
    floor,
    type: 'facility',
  }));

  return {
    floor,
    viewBox: VIEWBOX,

    // Corridor is drawn as clean straight strips.
    corridorPaths: [
      // Left horizontal corridor between mid-left row and lower-left row.
      'M140 426 H640 V500 H140 Z',

      // Lower horizontal corridor above lower-right row and toward stair.
      'M640 500 H1145 V585 H640 Z',

      // Connector between left corridor and lower corridor.
      'M600 426 H680 V585 H600 Z',

      // Central connector toward the upper vertical corridor.
      'M640 360 H900 V426 H640 Z',

      // Vertical Temasek corridor between top-left and top-right rooms.
      'M806 78 H910 V365 H806 Z',
    ],

    // Outer wall is only a clean visual boundary.
    outerWallPath:
      'M140 500 H640 V585 H1145 V470 H1035 V365 H910 V182 H1050 V78 H706 V365 H640 V426 H140 Z',

    rooms,
    facilities,

    stairs: [
      {
        id: `F${floor}-STAIR-RIGHT`,
        label: 'Right Stair',
        x: 1045,
        y: 460,
        width: 92,
        height: 62,
        orientation: 'horizontal',
        node: { x: SPINE.stairRightX, y: SPINE.stairRightY },
      },
      {
        id: `F${floor}-STAIR-TOP`,
        label: 'Top Stair',
        x: 745,
        y: 34,
        width: 92,
        height: 48,
        orientation: 'horizontal',
        node: { x: 790, y: 82 },
      },
    ],
  };
}

function makeNode(id, label, floor, x, y, type, extra = {}) {
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

function makeEdge(from, to, distance, path = null, type = 'walk') {
  return {
    from,
    to,
    distance,
    type,
    ...(path ? { path } : {}),
  };
}

function makeTwoWayEdge(from, to, distance, path, type = 'walk') {
  return [
    makeEdge(from, to, distance, path, type),
    makeEdge(to, from, distance, [...path].reverse(), type),
  ];
}

function pointDistance(a, b) {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y));
}

function pathDistance(path) {
  let total = 0;

  for (let i = 0; i < path.length - 1; i += 1) {
    total += pointDistance(path[i], path[i + 1]);
  }

  return Math.round(total);
}

function getAnchorForBlock(blockItem) {
  if (blockItem.zone === 'mid-left') {
    return {
      x: blockItem.door.x,
      y: SPINE.leftY,
    };
  }

  if (blockItem.zone === 'lower-left') {
    return {
      x: blockItem.door.x,
      y: SPINE.leftY,
    };
  }

  if (blockItem.zone === 'lower-right') {
    return {
      x: blockItem.door.x,
      y: SPINE.lowerY,
    };
  }

  if (blockItem.zone === 'top-left') {
    return {
      x: SPINE.topX,
      y: blockItem.door.y,
    };
  }

  if (blockItem.zone === 'top-right') {
    return {
      x: SPINE.topX,
      y: blockItem.door.y,
    };
  }

  // Facilities like Lounge / Toilet / Kitchen are room-like blocks.
  if (blockItem.doorSide === 'bottom') {
    return {
      x: blockItem.door.x,
      y: SPINE.leftY,
    };
  }

  if (blockItem.doorSide === 'top') {
    return {
      x: blockItem.door.x,
      y: SPINE.lowerY,
    };
  }

  return {
    x: SPINE.topX,
    y: blockItem.door.y,
  };
}

function getSpineNodeForBlock(blockItem, floor) {
  if (blockItem.zone === 'mid-left' || blockItem.zone === 'lower-left') {
    return `F${floor}-CORRIDOR-LEFT`;
  }

  if (blockItem.zone === 'lower-right') {
    return `F${floor}-CORRIDOR-LOWER`;
  }

  if (blockItem.zone === 'top-left' || blockItem.zone === 'top-right') {
    return `F${floor}-CORRIDOR-TOP`;
  }

  // Facilities attached to left / central corridor.
  if (blockItem.doorSide === 'bottom') {
    return `F${floor}-CORRIDOR-LEFT`;
  }

  if (blockItem.doorSide === 'top') {
    return `F${floor}-CORRIDOR-LOWER`;
  }

  return `F${floor}-CORRIDOR-TOP`;
}

function getSpinePoint(spineNodeId, floor) {
  const points = {
    [`F${floor}-CORRIDOR-RIGHT`]: {
      x: SPINE.stairRightX,
      y: SPINE.lowerY,
    },
    [`F${floor}-CORRIDOR-LOWER`]: {
      x: SPINE.connectorX,
      y: SPINE.lowerY,
    },
    [`F${floor}-CORRIDOR-LEFT`]: {
      x: SPINE.connectorX,
      y: SPINE.leftY,
    },
    [`F${floor}-CORRIDOR-TOP-BASE`]: {
      x: SPINE.topX,
      y: SPINE.topBaseY,
    },
    [`F${floor}-CORRIDOR-TOP`]: {
      x: SPINE.topX,
      y: SPINE.topMidY,
    },
  };

  return points[spineNodeId];
}

function getPathFromAnchorToSpine(anchor, spineNodeId, floor) {
  const spine = getSpinePoint(spineNodeId, floor);

  if (!spine) {
    return [anchor];
  }

  if (spineNodeId.endsWith('CORRIDOR-LEFT')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: spine.x, y: spine.y },
    ];
  }

  if (spineNodeId.endsWith('CORRIDOR-LOWER')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: spine.x, y: spine.y },
    ];
  }

  if (spineNodeId.endsWith('CORRIDOR-TOP')) {
    return [
      { x: anchor.x, y: anchor.y },
      { x: SPINE.topX, y: anchor.y },
      { x: SPINE.topX, y: spine.y },
    ];
  }

  return [
    { x: anchor.x, y: anchor.y },
    { x: spine.x, y: spine.y },
  ];
}

function makeBlockGraphNodesAndEdges(floor, blockItem, nodes, edges) {
  const doorNodeId =
    blockItem.nodeId ?? `F${floor}-${blockItem.id.replace(`F${floor}-`, '')}-DOOR`;
  const anchorNodeId = `${doorNodeId.replace('-DOOR', '')}-ANCHOR`;

  const anchor = getAnchorForBlock(blockItem);
  const spineNodeId = getSpineNodeForBlock(blockItem, floor);
  const anchorToSpinePath = getPathFromAnchorToSpine(anchor, spineNodeId, floor);

  nodes.push(
    makeNode(doorNodeId, `${blockItem.label} Door`, floor, blockItem.door.x, blockItem.door.y, 'door', {
      roomId: blockItem.id,
    }),
    makeNode(anchorNodeId, `${blockItem.label} Anchor`, floor, anchor.x, anchor.y, 'corridor-anchor', {
      roomId: blockItem.id,
    })
  );

  edges.push(
    ...makeTwoWayEdge(
      doorNodeId,
      anchorNodeId,
      pointDistance(blockItem.door, anchor),
      [
        { x: blockItem.door.x, y: blockItem.door.y },
        { x: anchor.x, y: anchor.y },
      ],
      'door-access'
    ),
    ...makeTwoWayEdge(
      anchorNodeId,
      spineNodeId,
      pathDistance(anchorToSpinePath),
      anchorToSpinePath,
      'walk'
    )
  );
}

function makeFloorGraph(floor, layout) {
  const nodes = [];
  const edges = [];

  const stairRightId = `F${floor}-STAIR-RIGHT`;
  const corridorRightId = `F${floor}-CORRIDOR-RIGHT`;
  const corridorLowerId = `F${floor}-CORRIDOR-LOWER`;
  const corridorLeftId = `F${floor}-CORRIDOR-LEFT`;
  const corridorTopBaseId = `F${floor}-CORRIDOR-TOP-BASE`;
  const corridorTopId = `F${floor}-CORRIDOR-TOP`;

  nodes.push(
    makeNode(stairRightId, 'Right Stair', floor, SPINE.stairRightX, SPINE.stairRightY, 'stair'),
    makeNode(corridorRightId, 'Right corridor', floor, SPINE.stairRightX, SPINE.lowerY, 'corridor'),
    makeNode(corridorLowerId, 'Lower corridor', floor, SPINE.connectorX, SPINE.lowerY, 'corridor'),
    makeNode(corridorLeftId, 'Left corridor', floor, SPINE.connectorX, SPINE.leftY, 'corridor'),
    makeNode(corridorTopBaseId, 'Top corridor base', floor, SPINE.topX, SPINE.topBaseY, 'junction'),
    makeNode(corridorTopId, 'Top corridor', floor, SPINE.topX, SPINE.topMidY, 'corridor')
  );

  edges.push(
    ...makeTwoWayEdge(
      stairRightId,
      corridorRightId,
      1,
      [
        { x: SPINE.stairRightX, y: SPINE.stairRightY },
        { x: SPINE.stairRightX, y: SPINE.lowerY },
      ],
      'stair-access'
    ),

    ...makeTwoWayEdge(
      corridorRightId,
      corridorLowerId,
      SPINE.stairRightX - SPINE.connectorX,
      [
        { x: SPINE.stairRightX, y: SPINE.lowerY },
        { x: SPINE.connectorX, y: SPINE.lowerY },
      ]
    ),

    ...makeTwoWayEdge(
      corridorLowerId,
      corridorLeftId,
      SPINE.lowerY - SPINE.leftY,
      [
        { x: SPINE.connectorX, y: SPINE.lowerY },
        { x: SPINE.connectorX, y: SPINE.leftY },
      ]
    ),

    ...makeTwoWayEdge(
      corridorLeftId,
      corridorTopBaseId,
      pathDistance([
        { x: SPINE.connectorX, y: SPINE.leftY },
        { x: SPINE.connectorX, y: SPINE.topBaseY },
        { x: SPINE.topX, y: SPINE.topBaseY },
      ]),
      [
        { x: SPINE.connectorX, y: SPINE.leftY },
        { x: SPINE.connectorX, y: SPINE.topBaseY },
        { x: SPINE.topX, y: SPINE.topBaseY },
      ]
    ),

    ...makeTwoWayEdge(
      corridorTopBaseId,
      corridorTopId,
      SPINE.topBaseY - SPINE.topMidY,
      [
        { x: SPINE.topX, y: SPINE.topBaseY },
        { x: SPINE.topX, y: SPINE.topMidY },
      ]
    )
  );

  layout.rooms.forEach((roomItem) => {
    makeBlockGraphNodesAndEdges(floor, roomItem, nodes, edges);
  });

  // Facilities also get nodes, but they are not added to roomsData search yet.
  // This keeps the map model ready for future search like Toilet / Lounge.
  layout.facilities.forEach((facility) => {
    makeBlockGraphNodesAndEdges(floor, facility, nodes, edges);
  });

  return { nodes, edges };
}

function makeRoomsData(layouts) {
  return Object.values(layouts)
    .flatMap((layout) => layout.rooms)
    .map((roomItem) => ({
      id: roomItem.id,
      displayName: `Eusoff Block C Room ${roomItem.id}`,
      name: roomItem.id,
      building: 'Eusoff Block C',
      floor: roomItem.floor,
      type: 'room',
      nodeId: roomItem.nodeId,
      displayPoint: {
        x: roomItem.x + roomItem.width / 2,
        y: roomItem.y + roomItem.height / 2,
      },
    }));
}

function makeBlockCData() {
  const blockCLayout = {
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

  Object.values(blockCLayout).forEach((layout) => {
    const floorGraph = makeFloorGraph(layout.floor, layout);
    graph.nodes.push(...floorGraph.nodes);
    graph.edges.push(...floorGraph.edges);
  });

  graph.nodes.push(
    makeNode('F1-ENTRANCE', 'Main Entrance', 1, SPINE.stairRightX, 625, 'entrance')
  );

  graph.edges.push(
    ...makeTwoWayEdge(
      'F1-ENTRANCE',
      'F1-CORRIDOR-RIGHT',
      83,
      [
        { x: SPINE.stairRightX, y: 625 },
        { x: SPINE.stairRightX, y: SPINE.lowerY },
      ],
      'entrance'
    )
  );

  [1, 2, 3].forEach((floor) => {
    graph.edges.push(
      makeEdge(`F${floor}-STAIR-RIGHT`, `F${floor + 1}-STAIR-RIGHT`, 85, null, 'stairs'),
      makeEdge(`F${floor + 1}-STAIR-RIGHT`, `F${floor}-STAIR-RIGHT`, 85, null, 'stairs')
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