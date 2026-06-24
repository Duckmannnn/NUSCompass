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
      padding: '25px', 
      borderRadius: '16px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      minWidth: '320px',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1f2937' }}>
            {selectedRoom.name}
          </h2>
          <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#6b7280' }}>
            <span>📍 Floor {selectedRoom.floor}</span>
            <span>•</span>
            <span>{selectedRoom.type}</span>
          </div>
        </div>
        <button 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '0',
            lineHeight: 1
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#6b7280'}
          onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          ×
        </button>
      </div>

      <div style={{ 
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <p style={{ 
          margin: 0,
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          abt this room, maybe just a double room with some randomass guys inside
        </p>
      </div>
      
      <button 
        onClick={handleNavigate}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '10px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
      >
        Navigate there
      </button>
      
      <button 
        onClick={handleClose}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: 'transparent',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#9ca3af';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
      >
        Close
      </button>
    </div>
  );
}