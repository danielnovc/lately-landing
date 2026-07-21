import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fbf9f4',
          color: '#111111',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: '72px 88px',
          width: '100%',
        }}
      >
        <div style={{ color: '#5c5c5c', display: 'flex', fontSize: 28, marginBottom: 22 }}>
          Lately
        </div>
        <div style={{ display: 'flex', fontSize: 82, fontWeight: 700, letterSpacing: -4, lineHeight: 0.95, maxWidth: 850 }}>
          Your year, held gently.
        </div>
        <div style={{ color: '#5c5c5c', display: 'flex', fontSize: 30, marginTop: 30 }}>
          A quiet journal for everyday memories.
        </div>
      </div>
    ),
    size,
  );
}
