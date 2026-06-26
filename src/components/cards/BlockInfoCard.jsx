import { useNavigation } from '../../context/NavigationContext';

export default function BlockInfoCard() {
  const { selectedBlock, startExplore, navigateTo } = useNavigation();

  // Only Block C has data
  const isAvailable = selectedBlock === 'C';

  return (
    <div
      onClick={() => navigateTo('home')}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 0.3s'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white', padding: '30px', borderRadius: '16px',
          boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
          maxWidth: '400px', width: '90%', animation: 'slideUp 0.3s'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#1f2937' }}>
            Block {selectedBlock}
          </h2>
          <button
            onClick={() => navigateTo('home')}
            style={{
              background: 'none', border: 'none', fontSize: '24px',
              color: '#9ca3af', cursor: 'pointer', padding: 0, lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#6b7280', margin: '0 0 25px 0', fontSize: '16px', lineHeight: '1.5' }}>
          {isAvailable 
            ? `Explore the rooms and facilities in Block ${selectedBlock}. Use the map to find study rooms, lounges, and more.`
            : `Block ${selectedBlock} is coming soon! We're currently working on adding navigation support for this block.`
          }
        </p>

        <button
          onClick={startExplore}
          disabled={!isAvailable}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: isAvailable ? '#3b82f6' : '#9ca3af',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '16px', fontWeight: 'bold',
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { if (isAvailable) e.currentTarget.style.backgroundColor = '#2563eb'; }}
          onMouseOut={e => { if (isAvailable) e.currentTarget.style.backgroundColor = '#3b82f6'; }}
        >
          {isAvailable ? `Explore Block ${selectedBlock}` : 'Coming Soon'}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}