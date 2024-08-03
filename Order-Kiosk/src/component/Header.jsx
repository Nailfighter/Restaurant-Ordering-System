import React from "react";

const Header = () => {
  return (
    <div className="header">
      <div className="search-box">
        <img src="./Icon/Search.png" alt="Search" />
        <input className="search-input" placeholder="Search for order number" />
      </div>
    </div>
  );
};

export default Header;
