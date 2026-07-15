import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { TabsProvider } from "./component/Tabs.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <TabsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TabsProvider>
    </AuthProvider>
  </React.StrictMode>
);
