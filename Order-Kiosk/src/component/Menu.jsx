import React, { useState } from "react";
import Food_Card from "./Food_Card.jsx";
import Food_List from "../Food_List.jsx";
import "../styles/scss/App.scss";

const tabs = {
  All: [1, 15],
  Box: [1, 4],
  Combo: [5, 8],
  Entree: [9, 11],
  Drinks: [12, 15],
};

function isBetween(num, min, max) {
  return num >= min && num <= max;
}

function filterFoodList(tab) {
  const [start, end] = tabs[tab];
  return Food_List.map((item, index) => (
    <Food_Card
      key={index}
      id={item.id}
      image={item.image}
      name={item.name}
      price={item.price}
      tags={item.tags}
      show={isBetween(item.id, start, end) ? "flex" : "none"}
    />
  ));
}

const Menu = () => {
  const [selectedTab, setSelectedTab] = useState("All");

  return (
    <div className="food-content">
      <div className="tabs">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            className={selectedTab === tab ? "tab-selected" : "tab-unselected"}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="containner">{filterFoodList(selectedTab)}</div>
    </div>
  );
};

export default Menu;
