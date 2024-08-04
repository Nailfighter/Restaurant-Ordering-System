import React, { useContext, useEffect } from "react";
import "./styles/App.scss";

import Header from "./component/Header.jsx";
import Active_Orders from "./component/Active_Orders.jsx";


function App() {

  return (
    <>
      <Header />
      <Active_Orders />
    </>
  );
}

export default App;
