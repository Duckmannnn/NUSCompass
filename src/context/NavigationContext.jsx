// src/context/NavigationContext.jsx
import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { roomsData, graph } from '../data/blockCData';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  // ========================================
  // STATE
  // ========================================
  
  // Current screen: 'home' | 'explore' | 'navigation'
  const [currentView, setCurrentView] = useState('home');
  
  // Selected building block (currently only 'C')
  const [selectedBlock, setSelectedBlock] = useState('C');
  
  // Current floor: 1 | 2 | 3 | 4
  const [currentFloor, setCurrentFloor] = useState(1);
  
  // Selected room for details (room object from roomsData)
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Active overlay card: 'block_info' | 'room_detail' | null
  const [activeCard, setActiveCard] = useState(null);
  
  // Navigation points (room IDs)
  const [startRoomId, setStartRoomId] = useState(null);
  const [destinationRoomId, setDestinationRoomId] = useState(null);
  
  // Route (array of node IDs from A*)
  const [route, setRoute] = useState([]);
  
  // Current step index in navigation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // ========================================
  // ACTIONS
  // ========================================
  
  // Switch between main screens
  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    setActiveCard(null);
  }, []);
  
  // Triggered when clicking A/B/C/D/E on HomeScreen
  const selectBlock = useCallback((block) => {
    setSelectedBlock(block);
    setCurrentFloor(1);
    setActiveCard('block_info');
  }, []);
  
  // Triggered when clicking "Explore" inside BlockInfoCard
  const startExplore = useCallback(() => {
    setCurrentView('explore');
    setActiveCard(null);
  }, []);
  
  // Triggered when clicking Floor 1/2/3/4
  const selectFloor = useCallback((floor) => {
    setCurrentFloor(floor);
  }, []);
  
  // Triggered when clicking a room on the map
  const selectRoom = useCallback((room) => {
    setSelectedRoom(room);
    setDestinationRoomId(room.id);
    setActiveCard('room_detail');
  }, []);
  
  // Triggered when clicking "Navigate there" inside RoomDetailCard
  const startNavigation = useCallback(() => {
    setCurrentView('navigation');
    setActiveCard(null);
  }, []);
  
  // Set starting point (room ID)
  const setStartRoom = useCallback((roomId) => {
    setStartRoomId(roomId);
  }, []);
  
  // Calculate route using A*
  const calculateRoute = useCallback(() => {
    if (!startRoomId || !destinationRoomId) return;
    
    const startRoom = roomsData.find(r => r.id === startRoomId);
    const destRoom = roomsData.find(r => r.id === destinationRoomId);
    
    if (!startRoom?.nodeId || !destRoom?.nodeId) return;
    
    // Import astar dynamically to avoid circular dependency
    import('../utils/astar').then(({ astar }) => {
      const newRoute = astar(startRoom.nodeId, destRoom.nodeId, graph);
      setRoute(newRoute);
      setCurrentStepIndex(0);
      setCurrentFloor(destRoom.floor);
    });
  }, [startRoomId, destinationRoomId]);
  
  // Move to next step
  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => prev + 1);
  }, []);
  
  // Reset navigation
  const resetNavigation = useCallback(() => {
    setStartRoomId(null);
    setDestinationRoomId(null);
    setRoute([]);
    setCurrentStepIndex(0);
    setCurrentView('home');
    setActiveCard(null);
  }, []);
  
  // ========================================
  // VALUE
  // ========================================
  
  const value = useMemo(() => ({
    // State
    currentView, selectedBlock, currentFloor, selectedRoom, activeCard,
    startRoomId, destinationRoomId, route, currentStepIndex,
    
    // Actions
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStartRoom, calculateRoute, nextStep, resetNavigation
  }), [
    currentView, selectedBlock, currentFloor, selectedRoom, activeCard,
    startRoomId, destinationRoomId, route, currentStepIndex,
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStartRoom, calculateRoute, nextStep, resetNavigation
  ]);
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};