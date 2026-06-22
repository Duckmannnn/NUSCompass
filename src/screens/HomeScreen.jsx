// src/screens/HomeScreen.jsx
import { useNavigation } from '../context/NavigationContext';
import BlockInfoCard from '../components/cards/BlockInfoCard';

export default function HomeScreen() {
  // Get state and actions from Context
  const { activeCard, selectBlock } = useNavigation();

  // Triggered when user clicks on a block button (A, B, C, D, E)
  const handleBlockClick = (block) => {
    selectBlock(block); 
    // Context will automatically set activeCard = 'block_info'
  };

  return (
    <div>
      {/* TODO: Tuan - Design UI for HomeScreen based on Figma */}
      {/* Figma: "NUScompass", "Where you wanna go?", Search input, A B C D E buttons, "office" text */}

      <h1>NUScompass</h1>
      <p>Where you wanna go?</p>
      
      <input type="text" placeholder="Search rooms or places in Eusoff.." />
      
      {/* Block selection buttons */}
      <div>
        {['A', 'B', 'C', 'D', 'E'].map((block) => (
          <button key={block} onClick={() => handleBlockClick(block)}>
            {block}
          </button>
        ))}
      </div>
      
      <p>office</p>

      {/* Overlay Card: Only render if activeCard is 'block_info' */}
      {activeCard === 'block_info' && <BlockInfoCard />}
    </div>
  );
}