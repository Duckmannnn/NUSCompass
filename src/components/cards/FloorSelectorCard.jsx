// src/components/cards/FloorSelectorCard.jsx
import { useNavigation } from '../../context/NavigationContext';

export default function FloorSelectorCard() {
  // Get current floor and the action to change floor from Context
  const { currentFloor, selectFloor } = useNavigation();

  // Triggered when user clicks on a floor button
  const handleFloorClick = (floor) => {
    selectFloor(floor);
    // Context will update currentFloor
    // MapCanvas (implemented by Tuan) will listen to this change and re-render
  };

  return (
    <div>
      {/* TODO: Tuan - Design UI for this card */}
      {/* Figma reference: Page 3 & 4 - "floor 1 floor 2 floor 3 floor 4" buttons */}
      {/* Requirements:
          - Position: bottom-left or bottom-right of the map
          - 4 buttons arranged vertically or horizontally
          - Active floor should be highlighted (different color/border)
          - Smooth transition when switching floors
      */}
      
      <div>
        <h3>Floor</h3>
        {[1, 2, 3, 4].map((floor) => (
          <button
            key={floor}
            onClick={() => handleFloorClick(floor)}
            style={{
              // Inline styles for now, Tuan will replace with proper CSS
              backgroundColor: currentFloor === floor ? '#3b82f6' : 'white',
              color: currentFloor === floor ? 'white' : 'black',
              border: '1px solid #d1d5db',
              padding: '10px 20px',
              margin: '5px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: currentFloor === floor ? 'bold' : 'normal'
            }}
          >
            Floor {floor}
          </button>
        ))}
      </div>
    </div>
  );
}