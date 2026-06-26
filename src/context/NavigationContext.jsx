import { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { roomsData, graph } from '../data/blockCData';
import { astar } from '../utils/astar'; // ← STATIC IMPORT

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  // ── State ──────────────────────────────────────────────────────────────
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
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // ── Actions ────────────────────────────────────────────────────────────

  const setHighlightedRoom = useCallback((roomId) => {
    setHighlightedRoomId(roomId);
    setTimeout(() => setHighlightedRoomId(null), 2000);
  }, []);

  const clearHighlightedRoom = useCallback(() => {
    setHighlightedRoomId(null);
  }, []);

  const navigateTo = useCallback((view, preserveCard = false) => {
    setCurrentView(view);
    if (!preserveCard) setActiveCard(null);
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
    setHighlightedRoomId(room.id);

    if (currentView === 'navigation' && destinationRoomId && destinationRoomId !== room.id) {
      setRoute([]);
      setCurrentStepIndex(0);
    }

    setDestinationRoomId(room.id);
    setActiveCard('room_detail');
  }, [currentView, destinationRoomId]);

  const startNavigation = useCallback(() => {
    setCurrentView('navigation');
    setActiveCard(null);
  }, []);

  const setStartRoom = useCallback((roomId) => {
    setStartRoomId(roomId);
    setRoute([]);
    setCurrentStepIndex(0);
    setRouteError(null);
  }, []);

  // Run A* pathfinding — NOW USING STATIC IMPORT
  const calculateRoute = useCallback(() => {
    if (!startRoomId || !destinationRoomId) return;

    const startRoom = roomsData.find(r => r.id === startRoomId);
    const destRoom = roomsData.find(r => r.id === destinationRoomId);

    if (!startRoom?.nodeId || !destRoom?.nodeId) {
      setRouteError('Selected rooms are not connected to the navigation graph.');
      return;
    }

    setIsCalculating(true);
    setRouteError(null);

    try {
      const newRoute = astar(startRoom.nodeId, destRoom.nodeId, graph);

      if (newRoute && newRoute.length > 0) {
        setRoute(newRoute);
        setCurrentStepIndex(0);
        setCurrentFloor(startRoom.floor);
      } else {
        setRouteError('No path found between the selected rooms.');
      }
    } catch (err) {
      setRouteError('Failed to calculate route. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  }, [startRoomId, destinationRoomId]);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => prev + 1);
  }, []);

  const resetNavigation = useCallback(() => {
    setStartRoomId(null);
    setDestinationRoomId(null);
    setRoute([]);
    setCurrentStepIndex(0);
    setRouteError(null);
    setActiveCard(null);
  }, []);

  // ── Context value ──────────────────────────────────────────────────────
  const value = useMemo(() => ({
    // State
    currentView, selectedBlock, currentFloor, selectedRoom, activeCard,
    startRoomId, destinationRoomId, route, currentStepIndex,
    highlightedRoomId, isCalculating, routeError,

    // Actions
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStartRoom, calculateRoute, nextStep, resetNavigation,
    setHighlightedRoom, clearHighlightedRoom, setCurrentFloor,
  }), [
    currentView, selectedBlock, currentFloor, selectedRoom, activeCard,
    startRoomId, destinationRoomId, route, currentStepIndex,
    highlightedRoomId, isCalculating, routeError,
    navigateTo, selectBlock, startExplore, selectFloor, selectRoom,
    startNavigation, setStartRoom, calculateRoute, nextStep, resetNavigation,
    setHighlightedRoom, clearHighlightedRoom,
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