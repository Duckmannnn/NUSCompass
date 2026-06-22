// src/screens/ExploreScreen.jsx
import { useNavigation } from '../context/NavigationContext';
import { blockCLayout, roomsData } from '../data/blockCData';
import FloorSelectorCard from '../components/cards/FloorSelectorCard';
import RoomDetailCard from '../components/cards/RoomDetailCard';

export default function ExploreScreen() {
  const { 
    selectedBlock, 
    currentFloor, 
    activeCard, 
    selectRoom,
    navigateTo 
  } = useNavigation();

  const layout = blockCLayout[currentFloor];

  const handleRoomClick = (room) => {
    selectRoom(room);
  };

  const handleBack = () => {
    navigateTo('home');
  };

  if (!layout) {
    return <div>No layout data for floor {currentFloor}</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex' }}>
      {/* Map Area */}
      <div style={{ flex: 1, backgroundColor: '#f3f4f6', padding: '20px' }}>
        <h2>Block {selectedBlock} - Floor {currentFloor}</h2>
        <p>Map will be rendered here (Tuấn will implement MapCanvas)</p>
        
        {/* Temporary room list for testing */}
        <div style={{ marginTop: '20px' }}>
          <h3>Rooms on this floor:</h3>
          {layout.rooms.map(room => (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room)}
              style={{
                display: 'block',
                padding: '10px',
                margin: '5px 0',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {room.label} (Floor {room.floor})
            </button>
          ))}
        </div>
      </div>

      {/* Floor Selector Card - Always visible */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
        <FloorSelectorCard />
      </div>

      {/* Room Detail Card - Only show when activeCard is 'room_detail' */}
      {activeCard === 'room_detail' && (
        <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
          <RoomDetailCard />
        </div>
      )}

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