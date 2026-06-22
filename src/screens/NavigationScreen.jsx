// src/screens/NavigationScreen.jsx
import { useNavigation } from '../context/NavigationContext';

export default function NavigationScreen() {
  // Get state and actions from Context
  const { 
    startPoint, 
    destination, 
    routePath, 
    currentStepIndex,
    nextStep,
    navigateTo,
    resetNavigation
  } = useNavigation();

  // Smart button logic
  const handleSmartButton = () => {
    if (!startPoint) {
      // No starting point yet → go back to ExploreScreen to select one
      navigateTo('explore');
    } else {
      // Has starting point → move to next step
      nextStep();
    }
  };

  // Determine button text and disabled state
  const getButtonText = () => {
    if (!startPoint) return 'Start navigation';
    if (currentStepIndex >= routePath.length - 1) return 'Arrived!';
    return 'Next step';
  };

  const isButtonDisabled = () => {
    if (!startPoint) return false;
    if (currentStepIndex >= routePath.length - 1) return true;
    return false;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* TODO: Tuan - Replace this placeholder with MapCanvas component showing route */}
      {/* MapCanvas will render SVG map with route overlay */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#6b7280'
      }}>
        🗺️ Navigation Map - Route will be drawn here
        <br />
        <small>(Tuấn will implement MapCanvas with route overlay)</small>
      </div>

      {/* Navigation Info Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: '300px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Navigation</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Starting point:</strong> {startPoint || 'Not selected'}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Where you wanna go:</strong> {destination || 'Not selected'}
        </div>

        {/* Step Guide */}
        {routePath.length > 0 && (
          <div style={{ 
            borderTop: '1px solid #e5e7eb', 
            paddingTop: '15px',
            marginTop: '15px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Step guide</h3>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {routePath.map((nodeId, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px',
                    marginBottom: '5px',
                    backgroundColor: index === currentStepIndex ? '#dbeafe' : 'transparent',
                    borderRadius: '4px',
                    fontWeight: index === currentStepIndex ? 'bold' : 'normal'
                  }}
                >
                  Step {index + 1}: {nodeId}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Button */}
        <button
          onClick={handleSmartButton}
          disabled={isButtonDisabled()}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '15px',
            backgroundColor: isButtonDisabled() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isButtonDisabled() ? 'not-allowed' : 'pointer'
          }}
        >
          {getButtonText()}
        </button>

        {/* Cancel/Reset button */}
        <button
          onClick={resetNavigation}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}