// src/components/cards/RoomDetailCard.jsx
import { useNavigation } from '../../context/NavigationContext';

export default function RoomDetailCard() {
  const { selectedRoom, startNavigation, navigateTo } = useNavigation();

  const handleNavigate = () => {
    startNavigation();
  };

  const handleClose = () => {
    navigateTo('explore');
  };

  if (!selectedRoom) return null;

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '300px'
    }}>
      <h2 style={{ margin: '0 0 10px 0' }}>{selectedRoom.name}</h2>
      <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>
        Floor {selectedRoom.floor} · {selectedRoom.type}
      </p>
      <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '14px' }}>
        abt this room, maybe just a double room with some randomass guys inside
      </p>
      
      <button 
        onClick={handleNavigate}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Navigate there
      </button>
      
      <button 
        onClick={handleClose}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: 'transparent',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        Close
      </button>
    </div>
  );
}