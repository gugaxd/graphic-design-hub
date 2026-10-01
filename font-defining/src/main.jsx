import React from "react";
import { createRoot } from "react-dom/client";
import FontDefining from "./FontDefining.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FontDefining />
  </React.StrictMode>
);
