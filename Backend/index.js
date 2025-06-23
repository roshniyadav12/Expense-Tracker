const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const expenseRoute = require("./routes/expense");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/expenses", expenseRoute);

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log("DB connection is successful"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
