// src/screens/NavigationScreen.jsx
import { useNavigation } from '../context/NavigationContext';
import { roomsData, graph, blockCLayout } from '../data/blockCData';

export default function NavigationScreen() {
  const { 
    startRoomId, 
    destinationRoomId, 
    route, 
    currentStepIndex,
    currentFloor,
    nextStep,
    navigateTo,
    resetNavigation,
    calculateRoute,
    setStartRoom
  } = useNavigation();

  // Get room details
  const startRoom = roomsData.find(r => r.id === startRoomId);
  const destinationRoom = roomsData.find(r => r.id === destinationRoomId);

  // Smart button logic
  const handleSmartButton = () => {
    if (!startRoomId) {
      // No starting point yet → go back to ExploreScreen to select one
      navigateTo('explore');
    } else if (route.length === 0) {
      // Has starting point but no route yet → calculate route
      calculateRoute();
    } else {
      // Has route → move to next step
      nextStep();
    }
  };

  // Determine button text and disabled state
  const getButtonText = () => {
    if (!startRoomId) return 'Start navigation';
    if (route.length === 0) return 'Calculate route';
    if (currentStepIndex >= route.length - 1) return 'Arrived!';
    return 'Next step';
  };

  const isButtonDisabled = () => {
    if (!startRoomId) return false;
    if (route.length === 0) return false;
    if (currentStepIndex >= route.length - 1) return true;
    return false;
  };

  // Generate step guide from route
  const generateStepGuide = () => {
    if (route.length === 0) return [];

    const steps = [];
    
    for (let i = 0; i < route.length - 1; i++) {
      const currentNode = graph.nodes.find(n => n.id === route[i]);
      const nextNode = graph.nodes.find(n => n.id === route[i + 1]);
      const edge = graph.edges.find(e => 
        (e.from === route[i] && e.to === route[i + 1]) ||
        (e.from === route[i + 1] && e.to === route[i])
      );

      if (!currentNode || !nextNode || !edge) continue;

      let action = '';
      
      if (edge.type === 'stairs') {
        const goingUp = currentNode.floor < nextNode.floor;
        action = goingUp ? `Go up stairs to floor ${nextNode.floor}` : `Go down stairs to floor ${nextNode.floor}`;
      } else if (edge.type === 'door-access') {
        const room = roomsData.find(r => r.nodeId === nextNode.id);
        action = room ? `Enter ${room.name}` : 'Enter room';
      } else if (edge.type === 'entrance') {
        action = 'Start from entrance';
      } else {
        // Walk action - calculate direction
        const dx = nextNode.x - currentNode.x;
        const dy = nextNode.y - currentNode.y;
        const distance = edge.distance;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          action = dx > 0 ? `Walk right ${distance}m` : `Walk left ${distance}m`;
        } else {
          action = dy > 0 ? `Walk down ${distance}m` : `Walk up ${distance}m`;
        }
      }

      steps.push({
        index: i,
        action,
        floor: currentNode.floor,
        distance: edge.distance
      });
    }

    return steps;
  };

  const steps = generateStepGuide();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex' }}>
      {/* Map Area */}
      <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '20px' }}>
        <h2>Navigation - Floor {currentFloor}</h2>
        <p>Route will be drawn here (Tuấn will implement MapCanvas with route overlay)</p>
        
        {/* Temporary route visualization */}
        {route.length > 0 && (
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h3>Route nodes:</h3>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {route.map((nodeId, index) => {
                const node = graph.nodes.find(n => n.id === nodeId);
                return (
                  <div key={index} style={{ 
                    padding: '5px', 
                    backgroundColor: index === currentStepIndex ? '#dbeafe' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '2px'
                  }}>
                    {index + 1}. {nodeId} (Floor {node?.floor})
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Info Panel */}
      <div style={{
        width: '400px',
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0 }}>Navigation</h2>
        
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Starting point:</strong> {startRoom ? startRoom.name : 'Not selected'}
          </div>
          <div>
            <strong>Where you wanna go:</strong> {destinationRoom ? destinationRoom.name : 'Not selected'}
          </div>
        </div>

        {/* Step Guide */}
        {steps.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Step guide</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              {steps.map((step, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '15px',
                    borderBottom: index < steps.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: index === currentStepIndex ? '#dbeafe' : 'white',
                    borderLeft: index === currentStepIndex ? '4px solid #3b82f6' : '4px solid transparent'
                  }}
                >
                  <div style={{ fontWeight: index === currentStepIndex ? 'bold' : 'normal' }}>
                    {step.action}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    Floor {step.floor} · {step.distance}m
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Button */}
        <button
          onClick={handleSmartButton}
          disabled={isButtonDisabled()}
          style={{
            width: '100%',
            padding: '15px',
            marginTop: '20px',
            backgroundColor: isButtonDisabled() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isButtonDisabled() ? 'not-allowed' : 'pointer'
          }}
        >
          {getButtonText()}
        </button>

        {/* Cancel button */}
        <button
          onClick={resetNavigation}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '10px',
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}