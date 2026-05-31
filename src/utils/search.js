function getRoomsArray(roomsData) {
  if (Array.isArray(roomsData)) {
    return roomsData;
  }

  if (Array.isArray(roomsData?.rooms)) {
    return roomsData.rooms;
  }

  return [];
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}

function getRoomSearchText(room) {
  return [
    room.id,
    room.name,
    room.code,
    room.label,
    room.roomNumber,
    room.nodeId,
    room.floor,
    room.type,
  ]
    .map(normalizeText)
    .join(" ");
}

export function searchRooms(query, roomsData, limit = 8) {
  const rooms = getRoomsArray(roomsData);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  return rooms
    .filter((room) => getRoomSearchText(room).includes(normalizedQuery))
    .slice(0, limit);
}

export function findRoomByNodeId(nodeId, roomsData) {
  const rooms = getRoomsArray(roomsData);

  return rooms.find((room) => room.nodeId === nodeId) ?? null;
}

export function getRoomNodeId(room) {
  return room?.nodeId ?? room?.node_id ?? room?.node ?? room?.id ?? null;
}