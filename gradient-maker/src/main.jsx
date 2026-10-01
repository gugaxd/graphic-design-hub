import React from "react";
import { createRoot } from "react-dom/client";
import GradientMaker from "./GradientMaker.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GradientMaker />
  </React.StrictMode>
);
