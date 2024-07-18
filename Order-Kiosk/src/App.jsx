import Menu from "./component/Menu.jsx";
import Order_Review from "./component/Order_Review.jsx";
import "./styles/scss/App.scss";

function App() {
  return (
    <div className="default">
      <Menu />
      <div className="space"></div>
      <Order_Review />
    </div>
  );
}

export default App;
