import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(145deg, #0a1628 0%, #0066ff 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          padding: "2px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagon outline */}
          <path
            d="M12 2.5L20.2 7.2V16.8L12 21.5L3.8 16.8V7.2L12 2.5Z"
            stroke="#ffffff"
            strokeWidth="2.0"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Curved blue arrow */}
          <path
            d="M8.5 16V12.2C8.5 10.7 9.5 9.7 11 9.7H14.5"
            stroke="#0066FF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 7.7L15 9.7L12.5 11.7"
            stroke="#0066FF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
