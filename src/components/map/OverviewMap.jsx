import { eusoffOverview } from '../../data/eusoffOverview';

export default function OverviewMap({ onSelectBlock }) {
  const { viewBox, blocks, connections, landmarks } = eusoffOverview;

  const handleBlockClick = (block) => {
    if (block.available) {
      onSelectBlock(block.id);
    } else {
      alert(`${block.name} - Coming Soon!`);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      style={{ width: '100%', height: 'auto', maxWidth: '900px' }}
    >
      {/* Title */}
      <text x="500" y="35" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1f2937">
        Eusoff Hall Overview
      </text>
      
      {/* Connection Lines */}
      {connections.map((conn, i) => (
        <line
          key={i}
          x1={conn.x1}
          y1={conn.y1}
          x2={conn.x2}
          y2={conn.y2}
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}

      {/* Blocks */}
      {blocks.map((block) => {
        const isAvailable = block.available;
        return (
          <g
            key={block.id}
            onClick={() => handleBlockClick(block)}
            style={{ cursor: isAvailable ? 'pointer' : 'default' }}
          >
            {/* Block Rectangle */}
            <rect
              x={block.x}
              y={block.y}
              width={block.width}
              height={block.height}
              fill={block.color}
              stroke={isAvailable ? '#1e40af' : '#4b5563'}
              strokeWidth={isAvailable ? '3' : '2'}
              rx="8"
              opacity={isAvailable ? 1 : 0.7}
              style={{
                transition: 'all 0.3s',
                filter: isAvailable ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4))' : 'none'
              }}
            />
            
            {/* Block Name */}
            <text
              x={block.x + block.width / 2}
              y={block.y + block.height / 2 - 10}
              textAnchor="middle"
              fontSize="20"
              fontWeight="bold"
              fill="white"
            >
              {block.name}
            </text>
            
            {/* Floor Count */}
            {block.floors && (
              <text
                x={block.x + block.width / 2}
                y={block.y + block.height / 2 + 15}
                textAnchor="middle"
                fontSize="14"
                fill="white"
              >
                {block.floors} Floors
              </text>
            )}
            
            {/* Available Badge */}
            {isAvailable && (
              <g>
                <circle cx={block.x + block.width - 25} cy={block.y + 25} r="15" fill="#10b981" />
                <text x={block.x + block.width - 25} y={block.y + 30} textAnchor="middle" fontSize="16" fill="white">✓</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Landmarks */}
      {landmarks.map((lm) => (
        <g key={lm.id}>
          <circle cx={lm.x} cy={lm.y} r="20" fill="white" stroke="#6b7280" strokeWidth="2" />
          <text x={lm.x} y={lm.y + 7} textAnchor="middle" fontSize="18">{lm.icon}</text>
          <text x={lm.x} y={lm.y + 35} textAnchor="middle" fontSize="11" fill="#374151" fontWeight="500">
            {lm.name}
          </text>
        </g>
      ))}
      
      {/* Legend */}
      <g transform="translate(50, 640)">
        <rect x="0" y="0" width="250" height="50" fill="#f3f4f6" rx="8" />
        <rect x="20" y="15" width="20" height="20" fill="#3b82f6" rx="4" />
        <text x="50" y="30" fontSize="12" fill="#374151">Available</text>
        <rect x="130" y="15" width="20" height="20" fill="#9ca3af" rx="4" opacity="0.7" />
        <text x="160" y="30" fontSize="12" fill="#374151">Coming Soon</text>
      </g>
    </svg>
  );
}