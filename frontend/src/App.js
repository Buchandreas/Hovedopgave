import React, { useState } from 'react';
import NavigationBar from './NavigationBar';
import CensorerListe from './CensorerListe';
import OrganisationerListe from './OrganisationerListe';
import SprogcentreListe from './SprogcentreListe';
import HoldListe from './HoldListe';
import './App.css';

function App() {
  // Definer navigationsfanerne
  const TABS = ['censorer', 'organisationer', 'sprogcentre', 'hold'];
  // State for at holde styr på den aktive fane
  const [activeTab, setActiveTab] = useState(TABS[0]); // Start med tabben til censorer

  // Funktion til at skifte fane
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Funktion til at vælge hvilken komponent der skal vises
  const renderContent = () => {
    switch (activeTab) {
      case 'censorer':
        return <CensorerListe />;
      case 'organisationer':
        return <OrganisationerListe />;
      case 'sprogcentre':
        return <SprogcentreListe />;
      case 'hold':
        return <HoldListe />;
      default:
        return <p>Vælg venligst en fane.</p>;
    }
  };

  return (
    <div className="app-container">
      <NavigationBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;