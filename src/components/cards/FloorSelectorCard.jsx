// src/components/cards/FloorSelectorCard.jsx
import { useNavigation } from '../../context/NavigationContext';

export default function FloorSelectorCard() {
  const { currentFloor, selectFloor } = useNavigation();

  const handleFloorClick = (floor) => {
    selectFloor(floor);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '16px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      minWidth: '120px'
    }}>
      <h3 style={{ 
        margin: '0 0 15px 0',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'center'
      }}>
        Floor
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[1, 2, 3, 4].map((floor) => (
          <button
            key={floor}
            onClick={() => handleFloorClick(floor)}
            style={{
              padding: '14px 20px',
              backgroundColor: currentFloor === floor ? '#3b82f6' : '#f9fafb',
              color: currentFloor === floor ? 'white' : '#374151',
              border: currentFloor === floor ? '2px solid #2563eb' : '2px solid #e5e7eb',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: currentFloor === floor ? 'bold' : '500',
              fontSize: '16px',
              transition: 'all 0.2s',
              boxShadow: currentFloor === floor ? '0 4px 8px rgba(59, 130, 246, 0.3)' : 'none'
            }}
            onMouseOver={(e) => {
              if (currentFloor !== floor) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseOut={(e) => {
              if (currentFloor !== floor) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
          >
            Floor {floor}
          </button>
        ))}
      </div>
    </div>
  );
}