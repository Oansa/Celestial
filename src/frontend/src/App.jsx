import React from "react";
import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import EnergyDocPage from "./pages/EnergyDocPage";
import ChatPage from "./pages/ChatPage";
import TerminalPage from "./pages/TerminalPage"; // Import the new TerminalPage component
import "./App.css";


function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/energy-doc" element={<EnergyDocPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/terminal" element={<TerminalPage />} /> {/* Add this line */}
    </Routes>
  );
}

export default App;
