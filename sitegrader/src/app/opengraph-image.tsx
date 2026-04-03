import { ImageResponse } from 'next/og'

export const alt = 'SiteGrader - Free Website Grading Tool'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e40af 50%, #7c3aed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            marginBottom: 16,
            display: 'flex',
          }}
        >
          <span>Site</span>
          <span style={{ color: '#60a5fa' }}>Grader</span>
        </div>
        <div style={{ fontSize: 36, color: '#e2e8f0', marginBottom: 24 }}>
          Grade your website in 30 seconds
        </div>
        <div style={{ fontSize: 24, color: '#94a3b8' }}>
          Free · No signup · Instant results
        </div>
      </div>
    ),
    { ...size }
  )
}
