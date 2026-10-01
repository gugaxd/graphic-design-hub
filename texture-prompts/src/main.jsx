import React from "react";
import { createRoot } from "react-dom/client";
import TexturePrompts from "./TexturePrompts.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TexturePrompts />
  </React.StrictMode>
);
