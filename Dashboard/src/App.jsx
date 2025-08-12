import { useState } from "react";
import FilterPane from "./component/Filter_Pane";
import OverallStats from "./component/Overall_Stats";
import ItemSalePie from "./component/Item_Sale";
import ItemNumberPie from "./component/Item_Numbers";

import "./styles/App.scss";
import Insights from "./component/Insights";
import LineInfo from "./component/Line_Info";
import { FilterProvider } from "./FilterContext";
import Credentials from "./component/Credentials";

import "./Fetch_Data";

function App() {
  return (
    <FilterProvider>
      {/* <Credentials /> */}
      <div className="default">
        {/* <FilterPane /> */}
        <div className="dashboard">
          <OverallStats />
          <div className="pie-charts">
            <ItemSalePie />
            <div className="insights">
              <ItemNumberPie />
              <Insights />
            </div>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}

export default App;
