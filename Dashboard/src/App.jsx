import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FilterPane from "./component/Filter_Pane";
import OverallStats from "./component/Overall_Stats";
import ItemSalePie from "./component/Item_Sale";
import ItemNumberPie from "./component/Item_Numbers";

import "./styles/App.scss";
import Insights from "./component/Insights";
import LineInfo from "./component/Line_Info";
import { FilterProvider } from "./FilterContext";
import Credentials from "./component/Credentials";
import AuthTicket from "./component/Auth_Ticket";
import ApprovalPending from "./component/Approval_Pending";
import { SERVICE, SignOutFab } from "./component/AuthGate";
import { useAuth } from "./AuthContext";

import "./Fetch_Data";

function Dashboard() {
  return (
    <FilterProvider>
      {/* <Credentials /> */}
      <div className="default">
        {/* <FilterPane /> */}
        <div className="dashboard">
          <OverallStats />
          <div className="pie-charts">
            <ItemSalePie />
            <div className="insights">
              <ItemNumberPie />
              <Insights />
            </div>
          </div>
        </div>
      </div>
      <SignOutFab />
    </FilterProvider>
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
            <Dashboard />
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
