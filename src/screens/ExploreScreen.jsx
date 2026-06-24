// src/screens/ExploreScreen.jsx
import { useNavigation } from '../context/NavigationContext';
import { blockCLayout, roomsData } from '../data/blockCData';
import MapCanvas from '../components/map/MapCanvas';
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
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '20px',
        color: '#6b7280'
      }}>
        No layout data for floor {currentFloor}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      {/* Map Area - Left side (70%) */}
      <div style={{ 
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button 
            onClick={handleBack}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ← Back
          </button>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>
              Block {selectedBlock}
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              some thing fun in block {selectedBlock}, lounge or sth
            </p>
          </div>

          <div style={{ width: '80px' }} />
        </div>

        {/* Map */}
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
            onRoomClick={handleRoomClick}
          />
        </div>

        {/* Floor Selector - Bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px'
        }}>
          <FloorSelectorCard />
        </div>

        {/* Room Detail Card - Bottom right (if active) */}
        {activeCard === 'room_detail' && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px'
          }}>
            <RoomDetailCard />
          </div>
        )}
      </div>
    </div>
  );
}