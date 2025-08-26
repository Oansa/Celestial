import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import { FileUpload } from "../components/FileUpload";
import { runMainScript, sendChatMessage } from "../services/api";
import "../styles/energyDocPage.css";
import "../styles/chat.css";

function EnergyDocPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your Energy Document Assistant. How can I help you identify areas of high energy potential today?" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to convert file to base64 with validation
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Validate that the input is a File or Blob object
      if (!(file instanceof File || file instanceof Blob)) {
        console.warn("Invalid file type. Expected File or Blob object.");
        reject(new Error("Invalid file type. Expected File or Blob object."));
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload from FileUpload component
  const handleImageUpload = async (file) => {
    try {
      const base64Data = await fileToBase64(file);
      setUploadedImage(base64Data);
      console.log("Image uploaded and converted to base64");
    } catch (error) {
      console.error("Failed to convert image to base64:", error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    const newMessage = { role: "user", content: inputText.trim() };
    setMessages([...messages, newMessage]);
    setInputText("");

    try {
      console.log("Sending message to backend:", inputText.trim());
      console.log("Uploaded image:", uploadedImage ? "Yes" : "No");
      
      // Send message to the Agent with image data if available
      const response = await sendChatMessage(inputText.trim(), uploadedImage);
      console.log("Backend response received:", response);
      
      const assistantMessage = {
        role: "assistant",
        content: response.ai_response || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Clear the uploaded image after sending
      setUploadedImage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      console.error("Error details:", error.message, error.stack);
      
      const errorMessage = {
        role: "assistant",
        content: `Error: ${error.message || "Failed to get response from Agent. Please check if the backend server is running."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
        
        // Extract and display the actual speech output
        const speechOutput = result.stdout || "Mars AI Assistant started successfully!";
        const cleanOutput = speechOutput.trim();
        
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `🚀 ${cleanOutput}` 
        }]);
      } else {
        console.error("[ERROR] main.py execution failed:", result.stderr);
        const errorMessage = result.stderr || "Failed to start Mars AI Assistant";
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `❌ ${errorMessage}` 
        }]);
      }
    } catch (error) {
      console.error("[ERROR] Failed to start main.py:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `⚠️ Error starting Mars AI Assistant: ${error.message}` 
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        <div className="chat-container">
          {/* Chat messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.role === "user" ? "user-message" : "assistant-message"}`}
              >
                <div className="message-content">
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input composer */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <button
                onClick={handleStartMain}
                className="action-btn secondary"
                title="Start Mars AI Assistant"
              >
                🤖
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about energy potential..."
                className="chat-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="action-btn primary"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="tools-section">
          <div className="file-upload-section">
            <FileUpload onImageUpload={handleImageUpload} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default EnergyDocPage;
