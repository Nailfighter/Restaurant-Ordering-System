import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.scss";

import Header from "./component/Header.jsx";
import Active_Orders from "./component/Active_Orders.jsx";
import AuthTicket from "./component/Auth_Ticket.jsx";
import ApprovalPending from "./component/Approval_Pending.jsx";
import { SERVICE } from "./component/AuthGate.jsx";
import { useAuth } from "./AuthContext";

function Kitchen() {
  return (
    <>
      <Header />
      <Active_Orders />
    </>
  );
}

function App() {
  const { session, loading, access } = useAuth();

  if (loading) return null;

  const hasAccess = access[SERVICE.key];
  const pending = <ApprovalPending serviceLabel={SERVICE.label} />;
  const login = (
    <AuthTicket eyebrow={SERVICE.eyebrow} actionLabel={SERVICE.action} />
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !session ? login : hasAccess ? <Navigate to="/app" replace /> : pending
        }
      />
      <Route
        path="/app"
        element={
          !session ? (
            <Navigate to="/login" replace />
          ) : hasAccess ? (
            <Kitchen />
          ) : (
            pending
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
