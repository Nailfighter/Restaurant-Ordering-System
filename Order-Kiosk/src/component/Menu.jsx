import React from "react";
import Food_Card from "./Food_Card.jsx";
import Food_List from "../Food_List.jsx";
import "../styles/scss/App.scss";

const Food_Items = Food_List.map((item) => (
  <Food_Card
    image={item.image}
    name={item.name}
    description={item.description}
    price={item.price}
    tags={item.tags}
  />
));

const Menu = () => {
  return <div className="menu-layout">{Food_Items}</div>;
};

export default Menu;
