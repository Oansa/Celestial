// src/App.js
import React from "react";
import "./App.css";





function App() {
  const handleNavigation = () => {
    // TODO: Replace this with your actual routing logic
    alert("Navigating to Energy Doc page...");
  };

  return (
    <div className="app-container">
      {/* === TOP NAV / LOGO === */}
      <header className="top-logo">
        <img src="assets/celestial-logo.png" alt="Celestial Logo" />
      </header>

      {/* === MAIN HERO SECTION === */}
      <div className="hero-section">
        <div className="hero-text">
          <h1>
            For humanity to survive multiplanetary society,<br />
            we need to have AI as the foundation
          </h1>
        </div>
        <div className="hero-image">
          <img src="/mars-image.png" alt="Mars Surface" />
        </div>
      </div>

      <div className="bottom-section">
        <h2>LET'S GO. GOD SPEED</h2>
      </div>

      {/* ENERGY DOC SECTION */}
      <div className="energy-doc-section">
        <button 
          className="energy-doc-button"
          onClick={handleNavigation}
        >
          Energy Doc
        </button>
        <div className="energy-doc-info">
          <img 
            src="assets/energy-doc-avatar.png" 
            alt="Energy Doc Avatar" 
            className="energy-doc-avatar" 
          />
          <p className="energy-doc-text">This is Energy Doc</p>
        </div>
      </div>
    </div>
  );
}

export default App;
