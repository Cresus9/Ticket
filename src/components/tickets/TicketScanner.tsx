import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { Check, X, RotateCcw } from 'lucide-react';
import { validateTicket } from '../../utils/ticketService';
import toast from 'react-hot-toast';

export default function TicketScanner() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleScan = async (data: string) => {
    if (!scanning || !data) return;
    
    setScanning(false);
    
    try {
      const isValid = validateTicket(data);
      setResult({
        success: isValid,
        message: isValid ? 'Ticket validated successfully!' : 'Invalid ticket!'
      });
      toast[isValid ? 'success' : 'error'](
        isValid ? 'Ticket validated successfully!' : 'Invalid ticket!'
      );
    } catch (error) {
      setResult({
        success: false,
        message: 'Error validating ticket'
      });
      toast.error('Error validating ticket');
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setResult(null);
      setScanning(true);
    }, 3000);
  };

  const handleError = (error: Error) => {
    console.error('Scanner error:', error);
    toast.error('Scanner error: ' + error.message);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        {scanning ? (
          <QrScanner
            onDecode={handleScan}
            onError={handleError}
            containerStyle={{ borderRadius: '0.75rem', overflow: 'hidden' }}
          />
        ) : (
          <div className="aspect-square bg-gray-900 rounded-xl flex items-center justify-center">
            {result && (
              <div className={`text-center p-6 ${
                result.success ? 'text-green-500' : 'text-red-500'
              }`}>
                {result.success ? (
                  <Check className="h-16 w-16 mx-auto mb-4" />
                ) : (
                  <X className="h-16 w-16 mx-auto mb-4" />
                )}
                <p className="text-lg font-medium">{result.message}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => {
            setResult(null);
            setScanning(true);
          }}
          className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          aria-label="Reset scanner"
        >
          <RotateCcw className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      <div className="mt-4 text-center text-gray-600">
        {scanning ? (
          'Position the QR code within the frame to scan'
        ) : (
          'Processing ticket...'
        )}
      </div>
    </div>
  );
}