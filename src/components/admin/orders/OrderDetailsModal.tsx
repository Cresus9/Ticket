import React from 'react';
import { X, Calendar, User, MapPin, CreditCard } from 'lucide-react';
import { Order } from '../../../services/orderService';
import { formatCurrency } from '../../../utils/formatters';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  onRefund: (orderId: string) => void;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  onRefund
}: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Order Details
                </h3>

                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Order ID</p>
                      <p className="mt-1 text-sm text-gray-900">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className={`mt-1 text-sm font-medium ${
                        order.status === 'COMPLETED'
                          ? 'text-green-600'
                          : order.status === 'PENDING'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">Customer Information</h4>
                    </div>
                    <p className="text-sm text-gray-600">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>

                  {/* Event Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">Event Information</h4>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{order.event.title}</p>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-900">Payment Information</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Payment Method</span>
                        <span className="text-sm text-gray-900">{order.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Amount</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.total, 'GHS')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tickets</h4>
                    <div className="space-y-2">
                      {order.tickets.map((ticket) => (
                        <div key={ticket.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{ticket.ticketType.name}</span>
                          <span className="text-gray-900">
                            {formatCurrency(ticket.ticketType.price, 'GHS')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            {order.status === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => onRefund(order.id)}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              >
                Refund Order
              </button>
            )}
            {order.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  onClick={() => onStatusChange(order.id, 'COMPLETED')}
                  className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                >
                  Mark as Completed
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange(order.id, 'CANCELLED')}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:mt-0 sm:w-auto"
                >
                  Cancel Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}