import React, { createContext, useEffect, useState } from "react";
import { CartProvider } from "./Cart.jsx";
import Menu from "./component/Menu.jsx";
import Order_Review from "./component/Order_Review.jsx";

import "./styles/scss/App.scss";

function App() {

  return (
    <CartProvider>
      <div className="default">
        <Menu />
        <div className="space"></div>
        <Order_Review />
      </div>
    </CartProvider>
  );
}

export default App;
