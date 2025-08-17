import React from "react";
import { useNavigate } from "react-router-dom";
import EnergyDocButton from "../components/EnergyDocButton";
import logo from "../assets/celestial-logo.png";
import docAvatar from "../assets/energy-doc-avatar.png";
import marsIntroVideo from "../assets/mars-intro.mp4";

function WelcomePage() {
  const navigate = useNavigate();

  const handleEnergyDocClick = () => {
    navigate("/energy-doc");
  };

  return (
    <div style={{ 
      backgroundColor: 'transparent',
      minHeight: '100vh',
      padding: '2rem',
      color: 'white'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <img src={logo} alt="Celestial Logo" style={{ width: '48px', height: '48px' }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Celestial</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: '3rem', 
            maxWidth: '700px', 
            textAlign: 'left',
            marginBottom: '4rem',
            marginLeft: '2rem'
          }}>
            For humanity to survive as a multiplanetary society, we need to have AI as the foundation.
          </h2>
        </div>
        <div style={{ flex: 1.5, maxWidth: '700px' }}>
          <video 
            src={marsIntroVideo} 
            autoPlay 
            muted 
            loop 
            playsInline
            style={{ 
              width: '100%', 
              height: 'auto'
            }}
          />
        </div>
      </div>

      <div style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        textAlign: 'center',
        marginBottom: '10rem'
      }}>
        LET'S GO. GOD SPEED
      </div>

      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 3rem'
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <img
            src={docAvatar}
            alt="Energy Doc Avatar"
            style={{ width: '500px', height: '520px', objectFit: 'contain' }}
          />
          <p style={{ 
            fontSize: '1rem', 
            color: '#aaa', 
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            This is Energy Doc — a highly equipped AI scout, designed to identify zones rich in energy and potential resources.
          </p>
        </div>
        <EnergyDocButton onClick={handleEnergyDocClick} />
      </div>
    </div>
  );
}

export default WelcomePage;
