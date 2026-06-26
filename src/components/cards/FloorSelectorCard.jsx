// src/components/cards/FloorSelectorCard.jsx
import { useNavigation } from '../../context/NavigationContext';
import { blockCLayout } from '../../data/blockCData';

const FLOORS = Object.keys(blockCLayout).map(Number).sort((a, b) => b - a);

export default function FloorSelectorCard() {
  const { currentFloor, selectFloor } = useNavigation();

  return (
    <div style={{
      backgroundColor: 'white', padding: '20px', borderRadius: '16px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)', minWidth: '120px'
    }}>
      <h3 style={{
        margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold',
        color: '#374151', textAlign: 'center'
      }}>
        Floor
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {FLOORS.map((floor) => {
          const isActive = currentFloor === floor;
          return (
            <button
              key={floor}
              onClick={() => selectFloor(floor)}
              style={{
                padding: '14px 20px',
                backgroundColor: isActive ? '#3b82f6' : '#f9fafb',
                color: isActive ? 'white' : '#374151',
                border: `2px solid ${isActive ? '#2563eb' : '#e5e7eb'}`,
                borderRadius: '10px', cursor: 'pointer',
                fontWeight: isActive ? 'bold' : '500',
                fontSize: '16px', transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 8px rgba(59, 130, 246, 0.3)' : 'none'
              }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
            >
              Floor {floor}
            </button>
          );
        })}
      </div>
    </div>
  );
}