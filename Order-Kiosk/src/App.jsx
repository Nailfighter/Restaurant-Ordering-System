import React, { useContext } from "react";
import { CartProvider } from "./Cart.jsx";
import Header from "./component/Header.jsx";
import Menu from "./component/Menu.jsx";
import Order_Review from "./component/Order_Review.jsx";
import Confirmation_Screen from "./component/Confirmation_Screen.jsx";
import { ConfirmationContext } from "./ConfirmationContext.jsx";

import "./styles/scss/App.scss";

function App() {
  const { showConfirmation } =
    useContext(ConfirmationContext);

  return (
    <CartProvider>
      <div className="default">
        <div className="main">
          <Header />
          <h2>Categories</h2>
          <Menu />
        </div>
        <div className="space"></div>
        <Order_Review />
        {showConfirmation && <Confirmation_Screen />}
      </div>
    </CartProvider>
  );
}

export default App;
