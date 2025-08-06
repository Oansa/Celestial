import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import EnergyDocPage from "./pages/EnergyDocPage.jsx"; // create this next
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/energy-doc" element={<EnergyDocPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
