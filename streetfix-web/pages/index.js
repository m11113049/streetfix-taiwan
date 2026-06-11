import dynamic from "next/dynamic";

const MapComponent = dynamic(
  () => import("../components/MapComponent"),
  { ssr: false }
);

export default function Home() {
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>StreetFix Taiwan</h1>

      <p>AI 輔助城市公共設施通報平台</p>

    

      <MapComponent />
    </div>
  );
}