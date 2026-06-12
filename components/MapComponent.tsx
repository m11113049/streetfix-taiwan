"use client";

import { useEffect } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  html: "📍",
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});


import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

type Location = {
  lat: number;
  lng: number;
};

type MapComponentProps = {
  lat: number;
  lng: number;
  onLocationChange: (location: Location) => void;
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

export default function MapComponent({
  lat,
  lng,
  onLocationChange,
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

  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50 p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-teal-800">
          <p className="font-semibold">通報位置</p>
          <p>
            lat {lat.toFixed(6)} / lng {lng.toFixed(6)}
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