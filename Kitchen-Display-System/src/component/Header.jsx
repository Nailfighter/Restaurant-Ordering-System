import React, { useEffect, useContext } from "react";
import "../styles/Header.scss";

import { TabsContext } from "./Tabs";

const Header = () => {
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
      <div className="header-buttons">
        <button>
          <img src={"/Icon/Full-Volume.png"} />
        </button>
        <button>
          <img src="/Icon/Insight.png" />
        </button>
      </div>
      <div className="header-center">
        <div className="header-tabs">
          <div
            className="header-tabs-rec"
            style={{ marginLeft: activeTab == "History" ? "50%" : "0%" }}
          ></div>
          <div className="header-tabs-buttons">
            <button
              style={{ color: activeTab == "Active" ? "#EBAB5E" : "#E4E4E4" }}
              onClick={() => setActiveTab("Active")}
            >
              Active
            </button>
            <button
              style={{ color: activeTab == "History" ? "#EBAB5E" : "#E4E4E4" }}
              onClick={() => setActiveTab("History")}
            >
              History
            </button>
          </div>
        </div>
      </div>
      <div className="header-clock">
        <img src="/Icon/clock.png" />
        <span>{curTime}</span>
      </div>
    </div>
  );
};

export default Header;
