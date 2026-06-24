// src/components/cards/BlockInfoCard.jsx
import { useNavigation } from '../../context/NavigationContext';

export default function BlockInfoCard() {
  const { selectedBlock, startExplore } = useNavigation();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '16px',
        boxShadow: '0 20px 25px rgba(0,0,0,0.2)',
        maxWidth: '400px',
        width: '90%',
        animation: 'slideUp 0.3s'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0',
          fontSize: '28px',
          color: '#1f2937'
        }}>
          Block {selectedBlock}
        </h2>
        <p style={{ 
          color: '#6b7280', 
          margin: '0 0 25px 0',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          some thing fun in block {selectedBlock}, lounge or sth
        </p>
        
        <button 
          onClick={startExplore}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          Explore
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}