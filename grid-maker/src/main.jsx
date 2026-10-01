import React from "react";
import { createRoot } from "react-dom/client";
import GridMaker from "./GridMaker.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GridMaker />
  </React.StrictMode>
);
