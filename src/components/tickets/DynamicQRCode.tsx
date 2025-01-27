import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRData } from '../../utils/ticketService';

interface DynamicQRCodeProps {
  bookingId: string;
  ticketType: string;
  size?: number;
}

export default function DynamicQRCode({ bookingId, ticketType, size = 120 }: DynamicQRCodeProps) {
  const [qrData, setQRData] = useState('');

  useEffect(() => {
    // Generate initial QR code
    updateQRCode();

    // Update QR code every 45 seconds to ensure a new one is ready before the current one expires
    const interval = setInterval(updateQRCode, 45000);

    return () => clearInterval(interval);
  }, [bookingId, ticketType]);

  const updateQRCode = () => {
    const newQRData = generateQRData(bookingId, ticketType);
    setQRData(newQRData);
  };

  return (
    <div className="relative">
      <QRCodeSVG
        value={qrData}
        size={size}
        level="H"
        includeMargin={true}
      />
      <div className="absolute inset-0 bg-transparent" style={{ userSelect: 'none' }} />
    </div>
  );
}