// src/App.jsx
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Import the 3 main screens
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import NavigationScreen from './screens/NavigationScreen';

// This component reads currentView from Context and renders the appropriate screen
function AppContent() {
  const { currentView } = useNavigation();
  
  // Routing logic: render screen based on currentView
  const renderScreen = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'navigation':
        return <NavigationScreen />;
      default:
        return <HomeScreen />;
    }
  };
  
  return (
    <div>
      {renderScreen()}
    </div>
  );
}

// Main App component: only wraps Provider, no logic inside
export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}