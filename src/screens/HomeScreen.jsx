// src/screens/HomeScreen.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { roomsData } from '../data/blockCData';
import OverviewMap from '../components/map/OverviewMap';

export default function HomeScreen() {
  const {
    highlightedRoomId,
    selectBlock,
    selectRoom,
    selectFloor,
    navigateTo,
    setHighlightedRoom,
  } = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle block selection from overview map
  const handleSelectBlock = (blockId) => {
    selectBlock(blockId);
    // Auto navigate to explore after a short delay
    setTimeout(() => {
      navigateTo('explore');
    }, 300);
  };

  // Handle search result click
  const handleSearchResultClick = (room) => {
    setHighlightedRoom(room.id);

    setTimeout(() => {
      selectFloor(room.floor);
      selectRoom(room);
      navigateTo('explore');
    }, 500);
  };

  // Filter rooms based on search query
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
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '36px', fontWeight: 'bold', color: 'white',
          margin: '0 0 5px 0', textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          NUScompass
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
          Navigate Eusoff Hall with ease
        </p>
      </div>

      {/* Search */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search rooms or places in Eusoff.."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '14px 20px', fontSize: '16px',
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

      {/* Overview Map */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        marginBottom: '20px'
      }}>
        <OverviewMap onSelectBlock={handleSelectBlock} />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#9ca3af', borderRadius: '4px', opacity: 0.7 }} />
          <span>Coming Soon</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#10b981', borderRadius: '50%' }} />
          <span>Connection</span>
        </div>
      </div>

      <style>{`
        @keyframes glowBlue {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); transform: scale(1.02); }
          50%       { box-shadow: 0 0 35px rgba(59, 130, 246, 1);   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}