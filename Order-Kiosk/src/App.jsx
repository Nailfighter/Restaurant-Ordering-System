import React, { useRef, useEffect, useContext } from "react";
import { CartProvider } from "./Cart.jsx";
import Header from "./component/Header.jsx";
import Menu from "./component/Menu.jsx";
import Order_Review from "./component/Order_Review.jsx";
import Confirmation_Screen from "./component/Confirmation_Screen.jsx";
import ResolutionChecker from "./component/Resolution_Checker.jsx";
import { useWidth } from "./WidthContext";

import "./styles/scss/App.scss";

const apiURL = import.meta.env.VITE_API_URL;

const checkConnectionToAPI = async () => {
  try {
    const response = await fetch(`${apiURL}/api/test`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

function App() {
  const spaceRef = useRef(null);
  const { setWidth } = useWidth();

  useEffect(() => {
    const handleResize = () => {
      if (spaceRef.current) {
        const width = window.getComputedStyle(spaceRef.current).width;
        setWidth(width);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setWidth]);

  checkConnectionToAPI();

  return (
    <CartProvider>
      <div className="default">
        <div className="main">
          {/* <ResolutionChecker /> */}
          <Header />
          <h2>Categories</h2>
          <Menu />
        </div>
        <div className="space" ref={spaceRef}></div>
        <Order_Review />
        <Confirmation_Screen />
      </div>
    </CartProvider>
  );
}

export default App;
