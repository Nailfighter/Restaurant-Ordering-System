import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

if (typeof browser === "undefined") {
  var browser = chrome;
}



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
