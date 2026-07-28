// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css"; // Tailwind imports  --by import we tell vite to  Loads global styles (globals.css → Tailwind directives).
import "./i18n"; // Initialize i18next          ---which runs i18n/index.ts

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
