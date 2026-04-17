import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'sureline — Office Worker Health Guide';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 90px',
          background: 'linear-gradient(135deg, #3268ff 0%, #ff6b57 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.3em',
            opacity: 0.9,
            marginBottom: 20,
          }}
        >
          SURELINE.KR
        </div>
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: 30,
          }}
        >
          sureline
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 600,
            lineHeight: 1.2,
            opacity: 0.95,
          }}
        >
          Office Worker Health Guide
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 40,
            opacity: 0.85,
            padding: '12px 24px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
          }}
        >
          Neck · Shoulder · Back · Eye · Fatigue
        </div>
      </div>
    ),
    { ...size }
  );
}
