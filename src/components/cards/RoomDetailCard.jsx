// src/components/cards/RoomDetailCard.jsx
import { useNavigation } from '../../context/NavigationContext';

export default function RoomDetailCard() {
  const { selectedRoom, startNavigation, navigateTo, clearHighlightedRoom } = useNavigation();

  if (!selectedRoom) return null;

  const roomName  = selectedRoom.name  || selectedRoom.id    || selectedRoom.label || 'Unknown Room';
  const roomFloor = selectedRoom.floor || 'Unknown';
  const roomType  = selectedRoom.type  || 'room';

  const handleClose = () => {
    clearHighlightedRoom();
    navigateTo('explore');
  };

  return (
    <div style={{
      backgroundColor: 'white', padding: '25px', borderRadius: '16px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)', minWidth: '320px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
            {roomName}
          </h2>
          <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#6b7280' }}>
            <span style={{
              backgroundColor: '#dbeafe', padding: '4px 10px',
              borderRadius: '6px', color: '#1e40af', fontWeight: '600'
            }}>
              📍 Floor {roomFloor}
            </span>
            <span style={{
              backgroundColor: '#f3f4f6', padding: '4px 10px',
              borderRadius: '6px', color: '#374151', fontWeight: '500'
            }}>
              {roomType}
            </span>
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'none', border: 'none', fontSize: '28px',
            color: '#9ca3af', cursor: 'pointer', padding: 0, lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      {/* Description */}
      <div style={{
        padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px',
        marginBottom: '20px', border: '1px solid #e5e7eb'
      }}>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '15px', lineHeight: '1.6' }}>
          Located on Floor {roomFloor}. Use navigation to find the shortest path here.
        </p>
      </div>

      {/* Navigate button */}
      <button
        onClick={startNavigation}
        style={{
          width: '100%', padding: '16px', backgroundColor: '#3b82f6',
          color: 'white', border: 'none', borderRadius: '12px',
          fontSize: '17px', fontWeight: 'bold', cursor: 'pointer',
          marginBottom: '12px', transition: 'all 0.2s'
        }}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        🧭 Navigate there
      </button>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          width: '100%', padding: '12px', backgroundColor: 'transparent',
          color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '12px',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Close
      </button>
    </div>
  );
}