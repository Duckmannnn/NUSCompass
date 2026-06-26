// src/screens/ExploreScreen.jsx
import { useNavigation } from '../context/NavigationContext';
import { blockCLayout } from '../data/blockCData';
import MapCanvas from '../components/map/MapCanvas';
import FloorSelectorCard from '../components/cards/FloorSelectorCard';
import RoomDetailCard from '../components/cards/RoomDetailCard';

export default function ExploreScreen() {
  const {
    selectedBlock,
    currentFloor,
    activeCard,
    highlightedRoomId,
    selectRoom,
    navigateTo,
  } = useNavigation();

  const layout = blockCLayout[currentFloor];

  if (!layout) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '20px', color: '#6b7280'
      }}>
        No layout data for floor {currentFloor}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>

      {/* Map area — position:relative anchors the overlay cards */}
      <div style={{
        flex: 1, padding: '20px', display: 'flex',
        flexDirection: 'column', position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '20px'
        }}>
          <button
            onClick={() => navigateTo('home')}
            style={{
              padding: '10px 20px', backgroundColor: 'white',
              border: '1px solid #e5e7eb', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151'
            }}
          >
            ← Back
          </button>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>
              Block {selectedBlock}
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Explore the facilities and rooms in Block {selectedBlock}
            </p>
          </div>

          {/* Spacer to balance the back button */}
          <div style={{ width: '80px' }} />
        </div>

        {/* Map */}
        <div style={{
          flex: 1, backgroundColor: 'white', borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden',
          position: 'relative'
        }}>
          <MapCanvas
            currentFloor={currentFloor}
            onRoomClick={selectRoom}
            highlightedRoomId={highlightedRoomId}
          />
        </div>

        {/* Floor selector overlay — bottom-left of map area */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
          <FloorSelectorCard />
        </div>

        {/* Room detail overlay — bottom-right of map area */}
        {activeCard === 'room_detail' && (
          <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
            <RoomDetailCard />
          </div>
        )}
      </div>
    </div>
  );
}