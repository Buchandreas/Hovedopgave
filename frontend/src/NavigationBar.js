import React from 'react';

// Modtager props:
// - tabs: Array af strenge med navne på fanerne (f.eks. ['Censorer', 'Organisationer'])
// - activeTab: Den nuværende aktive fane (streng)
// - onTabChange: Funktion der kaldes med navnet på den fane, der klikkes på
function NavigationBar({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="navbar">
      {tabs.map(tab => (
        <button
          key={tab}
          // Tilføj 'active' klasse hvis fanen er den aktive
          className={`nav-button ${activeTab === tab ? 'active' : ''}`}
          // Kald onTabChange med fanens navn ved klik
          onClick={() => onTabChange(tab)}
        >
          {/* Gør første bogstav stort */}
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
  );
}

export default NavigationBar;