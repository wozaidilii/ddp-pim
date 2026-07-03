"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

/** Renders a QR code for the current page URL; client-only to access the full URL */
export function DppQrCode() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) {
    return <div className="h-28 w-28 rounded-lg bg-stone-100" />;
  }

  return (
    <div className="rounded-lg bg-white p-2">
      <QRCode value={url} size={104} />
    </div>
  );
}
