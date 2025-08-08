import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { FileUpload } from "../components/FileUpload";

function EnergyDocPage() {
  const navigate = useNavigate();

  const goBackHome = () => {
    navigate("/");
  };

  return (
    <div className="energy-doc-page-container">
      <button className="back-button" onClick={goBackHome}>
        ← Home
      </button>

      <div className="energy-doc-content">
        <h1 className="energy-doc-page-heading">Welcome, I'm Energy Doc</h1>

        <p className="energy-doc-page-text">
          I am your AI assistant for identifying areas of high energy potential.
          My goal is to help humanity survive as a multiplanetary society by
          providing insights into energy resources across the universe.
        </p>

        <div className="file-upload-wrapper">
          <FileUpload />
        </div>
      </div>
    </div>
  );
}

export default EnergyDocPage;
