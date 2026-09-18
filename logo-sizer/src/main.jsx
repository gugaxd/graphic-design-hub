import React from "react";
import { createRoot } from "react-dom/client";
import LogoSizer from "./LogoSizer.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LogoSizer />
  </React.StrictMode>
);
