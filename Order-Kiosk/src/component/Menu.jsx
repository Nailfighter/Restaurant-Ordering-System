import React from "react";
import Food_Card from "./Food_Card.jsx";

import "../styles/scss/App.scss";

const Menu = () => {
  return (
    <div className="menu-layout">
      <Food_Card />
      <Food_Card />
      <Food_Card />
      <Food_Card />
      <Food_Card />
      <Food_Card />
      <Food_Card />
    </div>
  );
};

export default Menu;
