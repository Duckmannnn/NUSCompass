// src/context/NavigationContext.jsx
import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { roomsData, graph } from '../data/blockCData';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  // ========================================
  // STATE
  // ========================================
  
  const [highlightedRoomId, setHighlightedRoomId] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedBlock, setSelectedBlock] = useState('C');
  const [currentFloor, setCurrentFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [startRoomId, setStartRoomId] = useState(null);
  const [destinationRoomId, setDestinationRoomId] = useState(null);
  const [route, setRoute] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // ========================================
  // ACTIONS
  // ========================================
  
  const setHighlightedRoom = useCallback((roomId) => {
    setHighlightedRoomId(roomId);
    setTimeout(() => {
      setHighlightedRoomId(null);
    }, 2000);
  }, []);

  const navigateTo = useCallback((view, preserveCard = false) => {
    setCurrentView(view);
    if (!preserveCard) {
      setActiveCard(null);
    }
  }, []);
  
  const selectBlock = useCallback((block) => {
    setSelectedBlock(block);
    setCurrentFloor(1);
    setActiveCard('block_info');
  }, []);
  
  const startExplore = useCallback(() => {
    setCurrentView('explore');
    setActiveCard(null);
  }, []);
  
  const selectFloor = useCallback((floor) => {
    setCurrentFloor(floor);
  }, []);
  
  const selectRoom = useCallback((room) => {
    setSelectedRoom(room);
    setCurrentFloor(room.floor);
    
    // Reset route when changing destination in navigation screen
    setDestinationRoomId((prevDestId) => {
      if (currentView === 'navigation' && prevDestId && prevDestId !== room.id) {
        setRoute([]);
        setCurrentStepIndex(0);
      }
      return room.id;
    });
    
    setActiveCard('room_detail');
  }, [currentView]);

  const startNavigation = useCallback(() => {
    setCurrentView('navigation');
    setActiveCard(null);
  }, []);
  
  const setStartRoom = useCallback((roomId) => {
    setStartRoomId(roomId);
    // Reset route when start room changes
    setRoute([]);
    setCurrentStepIndex(0);
  }, []);
  
  // Calculate route using A*
  const calculateRoute = useCallback(() => {
    console.log('=== calculateRoute called ===');
    console.log('startRoomId:', startRoomId);
    console.log('destinationRoomId:', destinationRoomId);
    
    if (!startRoomId || !destinationRoomId) {
      console.log('❌ Missing start or destination');
      return;
    }
    
    const startRoom = roomsData.find(r => r.id === startRoomId);
    const destRoom = roomsData.find(r => r.id === destinationRoomId);
    
    console.log('startRoom:', startRoom);
    console.log('destRoom:', destRoom);
    
    if (!startRoom?.nodeId || !destRoom?.nodeId) {
      console.log('❌ Missing node IDs');
      return;
    }
    
    console.log('🚀 Calculating route from', startRoom.nodeId, 'to', destRoom.nodeId);
    console.log('graph.nodes.length:', graph.nodes.length);
    console.log('graph.edges.length:', graph.edges.length);
    
    // Import astar dynamically
    import('../utils/astar').then(({ astar }) => {
      console.log('✅ A* imported successfully');
      
      const newRoute = astar(startRoom.nodeId, destRoom.nodeId, graph);
      console.log('📍 Route result:', newRoute);
      console.log('📍 Route length:', newRoute ? newRoute.length : 0);
      
      if (newRoute && newRoute.length > 0) {
        setRoute(newRoute);
        setCurrentStepIndex(0);
        
        // Switch to start room's floor to see beginning of route
        setCurrentFloor(startRoom.floor);
        console.log('✅ Route set successfully');
      } else {
        console.error('❌ A* returned empty route or null');
        alert('Cannot find route between these rooms. They might not be connected.');
      }
    }).catch(err => {
      console.error('❌ A* import error:', err);
    });
  }, [startRoomId, destinationRoomId]);
  
  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => prev + 1);
  }, []);
  
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
    currentView, 
    selectedBlock, 
    currentFloor, 
    selectedRoom, 
    activeCard,
    startRoomId, 
    destinationRoomId, 
    route, 
    currentStepIndex, 
    highlightedRoomId,
    
    // Actions
    navigateTo, 
    selectBlock, 
    startExplore, 
    selectFloor, 
    selectRoom,
    startNavigation, 
    setStartRoom, 
    calculateRoute, 
    nextStep, 
    resetNavigation,
    setHighlightedRoom,
    setCurrentFloor,  // ← THÊM DÒNG NÀY
    setRoute,         // ← THÊM DÒNG NÀY (cho advanced use)
    setCurrentStepIndex  // ← THÊM DÒNG NÀY
  }), [
    currentView, selectedBlock, currentFloor, selectedRoom, activeCard,
    startRoomId, destinationRoomId, route, currentStepIndex, highlightedRoomId,
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStartRoom, calculateRoute, nextStep, resetNavigation,
    setHighlightedRoom, setCurrentFloor, setRoute, setCurrentStepIndex
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