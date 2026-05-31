function buildNodeMap(nodes) {
  return new Map(nodes.map((node) => [node.id, node]));
}

function getNodeLabel(node, selectedRoom) {
  if (!node) {
    return 'Unknown point';
  }

  if (selectedRoom && node.id === selectedRoom.nodeId) {
    return selectedRoom.displayName ?? selectedRoom.name ?? node.id;
  }

  return node.label ?? node.name ?? node.id;
}

function createInstruction(previousNode, currentNode, nextNode, selectedRoom, index) {
  const currentLabel = getNodeLabel(currentNode, selectedRoom);

  if (index === 0) {
    return `Start at ${currentLabel}.`;
  }

  if (previousNode && previousNode.floor !== currentNode.floor) {
    return `Take the stairs to Floor ${currentNode.floor}.`;
  }

  if (!nextNode) {
    return `Arrive at ${currentLabel}.`;
  }

  return `Walk to ${currentLabel}.`;
}

export default function StepPanel({ graph, route, selectedRoom }) {
  const nodes = graph.nodes ?? [];
  const nodeMap = buildNodeMap(nodes);

  const routeNodes = route.map((nodeId) => nodeMap.get(nodeId)).filter(Boolean);

  return (
    <div className="info-card">
      <h2>Step-by-step directions</h2>

      {routeNodes.length > 0 ? (
        <ol className="step-list">
          {routeNodes.map((node, index) => {
            const previousNode = routeNodes[index - 1];
            const nextNode = routeNodes[index + 1];

            return (
              <li key={`${node.id}-${index}`}>
                {createInstruction(
                  previousNode,
                  node,
                  nextNode,
                  selectedRoom,
                  index
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p>Select a room to view navigation steps.</p>
      )}
    </div>
  );
}