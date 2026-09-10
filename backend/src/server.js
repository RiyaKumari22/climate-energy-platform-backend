const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const datasetRoutes = require("./routes/datasetRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/datasets", datasetRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Climate Energy Platform API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});