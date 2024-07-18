import React from "react";
import Tag from "./Tag.jsx";
import QuantitySelector from "./Quantiy_Selector.jsx";

import "../styles/scss/Food_Card.scss";

const FoodCard = (props) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={props.image} alt="food" />
      </div>
      <div className="card-content">
        <h3>{props.name}</h3>
        <div className="card-content-tags">
          <Tag text="Spicy" />
          <Tag text="Diary" />
        </div>
        <div className="card-content-price">
          <h4>$</h4>
          <h4>{props.price}</h4>
        </div>
        <p>{props.description}</p>
        <QuantitySelector />
      </div>
    </div>
  );
};

export default FoodCard;
