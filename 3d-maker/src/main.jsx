import React from "react";
import { createRoot } from "react-dom/client";
import ThreeDMaker from "./ThreeDMaker.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThreeDMaker />
  </React.StrictMode>
);
