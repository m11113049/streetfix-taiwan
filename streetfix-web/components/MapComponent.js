import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

const defaultReports = [
  {
    id: 1,
    title: "台中市政府示範通報",
    description: "示範通報點",
    category: "其他",
    severity: "medium",
    imageUrl: "",
    location: {
      lat: 24.1477,
      lng: 120.6736,
    },
    status: "pending",
  },
];

function FlyToLocation({ position }) {
  const map = useMap();
  if (position) map.flyTo(position, 16);
  return null;
}

function ClickToAddReport({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent() {
  const [myPosition, setMyPosition] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [focusPosition, setFocusPosition] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("道路破損");
  const [severity, setSeverity] = useState("medium");
  const [imageFile, setImageFile] = useState(null);

  const [reports, setReports] = useState(defaultReports);

 
  useEffect(() => {
  async function fetchReports() {
    try {
      const response = await fetch("http://localhost:5000/api/reports");

      const data = await response.json();

      console.log("後端完整回傳資料：", data);

      const reportList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.reports)
          ? data.reports
          : [];

      console.log("整理後的 reportList：", reportList);

      const firebaseReports = reportList
        .map((report) => {
          const lat =
            report.latitude ??
            report.lat ??
            report.location?.lat ??
            report.location?.latitude;

          const lng =
            report.longitude ??
            report.lng ??
            report.location?.lng ??
            report.location?.longitude;

          return {
            id: report.id || report._id || report.docId || Date.now() + Math.random(),

            title: report.title || "未命名通報",
            description: report.description || "無描述",

            category: report.category || "其他",
            severity: report.severity || "medium",

            aiSummary: report.aiSummary || report.ai_summary || "",
            aiSuggestedAction:
              report.aiSuggestedAction ||
              report.ai_suggested_action ||
              "",

            imageUrl: report.imageUrl || "",

            location: {
              lat: Number(lat),
              lng: Number(lng),
            },

            status: report.status || "pending",
          };
        })
        .filter((report) => {
          return (
            !Number.isNaN(report.location.lat) &&
            !Number.isNaN(report.location.lng)
          );
        });

      console.log("轉換後要顯示在地圖上的資料：", firebaseReports);

      setReports(firebaseReports);
    } catch (error) {
      console.error("載入 Firebase 通報資料失敗：", error);
      setReports([]);
    }
  }

  fetchReports();
}, []);

  function getMyLocation() {
    if (!navigator.geolocation) {
      alert("你的瀏覽器不支援 GPS 定位");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      () => {
        alert("無法取得位置，請確認瀏覽器有允許定位");
      }
    );
  }

  function handleMapClick(lat, lng) {
    setSelectedPosition({ lat, lng });
    setTitle("");
    setDescription("");
    setCategory("道路破損");
    setSeverity("medium");
    setImageFile(null);
  }

  async function submitReport() {
  if (!selectedPosition) return;

  let aiResult = {
    title: "",
    category: category,
    severity: severity,
    aiSummary: "",
    aiSuggestedAction: "",
  };

  try {
    const aiFormData = new FormData();

      aiFormData.append("description", description);
      aiFormData.append("category", category);

      if (imageFile) {
        aiFormData.append("image", imageFile);
      }
    
      const aiResponse = await fetch("http://localhost:3001/api/ai/analyze", {
      method: "POST",
      body: aiFormData,
    });

    const aiData = await aiResponse.json();

    console.log("送出的手動分類：", category);
    console.log("AI 回傳結果：", aiData);
    console.log("AI data：", aiData.data);

    if (aiResponse.ok && aiData.success) {
      aiResult = {
        category: category,
        severity: aiData.data?.severity || severity,
        aiSummary: aiData.data?.ai_summary || "",
        aiSuggestedAction: aiData.data?.ai_suggested_action || "",
      };
    }
  } catch (error) {
    console.warn("AI 分析失敗，改用手動欄位：", error);
  }

  const newReport = {
    id: Date.now(),

    title:
      title ||
      aiResult.title ||
      `${category}通報`,

    description: description || "無補充描述",

    // 重要：Firebase 儲存也用手動選的分類
    category: category,

    severity: aiResult.severity || severity,

    aiSummary: aiResult.aiSummary || "",
    aiSuggestedAction: aiResult.aiSuggestedAction || "",

    location: {
      lat: selectedPosition.lat,
      lng: selectedPosition.lng,
    },

    status: "pending",
  };

  const formData = new FormData();

  formData.append("title", newReport.title);
  formData.append("description", newReport.description);

  // 重要：這裡會真正存進 Firebase
  formData.append("category", newReport.category);

  formData.append("aiSummary", newReport.aiSummary);
  formData.append("aiSuggestedAction", newReport.aiSuggestedAction);
  formData.append("severity", newReport.severity);
  formData.append("latitude", newReport.location.lat);
  formData.append("longitude", newReport.location.lng);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const response = await fetch("http://localhost:5000/api/reports", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("送到後端的新通報：", newReport);
    console.log("後端回傳：", data);
    console.log("狀態碼：", response.status);

    if (!response.ok) {
      throw new Error(data.message || "新增通報失敗");
    }

    setReports((prev) => [
      ...prev,
      {
        ...newReport,
        imageUrl: data.imageUrl || "",
      },
    ]);
  } catch (error) {
    console.error("新增通報失敗:", error);
    alert("新增通報失敗：" + error.message);
    return;
  }

  setSelectedPosition(null);
  setTitle("");
  setDescription("");
  setCategory("道路破損");
  setSeverity("medium");
  setImageFile(null);
}

  function deleteReport(id) {
    if (!confirm("確定要刪除這筆通報嗎？")) return;
    setReports((prev) => prev.filter((report) => report.id !== id));
  }

  function clearReports() {
    if (!confirm("確定要清除所有通報資料嗎？")) return;
    setReports(defaultReports);
  }

  function getStatusText(status) {
    if (status === "pending") return "尚未處理";
    if (status === "processing") return "處理中";
    if (status === "resolved") return "已完成";
    return status;
  }

  return (
    <div>
      <button onClick={getMyLocation}>取得目前位置</button>

      <button onClick={clearReports} style={{ marginLeft: "10px" }}>
        清除通報資料
      </button>

      <p>目前通報數量：{reports.length}</p>

      {selectedPosition && (
        <div
          style={{
            padding: "15px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f7f7f7",
            color: "#000",
          }}
        >
          <h3>新增通報</h3>

          <p>
            緯度：{selectedPosition.lat.toFixed(6)}
            <br />
            經度：{selectedPosition.lng.toFixed(6)}
          </p>

          <label>標題：</label>
          <br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：校門口道路出現大型坑洞"
            style={{ width: "100%", padding: "8px" }}
          />

          <br />
          <br />

          <label>問題描述：</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：校門口道路有明顯坑洞，機車經過容易危險"
            style={{ width: "100%", height: "80px", padding: "8px" }}
          />

          <br />
          <br />

          <label>分類：</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="道路破損">道路破損</option>
            <option value="路燈故障">路燈故障</option>
            <option value="垃圾堆積">垃圾堆積</option>
            <option value="排水異常">排水異常</option>
            <option value="人行道破損">人行道破損</option>
            <option value="交通號誌異常">交通號誌異常</option>
            <option value="其他">其他</option>
          </select>

          <br />
          <br />

          <label>嚴重程度：</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>

          <br />
          <br />

          <label>上傳照片：</label>
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          {imageFile && <p>已選擇照片：{imageFile.name}</p>}

          <button onClick={submitReport}>送出通報</button>

          <button
            onClick={() => setSelectedPosition(null)}
            style={{ marginLeft: "10px" }}
          >
            取消
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "15px",
        }}
      >
        <MapContainer
          center={[24.1477, 120.6736]}
          zoom={13}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToAddReport onMapClick={handleMapClick} />

          {focusPosition && <FlyToLocation position={focusPosition} />}

          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
            >
              <Popup>
                <b>{report.title}</b>
                <br />
                分類：{report.category}
                <br />
                嚴重程度：{report.severity}
                <br />
                狀態：{getStatusText(report.status)}
                <br />
                描述：{report.description}
                <br />
                AI摘要：{report.aiSummary || "尚未分析"}
                <br />
                AI建議：{report.aiSuggestedAction || "無"}
                <br />
                {report.imageUrl ? (
  <img
    src={report.imageUrl}
    alt="通報圖片"
    style={{
      width: "220px",
      maxHeight: "160px",
      objectFit: "cover",
      borderRadius: "8px",
      marginTop: "8px",
    }}
  />
) : (
  <>圖片：未上傳圖片</>
)}
                <br />
                緯度：{report.location.lat.toFixed(6)}
                <br />
                經度：{report.location.lng.toFixed(6)}
              </Popup>
            </Marker>
          ))}

          {myPosition && (
            <>
              <FlyToLocation position={myPosition} />
              <Marker position={myPosition}>
                <Popup>我的目前位置</Popup>
              </Marker>
            </>
          )}
        </MapContainer>

        <div
          style={{
            height: "600px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            color: "#000",
          }}
        >
          <h3>通報列表</h3>

          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: "#fff",
              }}
            >
              <b>{report.title}</b>
              <p>分類：{report.category}</p>
              <p>嚴重程度：{report.severity}</p>
              <p>狀態：{getStatusText(report.status)}</p>
              <p>{report.description}</p>

              <button
                onClick={() =>
                  setFocusPosition([
                    report.location.lat,
                    report.location.lng,
                  ])
                }
              >
                查看位置
              </button>

              <button
                onClick={() => deleteReport(report.id)}
                style={{ marginLeft: "8px" }}
              >
                刪除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}