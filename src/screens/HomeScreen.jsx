import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { roomsData } from '../data/blockCData';
import BlockInfoCard from '../components/cards/BlockInfoCard';

export default function HomeScreen() {
  const {
    activeCard,
    highlightedRoomId,
    selectBlock,
    selectRoom,
    selectFloor,
    navigateTo,
    setHighlightedRoom,
  } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // ── Debounce search input (300ms delay) ───────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBlockClick = (block) => {
    selectBlock(block);
  };

  const handleSearchResultClick = (room) => {
    setHighlightedRoom(room.id);

    setTimeout(() => {
      selectFloor(room.floor);
      selectRoom(room);
      navigateTo('explore');
    }, 500);
  };

  // ── Memoized filtered rooms with debounce ─────────────────────────────
  const filteredRooms = useMemo(() => {
    if (!debouncedQuery) return [];
    const query = debouncedQuery.toLowerCase();
    return roomsData.filter(room =>
      room.name.toLowerCase().includes(query) ||
      room.displayName.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [debouncedQuery]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '48px', fontWeight: 'bold', color: 'white',
          margin: '0 0 10px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          NUScompass
        </h1>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          Where you wanna go?
        </p>
      </div>

      {/* Search */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search rooms or places in Eusoff.."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '16px 20px', fontSize: '16px',
            border: 'none', borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', outline: 'none'
          }}
        />

        {/* Search results */}
        {debouncedQuery && filteredRooms.length > 0 && (
          <div style={{
            marginTop: '10px', backgroundColor: 'white',
            borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {filteredRooms.map(room => {
              const isHighlighted = highlightedRoomId === room.id;
              return (
                <div
                  key={room.id}
                  onClick={() => handleSearchResultClick(room)}
                  style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backgroundColor: isHighlighted ? '#dbeafe' : 'white',
                    boxShadow: isHighlighted ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none',
                    transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                    borderRadius: isHighlighted ? '8px' : '0',
                    animation: isHighlighted ? 'glowBlue 1s ease-in-out infinite' : 'none',
                    border: isHighlighted ? '2px solid #3b82f6' : 'none',
                  }}
                  onMouseOver={e => { if (!isHighlighted) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                  onMouseOut={e => { if (!isHighlighted) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{room.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Floor {room.floor} · {room.type}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block selection grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '15px', width: '100%', maxWidth: '600px'
      }}>
        {['A', 'B', 'C', 'D', 'E'].map((block) => (
          <button
            key={block}
            onClick={() => handleBlockClick(block)}
            style={{
              padding: '20px', fontSize: '24px', fontWeight: 'bold',
              border: 'none', borderRadius: '12px', backgroundColor: 'white',
              color: '#667eea', cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.3s'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            {block}
          </button>
        ))}
      </div>

      <p style={{ marginTop: '40px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
        Office blocks
      </p>

      {activeCard === 'block_info' && <BlockInfoCard />}

      <style>{`
        @keyframes glowBlue {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); transform: scale(1.02); }
          50%       { box-shadow: 0 0 35px rgba(59, 130, 246, 1);   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}