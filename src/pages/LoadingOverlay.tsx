import styled from "styled-components";
import { useEffect, useState } from "react";
const LoadingOverlay = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50); // 👈 สำคัญมาก
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null; // 👈 รอให้ mount ก่อน
  return (
    <Wrapper>
      <svg viewBox="0 0 400 200" className="loader">
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="sak"
        >
          SAK
        </text>
      </svg>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;        // 🔥 ต้องมี
  left: 0;       // 🔥 ต้องมี
  width: 100vw;  // 🔥 ใช้ vw ดีกว่า %
  height: 100vh;

  z-index: 9999;

  display:flex;
  justify-content:center;
  align-items:center;

  background:#192543;

  .loader{
    width:500px;
  }

  .sak{
    font-size:150px;
    font-weight:900;
    font-family:Arial, Helvetica, sans-serif;

    fill:transparent;
    stroke:#22AFFF;
    stroke-width:2;

    filter:
      drop-shadow(0 0 6px #22aeff57)
      drop-shadow(0 0 14px #157eba);

    stroke-dasharray:600;
    stroke-dashoffset:600;

    animation:
      draw 4s ease forwards,
      glow 3s ease-in-out infinite alternate 1s;
  }

  @keyframes draw{
    to{
      stroke-dashoffset:0;
    }
  }

  @keyframes glow{
    from{
      fill:transparent;
    }
    to{
      fill:#22AFFF;
    }
  }
`;

export default LoadingOverlay;