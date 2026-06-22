// src/context/NavigationContext.jsx
import { createContext, useState, useContext, useMemo, useCallback } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  // ========================================
  // STATE
  // ========================================
  
  // Current screen: 'home' | 'explore' | 'navigation'
  const [currentView, setCurrentView] = useState('home');
  
  // Selected building block: 'A' | 'B' | 'C' | 'D' | 'E'
  const [selectedBlock, setSelectedBlock] = useState('C');
  
  // Current floor: 1 | 2 | 3 | 4
  const [currentFloor, setCurrentFloor] = useState(1);
  
  // Currently selected room for details: 'C111' | null
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Active overlay card: 'block_info' | 'room_detail' | null
  const [activeCard, setActiveCard] = useState(null);
  
  // Navigation points
  const [startPoint, setStartPoint] = useState(null); // e.g., 'Dining Hall'
  const [destination, setDestination] = useState(null); // e.g., 'C111'
  
  // Route path (array of node IDs) and current step index
  const [routePath, setRoutePath] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // ========================================
  // ACTIONS
  // ========================================
  
  // Switch between main screens
  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    setActiveCard(null); // Reset overlay card when changing screens
  }, []);
  
  // Triggered when clicking A/B/C/D/E on HomeScreen
  const selectBlock = useCallback((block) => {
    setSelectedBlock(block);
    setCurrentFloor(1); // Reset to floor 1
    setActiveCard('block_info'); // Show BlockInfoCard overlay
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
  
  // Triggered when clicking a room on the map in ExploreScreen
  const selectRoom = useCallback((roomId) => {
    setSelectedRoom(roomId);
    setDestination(roomId);
    setActiveCard('room_detail'); // Show RoomDetailCard overlay
  }, []);
  
  // Triggered when clicking "Navigate there" inside RoomDetailCard
  const startNavigation = useCallback(() => {
    setCurrentView('navigation');
    setActiveCard(null);
  }, []);
  
  // Set the starting point (e.g., when user clicks a location on the map)
  const setStart = useCallback((locationName) => {
    setStartPoint(locationName);
  }, []);
  
  // Calculate route using A* algorithm (mocked for now)
  const calculateRoute = useCallback(() => {
    if (startPoint && destination) {
      // TODO: Minh - Integrate real A* algorithm here
      const mockPath = [startPoint, 'node_1', 'node_2', destination];
      setRoutePath(mockPath);
      setCurrentStepIndex(0);
    }
  }, [startPoint, destination]);
  
  // Move to the next step in the navigation guide
  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => prev + 1);
  }, []);
  
  // Reset all navigation states and return to HomeScreen
  const resetNavigation = useCallback(() => {
    setStartPoint(null);
    setDestination(null);
    setRoutePath([]);
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
    startPoint, destination, routePath, currentStepIndex,
    
    // Actions
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStart, calculateRoute, nextStep, resetNavigation
  }), [
    currentView, selectedBlock, currentFloor, selectedRoom, activeCard,
    startPoint, destination, routePath, currentStepIndex,
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStart, calculateRoute, nextStep, resetNavigation
  ]);
  
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook to easily consume the context in any component
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};