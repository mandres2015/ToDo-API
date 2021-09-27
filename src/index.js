const express = require("express");
const app = express();
const router = require("./api/v1/taskRoutes.js");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3100;

const cors = require("cors");

const corsOptions = {
  origin: "*",
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

app.listen(PORT, () => {
  console.warn(`App listening on http://localhost:${PORT}`);
});