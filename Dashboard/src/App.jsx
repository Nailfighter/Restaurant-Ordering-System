import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DayFilter from "./component/Day_Filter";
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
        <div className="dashboard">
          <header className="dash-header">
            <div>
              <h1>Analytics Dashboard</h1>
            </div>
            <div className="dash-header-controls">
              <DayFilter />
              <SignOutFab />
            </div>
          </header>

          <p className="section-label">Overview</p>
          <OverallStats />

          <p className="section-label">Sales Breakdown</p>
          <div className="pie-charts">
            <ItemSalePie />
            <div className="insights">
              <ItemNumberPie />
              <Insights />
            </div>
          </div>
        </div>
      </div>
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
