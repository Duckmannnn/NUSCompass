// src/screens/HomeScreen.jsx
import { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { roomsData } from '../data/blockCData';
import BlockInfoCard from '../components/cards/BlockInfoCard';

export default function HomeScreen() {
  const { activeCard, selectBlock } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBlockClick = (block) => {
    selectBlock(block);
  };

  // Filter rooms for search
  const filteredRooms = searchQuery
    ? roomsData.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <h1>NUScompass</h1>
      <p>Where you wanna go?</p>
      
      {/* Search input */}
      <input
        type="text"
        placeholder="Search rooms or places in Eusoff.."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      />

      {/* Search results */}
      {searchQuery && filteredRooms.length > 0 && (
        <div style={{ marginTop: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
          {filteredRooms.map(room => (
            <div key={room.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              <strong>{room.name}</strong> - Floor {room.floor}
            </div>
          ))}
        </div>
      )}
      
      {/* Block selection buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {['A', 'B', 'C', 'D', 'E'].map((block) => (
          <button
            key={block}
            onClick={() => handleBlockClick(block)}
            style={{
              padding: '15px 25px',
              fontSize: '18px',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#3b82f6',
              cursor: 'pointer'
            }}
          >
            {block}
          </button>
        ))}
      </div>
      
      <p style={{ marginTop: '20px', color: '#999' }}>office</p>

      {/* Overlay Card */}
      {activeCard === 'block_info' && <BlockInfoCard />}
    </div>
  );
}