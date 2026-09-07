import { ImageResponse } from "next/og";

export const alt = "Namou — Move Different";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#f3f1ec",
        color: "#0d0f10",
        padding: 52,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "62%",
          border: "1px solid #cbc8c1",
          borderRadius: 18,
          padding: 38,
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, fontWeight: 800 }}>
          NAMOU
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 118,
            lineHeight: 0.84,
            letterSpacing: -6,
            textTransform: "uppercase",
            fontWeight: 900,
          }}
        >
          <div>Move</div>
          <div>Different.</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontFamily: "monospace",
            fontSize: 17,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 13,
              height: 13,
              borderRadius: 99,
              background: "#b8ff00",
            }}
          />{" "}
          Adapt / Protect / Move
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          right: -40,
          top: -85,
          width: 550,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, #39403c, #080a0a 68%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 300,
            height: 350,
            transform: "rotate(-15deg)",
            borderRadius: 80,
            background: "linear-gradient(145deg,#4a504c,#111413)",
            border: "2px solid #606660",
            boxShadow: "0 35px 70px #0008",
          }}
        />
      </div>
    </div>,
    size,
  );
}
