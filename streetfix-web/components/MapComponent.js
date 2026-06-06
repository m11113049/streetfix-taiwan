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
    position: [24.1477, 120.6736],
    type: "台中市政府",
    description: "示範通報點",
    photoName: "未上傳照片",
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
  const [reportType, setReportType] = useState("道路坑洞");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [reports, setReports] = useState(defaultReports);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("streetfix_reports");
    if (saved) setReports(JSON.parse(saved));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("streetfix_reports", JSON.stringify(reports));
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
    setSelectedPosition([lat, lng]);
    setReportType("道路坑洞");
    setDescription("");
    setPhoto(null);
  }

  function submitReport() {
    if (!selectedPosition) return;

    setReports((prev) => [
      ...prev,
      {
        id: Date.now(),
        position: selectedPosition,
        type: reportType,
        description: description || "無補充描述",
        photoName: photo ? photo.name : "未上傳照片",
      },
    ]);

    setSelectedPosition(null);
    setDescription("");
    setPhoto(null);
  }

  function deleteReport(id) {
    if (!confirm("確定要刪除這筆通報嗎？")) return;
    setReports((prev) => prev.filter((report) => report.id !== id));
  }

  function clearReports() {
    if (!confirm("確定要清除所有通報資料嗎？")) return;
    setReports(defaultReports);
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
            緯度：{selectedPosition[0].toFixed(6)}
            <br />
            經度：{selectedPosition[1].toFixed(6)}
          </p>

          <label>通報類型：</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option>道路坑洞</option>
            <option>人行道破損</option>
            <option>路燈故障</option>
            <option>垃圾堆積</option>
            <option>排水異常</option>
          </select>

          <br />
          <br />

          <label>問題描述：</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：坑洞很深，機車經過容易危險"
            style={{ width: "100%", height: "80px", padding: "8px" }}
          />

          <br />
          <br />

          <label>上傳照片：</label>
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          {photo && <p>已選擇照片：{photo.name}</p>}

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
            <Marker key={report.id} position={report.position}>
              <Popup>
                <b>{report.type}</b>
                <br />
                {report.description}
                <br />
                照片：{report.photoName}
                <br />
                緯度：{report.position[0].toFixed(6)}
                <br />
                經度：{report.position[1].toFixed(6)}
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
              <b>{report.type}</b>
              <p>{report.description}</p>
              <p style={{ fontSize: "12px" }}>
                緯度：{report.position[0].toFixed(6)}
                <br />
                經度：{report.position[1].toFixed(6)}
              </p>

              <button onClick={() => setFocusPosition(report.position)}>
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