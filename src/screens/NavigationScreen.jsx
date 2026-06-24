// src/screens/NavigationScreen.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { roomsData, graph, blockCLayout } from '../data/blockCData';
import MapCanvas from '../components/map/MapCanvas';

export default function NavigationScreen() {
  const { 
    startRoomId, 
    destinationRoomId, 
    route, 
    currentStepIndex,
    currentFloor,
    highlightedRoomId,  
    nextStep,
    navigateTo,
    resetNavigation,
    calculateRoute,
    setStartRoom,
    selectFloor,
    selectRoom,
    setCurrentFloor
  } = useNavigation();

  const [showStartSearch, setShowStartSearch] = useState(false);
  const [showDestSearch, setShowDestSearch] = useState(false);
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [destSearchQuery, setDestSearchQuery] = useState('');

  const startRoom = roomsData.find(r => r.id === startRoomId);
  const destinationRoom = roomsData.find(r => r.id === destinationRoomId);

  // Calculate route segment for current floor
  const currentFloorRoute = useMemo(() => {
    if (route.length === 0) return [];
    
    const segment = [];
    let inSegment = false;
    
    for (let i = 0; i < route.length; i++) {
      const nodeId = route[i];
      const node = graph.nodes.find(n => n.id === nodeId);
      
      if (node && node.floor === currentFloor) {
        segment.push(nodeId);
        inSegment = true;
      } else if (inSegment) {
        // We've left the current floor, stop
        break;
      }
    }
    
    return segment;
  }, [route, currentFloor]);

  const filteredStartRooms = startSearchQuery
    ? roomsData.filter(room => 
        room.name.toLowerCase().includes(startSearchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const filteredDestRooms = destSearchQuery
    ? roomsData.filter(room => 
        room.name.toLowerCase().includes(destSearchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectStartRoom = (room) => {
    setStartRoom(room.id);
    setShowStartSearch(false);
    setStartSearchQuery('');
  };

  const handleSelectDestRoom = (room) => {
    selectRoom(room);
    setShowDestSearch(false);
    setDestSearchQuery('');
  };

  const handleNextStep = () => {
    if (currentStepIndex < route.length - 1) {
      nextStep();
      
      // Auto-switch floor based on next step's node
      const nextStepIndex = currentStepIndex + 1;
      const nextNodeId = route[nextStepIndex];
      const nextNode = graph.nodes.find(n => n.id === nextNodeId);
      
      if (nextNode && nextNode.floor && nextNode.floor !== currentFloor) {
        setCurrentFloor(nextNode.floor);
      }
    }
  };

  const handleSmartButton = () => {
    if (!startRoomId) {
      navigateTo('explore');
    } else if (!destinationRoomId) {
      alert('Please select a destination first');
    } else if (route.length === 0) {
      calculateRoute();
    } else {
      handleNextStep();
    }
  };

  // Auto-switch floor when route is calculated
  useEffect(() => {
    if (route.length > 0 && currentStepIndex === 0) {
      const startNodeId = route[0];
      const startNode = graph.nodes.find(n => n.id === startNodeId);
      
      if (startNode && startNode.floor) {
        setCurrentFloor(startNode.floor);
      }
    }
  }, [route, currentStepIndex, setCurrentFloor]);

  const getButtonText = () => {
    if (!startRoomId) return 'Start navigation';
    if (!destinationRoomId) return 'Select destination';
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
        const dx = nextNode.x - currentNode.x;
        const dy = nextNode.y - currentNode.y;
        const distance = Math.round(edge.distance / 10);
        
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
        distance: Math.round(edge.distance / 10)
      });
    }

    return steps;
  };

  const steps = generateStepGuide();

  return (
    <div style={{ 
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      {/* Map Area - Left side (60%) */}
      <div style={{ 
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <MapCanvas 
            currentFloor={currentFloor}
            route={route}
            currentStepIndex={currentStepIndex}
            highlightedRoomId={highlightedRoomId}
            startRoomId={startRoomId}
            graph={graph}
          />
          
          {/* Route info overlay */}
          {route.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                Route nodes: {route.length}
              </div>
              <div style={{ fontSize: '12px', color: '#374151' }}>
                Step {currentStepIndex + 1} of {route.length - 1}
              </div>
              <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '5px', fontWeight: '600' }}>
                Current floor: {currentFloor}
              </div>
              {currentFloorRoute && currentFloorRoute.length > 0 && (
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '3px' }}>
                  Showing {currentFloorRoute.length} nodes on this floor
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Panel - Right side (40%) */}
      <div style={{
        width: '400px',
        backgroundColor: 'white',
        padding: '30px',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ 
          margin: '0 0 25px 0',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          Navigation
        </h2>
        
        {/* Route Info with Search Bars */}
        <div style={{ 
          marginBottom: '25px',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          {/* Starting Point */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px', fontWeight: '600' }}>
              STARTING POINT
            </div>
            {showStartSearch ? (
              <div>
                <input
                  type="text"
                  placeholder="Search starting point..."
                  value={startSearchQuery}
                  onChange={(e) => setStartSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {startSearchQuery && filteredStartRooms.length > 0 && (
                  <div style={{ 
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb'
                  }}>
                    {filteredStartRooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => handleSelectStartRoom(room)}
                        style={{
                          padding: '10px 15px',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{room.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Floor {room.floor} · {room.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowStartSearch(false);
                    setStartSearchQuery('');
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setShowStartSearch(true)}
                style={{
                  padding: '14px',
                  backgroundColor: startRoom ? '#dbeafe' : '#f9fafb',
                  border: `2px dashed ${startRoom ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: startRoom ? '#1e40af' : '#6b7280'
                }}
                onMouseOver={(e) => {
                  if (!startRoom) e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  if (!startRoom) e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
              >
                {startRoom ? `📍 ${startRoom.name} (Floor ${startRoom.floor})` : '+ Select starting point'}
              </div>
            )}
          </div>
          
          <div style={{ 
            borderTop: '2px dashed #e5e7eb',
            paddingTop: '15px'
          }}>
            {/* Destination */}
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px', fontWeight: '600' }}>
              WHERE YOU WANNA GO
            </div>
            {showDestSearch ? (
              <div>
                <input
                  type="text"
                  placeholder="Search destination..."
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {destSearchQuery && filteredDestRooms.length > 0 && (
                  <div style={{ 
                    marginTop: '8px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb'
                  }}>
                    {filteredDestRooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => handleSelectDestRoom(room)}
                        style={{
                          padding: '10px 15px',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{room.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Floor {room.floor} · {room.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowDestSearch(false);
                    setDestSearchQuery('');
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setShowDestSearch(true)}
                style={{
                  padding: '14px',
                  backgroundColor: destinationRoom ? '#dbeafe' : '#f9fafb',
                  border: `2px dashed ${destinationRoom ? '#3b82f6' : '#d1d5db'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: destinationRoom ? '#1e40af' : '#6b7280'
                }}
                onMouseOver={(e) => {
                  if (!destinationRoom) e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  if (!destinationRoom) e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
              >
                {destinationRoom ? `🎯 ${destinationRoom.name} (Floor ${destinationRoom.floor})` : '+ Select destination'}
              </div>
            )}
          </div>
        </div>

        {/* Step Guide */}
        {steps.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            flex: 1,
            overflowY: 'auto'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Step guide
            </h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              {steps.map((step, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '18px',
                    borderBottom: index < steps.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: index === currentStepIndex ? '#dbeafe' : 'white',
                    borderLeft: index === currentStepIndex ? '4px solid #3b82f6' : '4px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ 
                    fontWeight: index === currentStepIndex ? 'bold' : '500',
                    color: index === currentStepIndex ? '#1e40af' : '#374151',
                    marginBottom: '5px'
                  }}>
                    {step.action}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: index === currentStepIndex ? '#3b82f6' : '#9ca3af'
                  }}>
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
            padding: '16px',
            marginTop: '25px',
            backgroundColor: isButtonDisabled() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: isButtonDisabled() ? 'not-allowed' : 'pointer',
            boxShadow: isButtonDisabled() ? 'none' : '0 4px 8px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isButtonDisabled()) {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!isButtonDisabled()) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {getButtonText()}
        </button>

        {/* Cancel button */}
        <button
          onClick={resetNavigation}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '12px',
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}