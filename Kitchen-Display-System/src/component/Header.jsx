import React, { useEffect, useContext } from "react";
import "../styles/Header.scss";

import { TabsContext } from "./Tabs";
import { useAuth } from "../AuthContext";

const Header = () => {
  const { signOut } = useAuth();
  const [curTime, setCurTime] = React.useState(new Date().toLocaleTimeString());
  const [curDate, setCurDate] = React.useState(new Date().toLocaleDateString());
  const { activeTab, setActiveTab } = useContext(TabsContext);

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours() % 12 || 12;
      const minutes = date.getMinutes();
      const ampm = date.getHours() >= 12 ? "PM" : "AM";
      const timeString = `${hours}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
      setCurTime(timeString);
      setCurDate(date.toLocaleDateString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="header">
      <div className="header-clock">
        <img src="Icon/clock.png" alt="" aria-hidden="true" />
        <span>{curTime}</span>
      </div>
      <div className="header-center">
        <div className="header-tabs">
          <div
            className="header-tabs-rec"
            style={{ marginLeft: activeTab == "History" ? "50%" : "0%" }}
          ></div>
          <div className="header-tabs-buttons">
            <button
              className={activeTab == "Active" ? "active" : ""}
              aria-pressed={activeTab == "Active"}
              onClick={() => setActiveTab("Active")}
            >
              Active
            </button>
            <button
              className={activeTab == "History" ? "active" : ""}
              aria-pressed={activeTab == "History"}
              onClick={() => setActiveTab("History")}
            >
              History
            </button>
          </div>
        </div>
      </div>
      <button className="header-signout" onClick={signOut}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Header;
