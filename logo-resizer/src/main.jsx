import React from "react";
import { createRoot } from "react-dom/client";
import LogoResizer from "./LogoResizer.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LogoResizer />
  </React.StrictMode>
);
