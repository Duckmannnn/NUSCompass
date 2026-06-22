// src/components/cards/BlockInfoCard.jsx
import { useNavigation } from '../../context/NavigationContext';

export default function BlockInfoCard() {
  // Get selected block and the action to start exploring from Context
  const { selectedBlock, startExplore } = useNavigation();

  return (
    <div>
      {/* TODO: Tuan - Design UI for this card overlay based on Figma */}
      {/* Figma: "Block C", "some thing fun in block C, lounge or sth", "Explore" button */}
      
      <h2>Block {selectedBlock}</h2>
      <p>some thing fun in block {selectedBlock}, lounge or sth</p>
      
      <button onClick={startExplore}>
        Explore
      </button>
    </div>
  );
}