import React from "react";
import { createRoot } from "react-dom/client";
import WireframeMaker from "./WireframeMaker.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WireframeMaker />
  </React.StrictMode>
);
