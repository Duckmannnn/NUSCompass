// src/screens/NavigationScreen.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { roomsData, graph } from '../data/blockCData';
import MapCanvas from '../components/map/MapCanvas';

export default function NavigationScreen() {
  const {
    startRoomId,
    destinationRoomId,
    route,
    currentStepIndex,
    currentFloor,
    highlightedRoomId,
    isCalculating,
    routeError,
    nextStep,
    navigateTo,
    resetNavigation,
    calculateRoute,
    setStartRoom,
    selectFloor,
    selectRoom,
  } = useNavigation();

  const [showStartSearch, setShowStartSearch] = useState(false);
  const [showDestSearch, setShowDestSearch] = useState(false);
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [localError, setLocalError] = useState(null);

  const startRoom = roomsData.find(r => r.id === startRoomId);
  const destinationRoom = roomsData.find(r => r.id === destinationRoomId);

  // ── Search filtering ───────────────────────────────────────────────────
  const filteredStartRooms = useMemo(() =>
    startSearchQuery
      ? roomsData.filter(r =>
          r.name.toLowerCase().includes(startSearchQuery.toLowerCase())
        ).slice(0, 5)
      : [],
    [startSearchQuery]
  );

  const filteredDestRooms = useMemo(() =>
    destSearchQuery
      ? roomsData.filter(r =>
          r.name.toLowerCase().includes(destSearchQuery.toLowerCase())
        ).slice(0, 5)
      : [],
    [destSearchQuery]
  );

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSelectStartRoom = useCallback((room) => {
    setStartRoom(room.id);
    setShowStartSearch(false);
    setStartSearchQuery('');
  }, [setStartRoom]);

  const handleSelectDestRoom = useCallback((room) => {
    selectRoom(room);
    setShowDestSearch(false);
    setDestSearchQuery('');
  }, [selectRoom]);

  // ── Group steps by floor (ONLY after route is calculated) ─────────────
  const stepsByFloor = useMemo(() => {
    if (route.length === 0) return {};

    const groups = {};
    
    route.slice(0, -1).forEach((nodeId, i) => {
      const currentNode = graph.nodes.find(n => n.id === nodeId);
      const nextNode = graph.nodes.find(n => n.id === route[i + 1]);
      const edge = graph.edges.find(e =>
        (e.from === nodeId && e.to === route[i + 1]) ||
        (e.from === route[i + 1] && e.to === nodeId)
      );

      if (!currentNode || !nextNode || !edge) return;

      const floor = currentNode.floor;
      
      if (!groups[floor]) {
        groups[floor] = {
          floor,
          steps: [],
          totalDistance: 0,
          hasStairs: false,
          nextFloor: null,
          firstStepIndex: i,
          lastStepIndex: i
        };
      }

      let action = '';
      let stepType = 'walk';
      
      if (edge.type === 'stairs') {
        action = currentNode.floor < nextNode.floor
          ? `Go up to Floor ${nextNode.floor}`
          : `Go down to Floor ${nextNode.floor}`;
        stepType = 'stairs';
        groups[floor].hasStairs = true;
        groups[floor].nextFloor = nextNode.floor;
      } else if (edge.type === 'door-access') {
        const room = roomsData.find(r => r.nodeId === nextNode.id);
        action = room ? `Enter ${room.name}` : 'Enter room';
        stepType = 'enter';
      } else if (edge.type === 'entrance') {
        action = 'Start from entrance';
        stepType = 'start';
      } else {
        const dx = nextNode.x - currentNode.x;
        const dy = nextNode.y - currentNode.y;
        const distance = Math.round(edge.distance / 10);
        
        if (Math.abs(dx) > Math.abs(dy)) {
          action = dx > 0 ? `Walk right ${distance}m` : `Walk left ${distance}m`;
        } else {
          action = dy > 0 ? `Walk down ${distance}m` : `Walk up ${distance}m`;
        }
        stepType = 'walk';
      }

      const distance = Math.round(edge.distance / 10);
      groups[floor].steps.push({ index: i, action, distance, stepType });
      groups[floor].totalDistance += distance;
      groups[floor].lastStepIndex = i;
    });

    return groups;
  }, [route]);

  // ── Generate description for each floor ─────────────────────────────────
  const floorDescriptions = useMemo(() => {
    const descriptions = {};
    
    Object.values(stepsByFloor).forEach(floorData => {
      let description = '';
      
      if (floorData.hasStairs) {
        const stepsBeforeStairs = floorData.steps.filter(s => s.stepType !== 'stairs');
        
        if (stepsBeforeStairs.length > 0) {
          description = `Walk to stairs → Floor ${floorData.nextFloor}`;
        } else {
          description = `Take stairs to Floor ${floorData.nextFloor}`;
        }
      } else if (floorData.steps.some(s => s.stepType === 'enter')) {
        const enterStep = floorData.steps.find(s => s.stepType === 'enter');
        description = enterStep?.action || 'Enter destination';
      } else if (floorData.steps.some(s => s.stepType === 'start')) {
        description = 'Start from entrance';
      } else {
        const totalDist = floorData.totalDistance;
        if (totalDist < 50) {
          description = `Walk ${totalDist}m to destination`;
        } else {
          description = `Walk ${totalDist}m through corridor`;
        }
      }
      
      descriptions[floorData.floor] = description;
    });
    
    return descriptions;
  }, [stepsByFloor]);

  // Get ordered list of floors (ONLY when route exists)
  const floorList = useMemo(() => {
    if (route.length === 0) return [];
    
    // Get the actual start and end floors from the route
    const startNode = graph.nodes.find(n => n.id === route[0]);
    const endNode = graph.nodes.find(n => n.id === route[route.length - 1]);
    
    const startFloor = startNode?.floor || 1;
    const endFloor = endNode?.floor || 1;
    
    const floors = Object.keys(stepsByFloor).map(Number);
    
    // Sort based on direction of travel
    if (startFloor > endFloor) {
      return floors.sort((a, b) => b - a); // Descending: 4, 3, 2, 1
    } else {
      return floors.sort((a, b) => a - b); // Ascending: 1, 2, 3, 4
    }
  }, [stepsByFloor, route, graph.nodes]);

  const currentIndex = floorList.indexOf(currentFloor);
  const prevFloor = currentIndex > 0 ? floorList[currentIndex - 1] : null;
  const nextFloor = currentIndex < floorList.length - 1 ? floorList[currentIndex + 1] : null;

  // ── Navigate to specific floor ─────────────────────────────────────────
  const goToFloor = useCallback((targetFloor) => {
    if (!stepsByFloor[targetFloor]) return;
    
    const floorData = stepsByFloor[targetFloor];
    const targetStepIndex = floorData.firstStepIndex;
    
    // Step forward to reach target floor
    if (targetStepIndex > currentStepIndex) {
      for (let i = currentStepIndex; i < targetStepIndex; i++) {
        nextStep();
      }
    }
    
    selectFloor(targetFloor);
  }, [currentStepIndex, stepsByFloor, nextStep, selectFloor]);

  const handleNextFloor = useCallback(() => {
    if (nextFloor) goToFloor(nextFloor);
  }, [nextFloor, goToFloor]);

  const handlePrevFloor = useCallback(() => {
    if (prevFloor) goToFloor(prevFloor);
  }, [prevFloor, goToFloor]);

  const handleSmartButton = useCallback(() => {
    if (!startRoomId) {
      navigateTo('home'); // ← Về HomeScreen thay vì ExploreScreen
    } else if (!destinationRoomId) {
      setLocalError('Please select a destination first.');
    } else if (route.length === 0) {
      setLocalError(null);
      calculateRoute();
    } else if (nextFloor) {
      handleNextFloor();
    }
  }, [startRoomId, destinationRoomId, route.length, nextFloor, navigateTo, calculateRoute, handleNextFloor]);

  // ── Effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (route.length > 0 && currentStepIndex === 0) {
      const startNode = graph.nodes.find(n => n.id === route[0]);
      if (startNode?.floor) selectFloor(startNode.floor);
    }
  }, [route, currentStepIndex, selectFloor]);

  useEffect(() => {
    if (localError && destinationRoomId) setLocalError(null);
  }, [destinationRoomId, localError]);

  // ── Derived UI values ──────────────────────────────────────────────────
  const isButtonDisabled = isCalculating || (route.length > 0 && currentStepIndex >= route.length - 1);
  const displayError = routeError || localError;
  const hasRoute = route.length > 0;

  const getButtonText = () => {
    if (isCalculating) return 'Calculating...';
    if (!startRoomId) return 'Back to Home'; // ← Đổi từ 'Exploring' sang 'Back to Home'
    if (!destinationRoomId) return 'Select destination';
    if (route.length === 0) return 'Calculate route';
    if (currentStepIndex >= route.length - 1) return 'Arrived!';
    if (nextFloor) return `Go to Floor ${nextFloor}`;
    return 'Finish';
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>

      {/* Map area */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, backgroundColor: 'white', borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden',
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
        </div>
      </div>

      {/* Navigation panel */}
      <div style={{
        width: '400px', backgroundColor: 'white', padding: '30px',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.1)', overflowY: 'auto',
        display: 'flex', flexDirection: 'column'
      }}>
        <h2 style={{ margin: '0 0 25px 0', fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
          Navigation
        </h2>

        {/* Route inputs */}
        <div style={{
          marginBottom: '25px', padding: '20px', backgroundColor: '#f9fafb',
          borderRadius: '12px', border: '1px solid #e5e7eb'
        }}>
          {/* Starting point */}
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
                    width: '100%', padding: '12px', fontSize: '14px',
                    border: '2px solid #3b82f6', borderRadius: '8px',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {startSearchQuery && filteredStartRooms.length > 0 && (
                  <div style={{
                    marginTop: '8px', backgroundColor: 'white', borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '200px',
                    overflowY: 'auto', border: '1px solid #e5e7eb'
                  }}>
                    {filteredStartRooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => handleSelectStartRoom(room)}
                        style={{ padding: '10px 15px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{room.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Floor {room.floor} · {room.type}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setShowStartSearch(false); setStartSearchQuery(''); }}
                  style={{
                    marginTop: '8px', padding: '8px 16px', backgroundColor: 'transparent',
                    border: '1px solid #d1d5db', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '13px', color: '#6b7280'
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
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: '16px', fontWeight: '600',
                  color: startRoom ? '#1e40af' : '#6b7280'
                }}
                onMouseOver={e => { if (!startRoom) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                onMouseOut={e => { if (!startRoom) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              >
                {startRoom ? `📍 ${startRoom.name} (Floor ${startRoom.floor})` : '+ Select starting point'}
              </div>
            )}
          </div>

          {/* Destination */}
          <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '15px' }}>
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
                    width: '100%', padding: '12px', fontSize: '14px',
                    border: '2px solid #3b82f6', borderRadius: '8px',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                {destSearchQuery && filteredDestRooms.length > 0 && (
                  <div style={{
                    marginTop: '8px', backgroundColor: 'white', borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '200px',
                    overflowY: 'auto', border: '1px solid #e5e7eb'
                  }}>
                    {filteredDestRooms.map(room => (
                      <div
                        key={room.id}
                        onClick={() => handleSelectDestRoom(room)}
                        style={{ padding: '10px 15px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{room.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Floor {room.floor} · {room.type}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setShowDestSearch(false); setDestSearchQuery(''); }}
                  style={{
                    marginTop: '8px', padding: '8px 16px', backgroundColor: 'transparent',
                    border: '1px solid #d1d5db', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '13px', color: '#6b7280'
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
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: '16px', fontWeight: '600',
                  color: destinationRoom ? '#1e40af' : '#6b7280'
                }}
                onMouseOver={e => { if (!destinationRoom) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                onMouseOut={e => { if (!destinationRoom) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              >
                {destinationRoom ? `🎯 ${destinationRoom.name} (Floor ${destinationRoom.floor})` : '+ Select destination'}
              </div>
            )}
          </div>
        </div>

        {/* Inline error message */}
        {displayError && (
          <div style={{
            padding: '12px 16px', backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5', borderRadius: '8px',
            marginBottom: '16px', color: '#dc2626', fontSize: '14px'
          }}>
            {displayError}
          </div>
        )}

        {/* Calculating indicator with spinner */}
        {isCalculating && (
          <div style={{
            padding: '12px 16px', backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd', borderRadius: '8px',
            marginBottom: '16px', color: '#2563eb',
            fontSize: '14px', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <span style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid #93c5fd',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            Calculating route…
          </div>
        )}

        {/* ── ROUTE OVERVIEW - ONLY SHOW AFTER CALCULATION ─────────────── */}
        {hasRoute && floorList.length > 0 && (
          <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
              Route Overview
            </h3>
            
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              {floorList.map((floor, index) => {
                const floorData = stepsByFloor[floor];
                const isCurrentFloor = floor === currentFloor;
                const isPastFloor = index < currentIndex;
                const description = floorDescriptions[floor] || 'Walk to destination';
                
                return (
                  <div
                    key={floor}
                    onClick={() => goToFloor(floor)}
                    style={{
                      padding: '16px',
                      borderBottom: index < floorList.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: isCurrentFloor ? '#dbeafe' : isPastFloor ? '#f9fafb' : 'white',
                      opacity: isPastFloor ? 0.6 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => {
                      if (!isCurrentFloor) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isCurrentFloor) {
                        e.currentTarget.style.backgroundColor = isPastFloor ? '#f9fafb' : 'white';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold', color: isCurrentFloor ? '#1e40af' : '#374151', fontSize: '16px' }}>
                        {isPastFloor ? '✓' : isCurrentFloor ? '→' : '○'} Floor {floor}
                      </div>
                      {floorData.hasStairs && floorData.nextFloor && (
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#fbbf24',
                          color: '#92400e',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          ↓ Floor {floorData.nextFloor}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
                      {description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FLOOR NAVIGATION BUTTONS - ONLY SHOW AFTER CALCULATION ──── */}
        {hasRoute && (
          <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrevFloor}
              disabled={!prevFloor || isCalculating}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: !prevFloor || isCalculating ? '#e5e7eb' : 'white',
                color: !prevFloor || isCalculating ? '#9ca3af' : '#374151',
                border: '2px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: !prevFloor || isCalculating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                if (prevFloor && !isCalculating) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }
              }}
              onMouseOut={e => {
                if (prevFloor && !isCalculating) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
            >
              ← Floor {prevFloor}
            </button>

            <button
              onClick={handleNextFloor}
              disabled={!nextFloor || isCalculating}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: !nextFloor || isCalculating ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: !nextFloor || isCalculating ? 'not-allowed' : 'pointer',
                boxShadow: nextFloor && !isCalculating ? '0 4px 8px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                if (nextFloor && !isCalculating) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={e => {
                if (nextFloor && !isCalculating) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Floor {nextFloor} →
            </button>
          </div>
        )}

        {/* Primary action button - ALWAYS SHOW (changed behavior) */}
        {!hasRoute && (
          <button
            onClick={handleSmartButton}
            disabled={isCalculating} // ← Chỉ disabled khi đang calculating
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '25px',
              backgroundColor: isCalculating ? '#9ca3af' : '#3b82f6', // ← Luôn xanh khi không calculating
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isCalculating ? 'not-allowed' : 'pointer',
              boxShadow: !isCalculating ? '0 4px 8px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => {
              if (!isCalculating) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={e => {
              if (!isCalculating) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {getButtonText()}
          </button>
        )}

        {/* Cancel / reset button */}
        <button
          onClick={resetNavigation}
          style={{
            width: '100%', padding: '14px', marginTop: '12px',
            backgroundColor: 'transparent', color: '#ef4444',
            border: '1px solid #ef4444', borderRadius: '12px',
            fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Cancel
        </button>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}