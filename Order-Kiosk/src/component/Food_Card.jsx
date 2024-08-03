import React, { useEffect, useRef } from "react";
import Tag from "./Tag.jsx";
import QuantitySelector from "./Quantiy_Selector.jsx";
import "../styles/scss/Food_Card.scss";

const FoodCard = (props) => {
  const h6Ref = useRef(null);

  useEffect(() => {
    const adjustFontSize = () => {
      const element = h6Ref.current;
      let fontSize = 34;
      element.style.fontSize = fontSize + "px";
      element.style.whiteSpace = "nowrap"; // Prevent initial wrapping for measurement
      while (element.scrollWidth > element.clientWidth && fontSize > 30) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
      }
      element.style.whiteSpace = "";
    };
    adjustFontSize();
    window.addEventListener("resize", adjustFontSize);
    return () => {
      window.removeEventListener("resize", adjustFontSize);
    };
  });

  return (
    <div className="card" style={{ display: props.show }}>
      <div className="card-header">
        <img src={props.image} alt="food" />
        <h6 ref={h6Ref}>{props.name}</h6>
        <div className="tags">
          <Tag tags={props.tags} />
        </div>
      </div>
      <div className="card-footer">
        <div className="price-containner">
          <span>${props.price}</span>
        </div>
        <QuantitySelector id={props.id} name={props.name} price={props.price} />
      </div>
    </div>
  );
};

export default FoodCard;
