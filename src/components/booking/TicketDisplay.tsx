import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, Clock, User, Ticket } from 'lucide-react';

interface TicketDisplayProps {
  bookingId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  ticketHolder: string;
  qrData: string;
}

export default function TicketDisplay({
  bookingId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  ticketType,
  ticketHolder,
  qrData
}: TicketDisplayProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold">AfriTix</span>
          </div>
          <div className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            {ticketType}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{eventTitle}</h1>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{eventDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{eventTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{eventLocation}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Ticket Holder</p>
            <p className="font-medium">{ticketHolder}</p>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <QRCodeSVG 
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Booking Reference</p>
          <p className="text-lg font-mono font-bold">{bookingId}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
        <p>This ticket is valid for one-time entry.</p>
        <p>Please present this QR code at the venue entrance.</p>
      </div>
    </div>
  );
}