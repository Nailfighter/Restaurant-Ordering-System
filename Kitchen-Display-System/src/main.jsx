import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { TabsProvider } from "./component/Tabs.jsx";
import { MuteProvider } from "./component/Mute_Context.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TabsProvider>
      <MuteProvider>
        <App />
      </MuteProvider>
    </TabsProvider>
  </React.StrictMode>
);
