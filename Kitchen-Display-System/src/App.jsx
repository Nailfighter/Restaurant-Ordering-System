import React, { useContext, useEffect } from "react";
import "./styles/App.scss";

import Header from "./component/Header.jsx";
import Active_Orders from "./component/Active_Orders.jsx";

import { TabsContext } from "./component/Tabs.jsx";

function App() {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  return (
    <>
      <Header />
      <Active_Orders />
    </>
  );
}

export default App;
