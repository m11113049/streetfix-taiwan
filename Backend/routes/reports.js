const express = require("express");
const router = express.Router();
const db = require("../firebase");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 建立 uploads 資料夾
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// multer 設定：圖片存到 backend/uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// 新增通報，可接收圖片
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const {
            title,
            description,
            latitude,
            longitude,
            category,
            severity,
            aiSummary,
            aiSuggestedAction
        } = req.body;

        if (!title || !description || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                status: "error",
                message: "缺少必要欄位：title、description、latitude、longitude"
            });
        }

        let imageUrl = "";

        if (req.file) {
            imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const newReport = {
            title,
            description,
            latitude: Number(latitude),
            longitude: Number(longitude),

            imageUrl,
            imageName: req.file
                ? Buffer.from(req.file.originalname, "latin1").toString("utf8")
                : "",

            category: category || "",
            severity: severity || "",
            aiSummary: req.body.aiSummary || "",
            aiSuggestedAction: req.body.aiSuggestedAction || "",
            
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
            },
            imageUrl
        });
    } catch (error) {
        console.error("建立通報失敗：", error);

        res.status(500).json({
            status: "error",
            message: "建立通報失敗",
            error: error.message
        });
    }
});

// 取得全部通報
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

// 取得單一通報
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