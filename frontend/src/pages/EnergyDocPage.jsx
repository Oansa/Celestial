import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { FileUpload } from "../components/FileUpload";
import { ChatInput } from "../components/ChatInput";
import { runMainScript } from "../services/api";

function EnergyDocPage() {
  const navigate = useNavigate();

  const goBackHome = () => {
    navigate("/");
  };

  const handleSendMessage = (message) => {
    console.log("Message sent:", message);
    // Handle message sending logic here
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
    <div className="energy-doc-page-container">
      <button className="back-button" onClick={goBackHome}>
        ← Home
      </button>

      <div className="energy-doc-content">
        <h1 className="energy-doc-page-heading">Welcome, I'm Energy Doc</h1>

        <p className="energy-doc-page-text">
          I am your AI assistant for identifying areas of high energy potential.
          My goal is to help humanity survive as a multiplanetary society by
          providing insights into energy rich zones.
        </p>

        <div className="file-upload-wrapper">
          <FileUpload />
        </div>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <button 
            className="start-button" 
            onClick={handleStartMain}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '20px'
            }}
          >
            Start Energy Doc
          </button>
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

export default EnergyDocPage;