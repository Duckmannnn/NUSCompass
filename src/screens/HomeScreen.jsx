// src/screens/HomeScreen.jsx
import { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { roomsData } from '../data/blockCData';
import BlockInfoCard from '../components/cards/BlockInfoCard';

export default function HomeScreen() {
  const { activeCard, selectBlock, selectRoom, selectFloor, navigateTo, setHighlightedRoom } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedRoom, setLocalHighlightedRoom] = useState(null);

  const handleBlockClick = (block) => {
    selectBlock(block);
  };

    // Handle click on search result
  const handleSearchResultClick = (room) => {
    console.log('Selected room:', room);
    
    // Set highlighted room for glow effect
    setHighlightedRoom(room.id);
    
    // Set floor FIRST (before navigate)
    selectFloor(room.floor);
    
    // Set room (this will also set floor again, but that's OK)
    selectRoom(room);
    
    // THEN navigate to explore
    navigateTo('explore');
    
    // Clear highlight after 2 seconds
    setTimeout(() => {
      setHighlightedRoom(null);
    }, 2000);
  };

  const filteredRooms = searchQuery
    ? roomsData.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

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
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: 'white',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          NUScompass
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: 'rgba(255,255,255,0.9)',
          margin: 0
        }}>
          Where you wanna go?
        </p>
      </div>

      {/* Search Box */}
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search rooms or places in Eusoff.."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: '16px',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            outline: 'none'
          }}
        />

        {/* Search Results */}
        {searchQuery && filteredRooms.length > 0 && (
          <div style={{ 
            marginTop: '10px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {filteredRooms.map(room => {
              const isHighlighted = highlightedRoom === room.id;
              
              return (
                <div 
                  key={room.id} 
                  onClick={() => handleSearchResultClick(room)}
                  style={{ 
                    padding: '15px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    animation: isHighlighted ? 'glow 1s ease-in-out infinite' : 'none',
                    backgroundColor: isHighlighted ? '#fef3c7' : 'white',
                    boxShadow: isHighlighted ? '0 0 20px rgba(251, 191, 36, 0.8)' : 'none',
                    borderRadius: isHighlighted ? '8px' : '0'
                  }}
                  onMouseOver={(e) => {
                    if (!isHighlighted) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isHighlighted) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
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

      {/* Block Selection */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '15px',
        width: '100%',
        maxWidth: '600px'
      }}>
        {['A', 'B', 'C', 'D', 'E'].map((block) => (
          <button
            key={block}
            onClick={() => handleBlockClick(block)}
            style={{
              padding: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: 'white',
              color: '#667eea',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            {block}
          </button>
        ))}
      </div>

      <p style={{ 
        marginTop: '40px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px'
      }}>
        Office blocks
      </p>

      {/* Overlay Card */}
      {activeCard === 'block_info' && <BlockInfoCard />}

      {/* CSS Animation for glow effect */}
      <style>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 30px rgba(251, 191, 36, 1), 0 0 40px rgba(251, 191, 36, 0.6);
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}