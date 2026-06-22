// src/screens/ExploreScreen.jsx
import { useNavigation } from '../context/NavigationContext';
import FloorSelectorCard from '../components/cards/FloorSelectorCard';
import RoomDetailCard from '../components/cards/RoomDetailCard';

export default function ExploreScreen() {
  // Get state and actions from Context
  const { 
    selectedBlock, 
    currentFloor, 
    activeCard, 
    selectRoom,
    navigateTo 
  } = useNavigation();

  // Triggered when user clicks on a room on the map
  const handleRoomClick = (roomId) => {
    selectRoom(roomId);
    // Context will automatically set activeCard = 'room_detail'
  };

  // Triggered when user clicks "Back" button
  const handleBack = () => {
    navigateTo('home');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* TODO: Tuan - Replace this placeholder with MapCanvas component */}
      {/* MapCanvas will render SVG map, handle zoom/pan, and room clicks */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#6b7280'
      }}>
        🗺️ Map Area - Block {selectedBlock} - Floor {currentFloor}
        <br />
        <small>(Tuấn will implement MapCanvas here)</small>
      </div>

      {/* Floor Selector Card - Always visible */}
      <FloorSelectorCard />

      {/* Room Detail Card - Only show when activeCard is 'room_detail' */}
      {activeCard === 'room_detail' && <RoomDetailCard />}

      {/* Back button */}
      <button 
        onClick={handleBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '10px 20px',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>
    </div>
  );
}