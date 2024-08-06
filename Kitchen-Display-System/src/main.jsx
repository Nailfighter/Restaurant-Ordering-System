import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { TabsProvider } from "./component/Tabs.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TabsProvider>
        <App />
    </TabsProvider>
  </React.StrictMode>
);
