import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Food_Card from "./Food_Card.jsx";
import Food_List from "../Food_List.jsx";
import "../styles/scss/App.scss";

const tabs = {
  Base: [1, 2, 3],
  Combo: [4, 5, 6, 7],
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
  const [selectedTab, setSelectedTab] = useState("Base");
  const tabsRef = useRef(null);
  const [tabsWidth, setTabsWidth] = useState(null);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const updateWidth = () => setTabsWidth(el.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="food-content">
      <div className="tabs-wrap">
        <div className="tabs" ref={tabsRef}>
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
        <div
          className="callout-row"
          style={tabsWidth ? { width: tabsWidth } : undefined}
        >
          <motion.div
            className="menu-callout"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Base comes with rice and naan
          </motion.div>
          <motion.div
            className="menu-callout"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Combo comes with base & mango lassi
          </motion.div>
        </div>
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
