import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure this line is here

function EnergyDocPage() {
  const navigate = useNavigate();

  const goBackHome = () => {
    navigate("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Styled with CSS */}
      <button className="back-button" onClick={goBackHome}>
        ← Home
      </button>

      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1>This is the Energy Doc Page</h1>
      </div>
    </div>
  );
}

export default EnergyDocPage;
