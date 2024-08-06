import React, { useContext, useEffect } from "react";
import Food_List from "../Food_List.jsx";
import { Card, Divider, Select, SelectItem } from "@tremor/react";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { FilterContext } from "../FilterContext";

const DayFilter = ({ value, setValue }) => (
  <Select
    id="day"
    name="Day Filter"
    value={value}
    onValueChange={setValue}
    className="mt-2"
  >
    <SelectItem value="All">All</SelectItem>
    <SelectItem value="8/7">Aug 7, 2024</SelectItem>
    <SelectItem value="8/8">Aug 8, 2024</SelectItem>
    <SelectItem value="8/9">Aug 9, 2024</SelectItem>
  </Select>
);

const TimeFilter = ({ startTime, endTime, setStartTime, setEndTime }) => {
  const format = "hh:mm A";

  return (
    <div className="time-filter">
      <div className="time-header">
        <p className="mt-[10px] text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Choose Hours
        </p>
      </div>
      <div className="time-picker">
        <TimePicker
          use12Hours
          value={startTime}
          onChange={setStartTime}
          format={format}
        />
        <p className="mt-[5px] text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          To
        </p>
        <TimePicker
          use12Hours
          value={endTime}
          onChange={setEndTime}
          format={format}
        />
      </div>
    </div>
  );
};

const ItemFilter = ({ value, setValue }) => (
  <Select
    id="item"
    name="Item Filter"
    value={value}
    onValueChange={setValue}
    className="mt-2"
  >
    <SelectItem value="All">All</SelectItem>
    {Food_List.map((item, index) => (
      <SelectItem key={index} value={item.id}>
        {item.name}
      </SelectItem>
    ))}
  </Select>
);

const FilterPane = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedItem,
    setItem,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  } = useContext(FilterContext);

  useEffect(() => {
    // Reset to default times when the selected date changes
    if (selectedDate !== "All") {
      setStartTime(dayjs("8:00 AM", "hh:mm A"));
      setEndTime(dayjs("10:00 PM", "hh:mm A"));
    }
  }, [selectedDate]);

  return (
    <div>
      <Card className="mx-auto max-w-xs filter-plane">
        <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
          Filter
        </p>
        <Divider />
        <p className="mt-[5px] text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Choose Day
        </p>
        <DayFilter value={selectedDate} setValue={setSelectedDate} />
        <AnimatePresence>
          {selectedDate !== "All" && (
            <motion.div
              key="timeFilter"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TimeFilter
                startTime={startTime}
                endTime={endTime}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-[15px] text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Choose Item
        </p>
        <ItemFilter value={selectedItem} setValue={setItem} />
      </Card>
    </div>
  );
};

export default FilterPane;
