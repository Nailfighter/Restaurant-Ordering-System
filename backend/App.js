const { addOrder, getAllOrders } = require("./Database");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/api", (req, res) => {
  res.status(200);
  res.send({
    message: "Hello from the server!",
    time: new Date().toISOString(),
  });
});

app.post("/api", (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    res.send({
      message: "Name is required",
      time: new Date().toISOString(),
    });
    return;
  }

  res.status(200);
  res.send({
    message: `Hello, ${name}!`,
    time: new Date().toISOString(),
  });
});
