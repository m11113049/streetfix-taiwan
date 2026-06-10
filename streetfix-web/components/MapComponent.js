import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

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
  const [loaded, setLoaded] = useState(false);
 
  useEffect(() => {
    const saved = localStorage.getItem("streetfix_reports_v2");
    if (saved) setReports(JSON.parse(saved));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("streetfix_reports_v2", JSON.stringify(reports));
    }
  }, [reports, loaded]);

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

    const newReport = {
      id: Date.now(),
      title: title || `${category}通報`,
      description: description || "無補充描述",
      category: category,
      severity: severity,
      imageUrl: imageFile ? imageFile.name : "",
      location: {
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
      },
      status: "pending",
    };

    try {
  const response = await fetch("http://localhost:5000/api/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: newReport.title,
      description: newReport.description,
      category: newReport.category,
      severity: newReport.severity,
      latitude: newReport.location.lat,
      longitude: newReport.location.lng,
      imageUrl: newReport.imageUrl,
    }),
  });

  const data = await response.json();
  console.log("POST /api/reports status:", response.status);
  console.log("POST /api/reports response:", data);

  if (!response.ok) {
    throw new Error(data.message || "新增通報失敗");
  }

  setReports((prev) => [...prev, newReport]);
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
            <option>道路破損</option>
            <option>路燈故障</option>
            <option>垃圾堆積</option>
            <option>排水異常</option>
            <option>人行道破損</option>
            <option>交通號誌異常</option>
            <option>其他</option>
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
                圖片：{report.imageUrl || "未上傳圖片"}
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