import React from "react";
import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import EnergyDocPage from "./pages/EnergyDocPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/energy-doc" element={<EnergyDocPage />} />
    </Routes>
  );
}

export default App;
