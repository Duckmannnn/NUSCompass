import { useState } from 'react';

import { searchRooms } from '../utils/search';

export default function SearchBar({ roomsData, onSelectRoom }) {
  const [query, setQuery] = useState('');

  const results = searchRooms(query, roomsData);

  function handleSelect(room) {
    onSelectRoom(room);
    setQuery(room.displayName ?? room.name ?? room.id);
  }

  return (
    <div className="search-card">
      <label htmlFor="room-search">Search destination</label>

      <input
        id="room-search"
        type="text"
        value={query}
        placeholder="Try 301, 204, common..."
        onChange={(event) => setQuery(event.target.value)}
      />

      {results.length > 0 && (
        <ul className="search-results">
          {results.map((room) => (
            <li key={room.id}>
              <button type="button" onClick={() => handleSelect(room)}>
                <span>{room.displayName ?? room.name}</span>
                <small>Floor {room.floor}</small>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query && results.length === 0 && (
        <p className="empty-message">No matching rooms found.</p>
      )}
    </div>
  );
}