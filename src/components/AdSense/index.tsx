import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | null;
  responsive?: 'true' | 'false';
}

export const AdSense: React.FC<AdSenseProps> = ({
  client,
  slot,
  style,
  className,
  format = 'auto',
  responsive = 'true',
}) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: '#f0f0f0',
          border: '2px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#555',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        Ad Placeholder
        <br />({style?.width}x{style?.height})
      </div>
    );
  }

  return (
    <div className={className} style={{ ...style, overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-full-width-responsive={responsive}
      ></ins>
    </div>
  );
};
