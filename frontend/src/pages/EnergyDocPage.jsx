import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Mic } from "lucide-react";
import EnergyDocComposer from "../components/EnergyDocComposer";
import { FileUpload } from "../components/FileUpload";
import { runMainScript } from "../services/api";
import "../styles/energyDocPage.css";

function EnergyDocPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your Energy Document Assistant. How can I help you identify areas of high energy potential today?" },
  ]);
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 144) + "px";
    }
  }, [input]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input.trim() };
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Analyzing energy potential... Let me process your request and identify high-energy zones." },
      ]);
    }, 1000);
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
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "🚀 Mars AI Assistant started successfully! Ready to analyze energy documents." 
        }]);
      } else {
        console.error("[ERROR] main.py execution failed:", result.stderr);
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "❌ Failed to start Mars AI Assistant. Please check the console for details." 
        }]);
      }
    } catch (error) {
      console.error("[ERROR] Failed to start main.py:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "⚠️ Error starting Mars AI Assistant: " + error.message 
      }]);
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
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about energy potential..."
                className="chat-textarea"
                rows={1}
              />
              <button
                onClick={handleStartMain}
                className="action-btn secondary"
                title="Start Mars AI Assistant"
              >
                🤖
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="action-btn primary"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={() => alert("Voice input coming soon!")}
                className="action-btn secondary"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="tools-section">
          <EnergyDocComposer />
          <div className="file-upload-section">
            <FileUpload onImageUpload={() => {}} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default EnergyDocPage;
