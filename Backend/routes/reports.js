const express = require("express");
const router = express.Router();
const db = require("../firebase");

router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            latitude,
            longitude,
            imageUrl,
            category,
            severity,
            aiSummary
        } = req.body;

        if (!title || !description || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                status: "error",
                message: "缺少必要欄位：title、description、latitude、longitude"
            });
        }

        const newReport = {
            title,
            description,
            latitude,
            longitude,
            
            imageUrl: req.body.imageUrl || "",
            category: req.body.category || "",
            severity: req.body.severity || "",
            aiSummary: req.body.aiSummary || "",

            status: "pending",
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("reports").add(newReport);

        res.status(201).json({
            status: "success",
            message: "通報建立成功，已存入 Firestore",
            data: {
                id: docRef.id,
                ...newReport
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "建立通報失敗",
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const snapshot = await db
            .collection("reports")
            .orderBy("createdAt", "desc")
            .get();

        const reports = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            status: "success",
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "取得通報失敗",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const doc = await db.collection("reports").doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({
                status: "error",
                message: "找不到此通報"
            });
        }

        res.json({
            status: "success",
            data: {
                id: doc.id,
                ...doc.data()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "取得單一通報失敗",
            error: error.message
        });
    }
});

module.exports = router;