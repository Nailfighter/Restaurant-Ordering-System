import React from "react";
import { motion } from "framer-motion";
import Tag from "./Tag.jsx";
import QuantitySelector from "./Quantity_Selector.jsx";
import "../styles/scss/Food_Card.scss";

const FoodCard = (props) => {
  return (
    <motion.div
      className="card"
      style={{ display: props.show }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header">
        <div className={`card-images${props.image2 ? " split" : ""}`}>
          <img src={props.image} alt={props.name} />
          {props.image2 && <img src={props.image2} alt="Mango Lassi" />}
        </div>
        <h6>{props.name}</h6>
        <div className="tags">
          <Tag tags={props.tags} />
        </div>
      </div>
      <div className="card-footer">
        <div className="price-container">
          <span>${props.price}</span>
        </div>
        <QuantitySelector id={props.id} name={props.name} price={props.price} alias={props.alias} />
      </div>
    </motion.div>
  );
};

export default FoodCard;
