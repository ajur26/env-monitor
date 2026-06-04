import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { applyTheme, getSavedTheme } from "./theme/theme";

applyTheme(getSavedTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/envmonitorapp">
      <App />
    </BrowserRouter>
  </StrictMode>
);
