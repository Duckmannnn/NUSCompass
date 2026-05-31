export default function FloorSelector({ floors, currentFloor, onChangeFloor }) {
  if (!floors || floors.length === 0) {
    return null;
  }

  return (
    <div className="floor-selector">
      <p className="section-label">Floor</p>

      <div className="floor-buttons">
        {floors.map((floor) => {
          const isActive = String(floor) === String(currentFloor);

          return (
            <button
              key={floor}
              type="button"
              className={isActive ? 'active' : ''}
              onClick={() => onChangeFloor(floor)}
            >
              Floor {floor}
            </button>
          );
        })}
      </div>
    </div>
  );
}