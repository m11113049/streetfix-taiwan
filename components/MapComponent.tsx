"use client";

import { useEffect } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Location = {
  lat: number;
  lng: number;
};

type ReportMarker = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  location?: {
    lat?: number;
    lng?: number;
  };
};

type MapComponentProps = {
  lat: number;
  lng: number;
  onLocationChange: (location: Location) => void;
  reports?: ReportMarker[];
};

function FlyToLocation({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 16);
  }, [map, position]);

  return null;
}

function ClickToSelectLocation({
  onLocationChange,
}: {
  onLocationChange: (location: Location) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

function getReportLat(report: ReportMarker) {
  return (
    report.latitude ??
    report.lat ??
    report.location?.lat
  );
}

function getReportLng(report: ReportMarker) {
  return (
    report.longitude ??
    report.lng ??
    report.location?.lng
  );
}

export default function MapComponent({
  lat,
  lng,
  onLocationChange,
  reports = [],
}: MapComponentProps) {
  const position: [number, number] = [lat, lng];

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert("你的瀏覽器不支援 GPS 定位");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        alert("無法取得位置，請確認瀏覽器是否允許定位");
      }
    );
  };

  const validReports = reports.filter((report) => {
    const reportLat = Number(getReportLat(report));
    const reportLng = Number(getReportLng(report));

    return !Number.isNaN(reportLat) && !Number.isNaN(reportLng);
  });

  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50 p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-teal-800">
          <p className="font-semibold">通報位置</p>
          <p>
            lat {lat.toFixed(6)} / lng {lng.toFixed(6)}
          </p>
          <p className="mt-1 text-xs">
            已載入通報 marker：{validReports.length} 筆
          </p>
        </div>

        <button
          type="button"
          onClick={getMyLocation}
          className="min-h-11 rounded-lg border border-teal-500 bg-white px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100"
        >
          使用目前 GPS 位置
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-teal-200">
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: "360px", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToSelectLocation onLocationChange={onLocationChange} />
          <FlyToLocation position={position} />

          {/* 已儲存的通報 marker */}
          {validReports.map((report, index) => {
            const reportLat = Number(getReportLat(report));
            const reportLng = Number(getReportLng(report));

            return (
              <Marker
                key={report.id || index}
                position={[reportLat, reportLng]}
                icon={markerIcon}
              >
                <Popup>
                  <strong>{report.title || "未命名通報"}</strong>
                  <br />
                  分類：{report.category || "其他"}
                  <br />
                  嚴重程度：{report.severity || "medium"}
                  <br />
                  狀態：{report.status || "pending"}
                  <br />
                  描述：{report.description || "無描述"}
                  <br />
                  緯度：{reportLat.toFixed(6)}
                  <br />
                  經度：{reportLng.toFixed(6)}
                </Popup>
              </Marker>
            );
          })}

          {/* 目前選擇的位置 marker */}
          <Marker position={position} icon={markerIcon}>
            <Popup>
              目前選擇位置
              <br />
              緯度：{lat.toFixed(6)}
              <br />
              經度：{lng.toFixed(6)}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <p className="mt-2 text-xs text-teal-700">
        可點擊地圖更改通報位置。
      </p>
    </section>
  );
}