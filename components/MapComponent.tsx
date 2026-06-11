"use client";

type MapComponentProps = {
  lat: number;
  lng: number;
  onLocationChange: (location: { lat: number; lng: number }) => void;
};

export default function MapComponent({ lat, lng, onLocationChange }: MapComponentProps) {
  return (
    <section className="rounded-xl border border-dashed border-teal-300 bg-teal-50 p-4">
      {/* TODO: 組員二負責串接地圖 GPS 與定位互動邏輯 */}
      <p className="text-sm text-teal-800">
        <span className="font-semibold">MapComponent 預留區：</span>
        目前先顯示座標，待串接地圖與 GPS。
      </p>
      <p className="mt-2 text-sm text-teal-700">
        目前座標：lat {lat.toFixed(6)} / lng {lng.toFixed(6)}
      </p>
      <button
        type="button"
        onClick={() => onLocationChange({ lat: 24.801, lng: 120.971 })}
        className="mt-4 min-h-11 rounded-lg border border-teal-500 bg-white px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100"
      >
        使用預設測試座標
      </button>
    </section>
  );
}
