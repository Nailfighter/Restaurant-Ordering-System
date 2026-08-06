// Event dates shown in the dashboard's day filter. Update this list each year
// (keep Dashboard/src/Event_Days.jsx in sync — same day numbers, same dates).
const EVENT_DAYS = {
  "1": "2026-08-05",
  "2": "2026-08-06",
  "3": "2026-08-07",
};

const DEFAULT_DAY = "1";

const getDateByNum = (num) => EVENT_DAYS[num] || EVENT_DAYS[DEFAULT_DAY];

module.exports = { EVENT_DAYS, getDateByNum };
