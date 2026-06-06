const express = require("express");
const cors = require("cors");
require("dotenv").config();

const reportRoutes = require("./routes/reports");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("StreetFix Taiwan Backend Running");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Server is healthy"
    });
});

app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});