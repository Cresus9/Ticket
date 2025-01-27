import React from 'react';
import { X, Ticket, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface TicketReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedTickets: { [key: string]: number };
  ticketTypes: TicketType[];
  currency: string;
}

export default function TicketReviewModal({
  isOpen,
  onClose,
  onConfirm,
  selectedTickets,
  ticketTypes,
  currency = 'XOF'
}: TicketReviewModalProps) {
  if (!isOpen) return null;

  const calculateSubtotal = () => {
    return ticketTypes.reduce((total, ticket) => {
      return total + (ticket.price * selectedTickets[ticket.id]);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const processingFee = subtotal * 0.02;
  const total = subtotal + processingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <Ticket className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Review Your Order
                </h3>
                <div className="mt-4 space-y-4">
                  {ticketTypes.map((ticket) => (
                    selectedTickets[ticket.id] > 0 && (
                      <div key={ticket.id} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                            <p className="text-sm text-gray-600">{ticket.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {selectedTickets[ticket.id]} × {formatCurrency(ticket.price, currency)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(ticket.price * selectedTickets[ticket.id], currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}

                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing Fee (2%)</span>
                      <span>{formatCurrency(processingFee, currency)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatCurrency(total, currency)}</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">
                        Please review your order carefully. Tickets cannot be refunded or exchanged after purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
            >
              Proceed to Checkout
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Back to Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}