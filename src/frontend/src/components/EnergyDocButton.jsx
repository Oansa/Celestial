// src/components/EnergyDocButton.jsx
import React from "react";
import "../App.css";

export default function EnergyDocButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="energy-doc-button"
    >
      Energy Doc
    </button>
  );
}
