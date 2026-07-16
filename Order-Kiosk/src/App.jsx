import React, { useRef, useEffect, useContext } from "react";
import { MotionConfig } from "framer-motion";
import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./Cart.jsx";
import Header from "./component/Header.jsx";
import Menu from "./component/Menu.jsx";
import Order_Review from "./component/Order_Review.jsx";
import Confirmation_Screen from "./component/Confirmation_Screen.jsx";
import ResolutionChecker from "./component/Resolution_Checker.jsx";
import Auth from "./component/Auth.jsx";
import AuthTicket from "./component/Auth_Ticket.jsx";
import ApprovalPending from "./component/Approval_Pending.jsx";
import Admin from "./component/Admin.jsx";
import { useWidth } from "./WidthContext";
import { useAuth } from "./AuthContext";

// Auth screen design: "split" = brand panel + card fan, "ticket" = printed receipt
const AUTH_DESIGN = "ticket";

import "./styles/scss/App.scss";

const apiURL = import.meta.env.VITE_API_URL;

const checkConnectionToAPI = async () => {
  try {
    const response = await fetch(`${apiURL}/api/test`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`API connected (supabase: ${data.supabase})`);
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Internet or API connection failed");
  }
};

function Kiosk() {
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

  useEffect(() => {
    checkConnectionToAPI();
    const interval = setInterval(checkConnectionToAPI, 10000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <CartProvider>
      <MotionConfig reducedMotion="user">
        <div className="default">
          <div className="main">
            <Header />
            <h2>Categories</h2>
            <Menu />
          </div>
          <div className="space" ref={spaceRef}></div>
          <Order_Review />
          <Confirmation_Screen />
        </div>
      </MotionConfig>
    </CartProvider>
  );
}

function App() {
  const { session, loading, access, isAdmin } = useAuth();
  const approved = access.kiosk;

  if (loading) return null;

  const authScreen = AUTH_DESIGN === "ticket" ? <AuthTicket /> : <Auth />;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !session ? (
            authScreen
          ) : approved ? (
            <Navigate to="/app" replace />
          ) : (
            <ApprovalPending />
          )
        }
      />
      <Route
        path="/app"
        element={
          !session ? (
            <Navigate to="/login" replace />
          ) : approved ? (
            <Kiosk />
          ) : (
            <ApprovalPending />
          )
        }
      />
      <Route
        path="/admin"
        element={
          isAdmin ? (
            <Admin />
          ) : (
            <Navigate to={session ? "/app" : "/login"} replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={session ? "/app" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
