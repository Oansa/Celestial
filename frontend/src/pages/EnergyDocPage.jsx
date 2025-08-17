import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import EnergyDocComposer from "../components/EnergyDocComposer";
import { FileUpload } from "../components/FileUpload";
import { runMainScript } from "../services/api";
import "../styles/energyDocPage.css";

function EnergyDocPage() {
  const navigate = useNavigate();

  const goBackHome = () => {
    navigate("/");
  };

  const handleStartMain = async () => {
    try {
      console.log("[INFO] Starting main.py execution...");
      const result = await runMainScript();
      
      if (result.success) {
        console.log("[INFO] main.py executed successfully!");
        console.log("Output:", result.stdout);
        alert("Mars AI Assistant started successfully! Check the console for details.");
      } else {
        console.error("[ERROR] main.py execution failed:", result.stderr);
        alert("Failed to start Mars AI Assistant. Check console for details.");
      }
    } catch (error) {
      console.error("[ERROR] Failed to start main.py:", error);
      alert("Error starting Mars AI Assistant: " + error.message);
    }
  };

  return (
    <div className="energy-doc-page">
      <header className="energy-doc-header">
        <button 
          onClick={goBackHome} 
          className="back-button"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="energy-doc-title">Energy Document Assistant</h1>
      </header>

      <main className="energy-doc-content">
        <div className="welcome-section">
          <h2>Welcome to Energy Document Assistant</h2>
          <p>
            I am your AI assistant for identifying areas of high energy potential.
            My goal is to help humanity survive as a multiplanetary society by
            providing insights into energy rich zones.
          </p>
          
          <div className="file-upload-container">
            <FileUpload onImageUpload={() => {}} />
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleStartMain}
              className="start-energy-doc-btn"
            >
              Start Energy Doc
            </button>
          </div>
        </div>

        <EnergyDocComposer />
      </main>
    </div>
  );
}

export default EnergyDocPage;
