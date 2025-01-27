import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase-client';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

interface CheckoutState {
  order: {
    id: string;
    total: number;
  };
  tickets: { [key: string]: number };
  totals: {
    subtotal: number;
    processingFee: number;
    total: number;
  };
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('mobile_money');
  
  const state = location.state as CheckoutState;

  if (!state?.order) {
    navigate('/events');
    return null;
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'COMPLETED',
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.order.id);

      if (orderError) throw orderError;

      navigate(`/booking/confirmation/${state.order.id}`, { replace: true });
      toast.success('Redirecting to your tickets...');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Events
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
        <p className="text-gray-600">Choose your payment method to secure your tickets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile_money')}
                className={`w-full flex items-center gap-4 p-4 border rounded-lg ${
                  paymentMethod === 'mobile_money'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Wallet className={`h-6 w-6 ${
                  paymentMethod === 'mobile_money' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Mobile Money</p>
                  <p className="text-sm text-gray-500">Pay with Orange Money, Wave, or Moov Money</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center gap-4 p-4 border rounded-lg ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CreditCard className={`h-6 w-6 ${
                  paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Credit/Debit Card</p>
                  <p className="text-sm text-gray-500">Pay with Visa or Mastercard</p>
                </div>
              </button>
            </div>

            {paymentMethod === 'mobile_money' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Provider
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select provider</option>
                    <option value="orange">Orange Money</option>
                    <option value="wave">Wave</option>
                    <option value="moov">Moov Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your mobile money number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay {formatCurrency(state.totals.total)}</>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(state.totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing Fee (2%)</span>
              <span>{formatCurrency(state.totals.processingFee)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-900 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(state.totals.total)}</span>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Your tickets will be available immediately after payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}