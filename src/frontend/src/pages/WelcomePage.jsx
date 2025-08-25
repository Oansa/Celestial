import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EnergyDocButton from "../components/EnergyDocButton";
import SignUpModal from "../components/SignUpModal";
import logo from "../assets/celestial-logo.png";
import docAvatar from "../assets/energy-doc-avatar.png";
import marsIntroVideo from "../assets/mars-intro.mp4";

function WelcomePage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  const handleEnergyDocClick = () => {
    navigate("/energy-doc");
  };

  const handleSignUpSuccess = (firstName) => {
    setUserName(firstName);
    setIsModalOpen(false);
  };

  return (
    <div style={{ 
      backgroundColor: 'transparent',
      minHeight: '100vh',
      padding: '2rem',
      color: 'white',
      position: 'relative'
    }}>
      {/* Header with Sign-up Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="Celestial Logo" style={{ width: '48px', height: '48px' }} />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Celestial</h1>
        </div>
        
        <div>
          {userName ? (
            <span style={{ 
              fontSize: '1.1rem', 
              fontWeight: '500',
              color: '#fff'
            }}>
              Hey {userName}👋
            </span>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#000';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#fff';
              }}
            >
              Sign up
            </button>
          )}
        </div>
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

      <SignUpModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSignUpSuccess}
      />
    </div>
  );
}

export default WelcomePage;
