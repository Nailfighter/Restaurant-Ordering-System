import React, { useState } from "react";
import { motion } from "framer-motion";
import Food_Card from "./Food_Card.jsx";
import Food_List from "../Food_List.jsx";
import "../styles/scss/App.scss";

const tabs = {
  All: [1, 15],
  Box: [1, 5],
  Combo: [6, 9],
  Entree: [10, 12],
  Drinks: [13, 15],
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
      alias={item.alias}
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
          <motion.button
            key={tab}
            className={selectedTab === tab ? "tab-selected" : "tab-unselected"}
            onClick={() => setSelectedTab(tab)}
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {tab}
          </motion.button>
        ))}
      </div>
      <motion.div
        className="containner"
        key={selectedTab} 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: 20 }} 
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {filterFoodList(selectedTab)}
      </motion.div>
    </div>
  );
};

export default Menu;
