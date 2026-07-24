import React, { useState } from "react";
import { motion } from "framer-motion";
import Food_Card from "./Food_Card.jsx";
import Food_List from "../Food_List.jsx";
import "../styles/scss/App.scss";

const tabs = {
  All: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  Combo: [1, 2, 3],
  "A La Carte": [4, 5],
  Drinks: [6, 7, 8],
  Extras: [9],
};

function filterFoodList(tab) {
  const ids = tabs[tab];
  return Food_List.map((item, index) => (
    <Food_Card
      key={index}
      id={item.id}
      image={item.image}
      name={item.name}
      alias={item.alias}
      price={item.price}
      tags={item.tags}
      show={ids.includes(item.id) ? "flex" : "none"}
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
            aria-pressed={selectedTab === tab}
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
        className="container"
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
