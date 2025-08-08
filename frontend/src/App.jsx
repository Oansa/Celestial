// import React from "react";
// import "./App.css";
// import EnergyDocButton from "./components/EnergyDocButton";
// import logo from "./assets/celestial-logo.png";
// import docAvatar from "./assets/energy-doc-avatar.png";

// function App() {
//   const handleEnergyDocClick = () => {
//     console.log("Energy Doc Button Clicked!");
//   };

//   return (
//     <div className="app-container">
//       <div className="logo-section">
//         <img src={logo} alt="Celestial Logo" />
//         <h1>Celestial</h1>
//       </div>

//       <div className="content">
//         <h2 className="welcome-message">
//           For humanity to survive as a multiplanetary society, we need to have AI as the foundation.
//         </h2>

//         <div className="godspeed-text">LET'S GO. GOD SPEED</div>

//         <div className="energy-doc-section">
//           <div className="energy-doc-left">
//             <img
//               src={docAvatar}
//               alt="Energy Doc Avatar"
//               className="energy-doc-avatar"            
//             />
//             <p className="energy-doc-label">This is Energy Doc. Your AI assistant for identifying areas </p>
//             <p className="energy-doc-label">of high energy potential.</p>
//             </div>

//           <EnergyDocButton onClick={handleEnergyDocClick} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;






import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import EnergyDocButton from "./components/EnergyDocButton";
import logo from "./assets/celestial-logo.png";
import docAvatar from "./assets/energy-doc-avatar.png";

function App() {
  const navigate = useNavigate();

  const handleEnergyDocClick = () => {
    navigate("/energy-doc");
  };

  return (
    <div className="app-container">
      <div className="logo-section">
        <img src={logo} alt="Celestial Logo" />
        <h1>Celestial</h1>
      </div>

      <div className="content">
        <h2 className="welcome-message">
          For humanity to survive as a multiplanetary society, we need to have AI as the foundation.
        </h2>

        <div className="godspeed-text">LET'S GO. GOD SPEED</div>

        <div className="energy-doc-section">
          <div className="energy-doc-left">
            <img
              src={docAvatar}
              alt="Energy Doc Avatar"
              className="energy-doc-avatar"
            />
            <p className="energy-doc-label">
              This is Energy Doc — a highly equipped AI scout, designed to identify zones rich in energy and potential resources.
            </p>
          </div>
          <EnergyDocButton onClick={handleEnergyDocClick} />
        </div>
      </div>
    </div>
  );
}

export default App;