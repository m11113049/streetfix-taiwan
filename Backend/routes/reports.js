const express = require("express");
const router = express.Router();

let reports = [];

router.post("/", (req, res) => {
    const { title, description, latitude, longitude } = req.body;

    if (!title || !description || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            status: "error",
            message: "缺少必要欄位：title、description、latitude、longitude"
        });
    }

    const newReport = {
        id: Date.now().toString(),
        title,
        description,
        latitude,
        longitude,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    reports.push(newReport);

    res.status(201).json({
        status: "success",
        message: "通報建立成功",
        data: newReport
    });
});

router.get("/", (req, res) => {
    res.json({
        status: "success",
        count: reports.length,
        data: reports
    });
});

router.get("/:id", (req, res) => {
    const report = reports.find((item) => item.id === req.params.id);

    if (!report) {
        return res.status(404).json({
            status: "error",
            message: "找不到此通報"
        });
    }

    res.json({
        status: "success",
        data: report
    });
});

module.exports = router;