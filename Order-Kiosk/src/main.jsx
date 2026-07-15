import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ConfirmationProvider } from "./ConfirmationContext.jsx";
import { WidthProvider } from "./WidthContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ConfirmationProvider>
        <WidthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WidthProvider>
      </ConfirmationProvider>
    </AuthProvider>
  </React.StrictMode>
);
