import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "../styles/chat.css";
import { FileUpload } from "../components/FileUpload";
import { ChatInput } from "../components/ChatInput";
import { ChatDisplay } from "../components/ChatDisplay";
import { runMainScript, sendChatMessage } from "../services/api";

function EnergyDocPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const goBackHome = () => {
    navigate("/");
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get image data if available
      let imageData = null;
      if (uploadedImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = uploadedImage;
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        imageData = canvas.toDataURL('image/jpeg');
      }

      // Send message to backend
      const response = await sendChatMessage(message, imageData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Add AI response to chat
      const aiMessage = {
        text: response.ai_response || "I couldn't generate a response. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        detections: response.detections || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage = {
        text: `Error: ${error.message || 'Failed to get response from Energy Doc'}`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (imageUrl) => {
    setUploadedImage(imageUrl);
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
          <FileUpload onImageUpload={handleImageUpload} />
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

        <div className="chat-section" style={{ marginTop: '30px' }}>
          <ChatDisplay messages={messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export default EnergyDocPage;