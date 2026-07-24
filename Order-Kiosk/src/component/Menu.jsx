import React, { useState } from "react";
import { motion } from "framer-motion";
import Food_Card from "./Food_Card.jsx";
import Food_List from "../Food_List.jsx";
import "../styles/scss/App.scss";

const tabs = {
  Combo: [1, 2, 3],
  "Combo + Lassi": [4, 5, 6, 7],
  "A La Carte": [8, 9],
  Drinks: [10, 11, 12],
  Extras: [13],
};

function filterFoodList(tab) {
  const ids = tabs[tab];
  return Food_List.map((item, index) => (
    <Food_Card
      key={index}
      id={item.id}
      image={item.image}
      image2={item.image2}
      name={item.name}
      alias={item.alias}
      price={item.price}
      tags={item.tags}
      show={ids.includes(item.id) ? "flex" : "none"}
    />
  ));
}

const Menu = () => {
  const [selectedTab, setSelectedTab] = useState("Combo");

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
