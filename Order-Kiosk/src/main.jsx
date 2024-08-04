import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ConfirmationProvider } from "./ConfirmationContext.jsx";
import { WidthProvider } from "./WidthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfirmationProvider>
      <WidthProvider>
        <App />
      </WidthProvider>
    </ConfirmationProvider>
  </React.StrictMode>
);
