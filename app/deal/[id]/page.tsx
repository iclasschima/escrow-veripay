'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getDealDetails, acceptDeal, getBanks } from '@/utils/api';
import { formatAmount } from '@/utils/format';

interface DealData {
  trackingId: string;
  itemName: string;
  amount: number;
  buyerPhone: string | null;
  status: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
}

export default function DealAcceptancePage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = params.id as string;

  const [dealData, setDealData] = useState<DealData | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [acceptedTransaction, setAcceptedTransaction] = useState<any>(null);

  // Form state
  const [sellerPhone, setSellerPhone] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealResponse, banksResponse] = await Promise.all([
          getDealDetails(trackingId),
          getBanks(),
        ]);

        if (dealResponse.success && dealResponse.data) {
          setDealData(dealResponse.data);
        } else {
          setError(dealResponse.error || 'Deal not found');
        }

        if (banksResponse.success && banksResponse.data) {
          setBanks(banksResponse.data);
        }
      } catch (err: any) {
        console.error('Error fetching deal:', err);
        setError(err.message || 'Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    if (trackingId) {
      fetchData();
    }
  }, [trackingId]);

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankName = e.target.value;
    setSelectedBank(bankName);
    const bank = banks.find((b) => b.name === bankName);
    if (bank) {
      setBankCode(bank.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellerPhone || !accountName || !accountNumber || !bankCode) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await acceptDeal(trackingId, {
        sellerPhone,
        accountName,
        accountNumber,
        bankCode,
      });

      if (response.success) {
        setAcceptedTransaction(response.data);
        setSuccess(true);
        // Redirect to payment page after 5 seconds
        setTimeout(() => {
          router.push(`/pay/${trackingId}`);
        }, 5000);
      } else {
        setError(response.error || 'Failed to accept deal');
      }
    } catch (err: any) {
      console.error('Error accepting deal:', err);
      setError(err.message || 'Failed to accept deal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (error && !dealData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Deal Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/t/${trackingId}`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Track Transaction
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2">
              <Shield className="text-purple-600" size={24} />
              <h1 className="text-lg font-bold text-gray-900">Secure Escrow Payment via VeriPay</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Accepted!</h2>
            <p className="text-gray-600 mb-6">
              The buyer has been notified. Transaction details below.
            </p>

            {/* Transaction Details */}
            {acceptedTransaction && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-semibold text-gray-900">{acceptedTransaction.itemName || dealData?.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-purple-600">
                      {formatAmount(acceptedTransaction.amount || dealData?.amount, false)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {acceptedTransaction.status?.replace('_', ' ').toLowerCase() || 'Awaiting Payment'}
                    </span>
                  </div>
                  {acceptedTransaction.trackingId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking ID:</span>
                      <span className="font-mono text-sm text-gray-700">{acceptedTransaction.trackingId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              You'll be redirected to the payment page in a few seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <Shield className="text-purple-600" size={24} />
            <h1 className="text-lg font-bold text-gray-900">Accept Deal</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deal Summary */}
        {dealData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deal Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Item</p>
                <p className="text-lg font-semibold text-gray-900">{dealData.itemName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatAmount(dealData.amount, false)}
                </p>
              </div>
              {dealData.buyerPhone && (
                <div>
                  <p className="text-sm text-gray-600">Buyer Phone</p>
                  <p className="text-lg font-medium text-gray-900">{dealData.buyerPhone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acceptance Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Provide Your Bank Details
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Enter your bank account information to receive payment for this deal.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Seller Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Phone Number
              </label>
              <input
                type="tel"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="080..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank
              </label>
              <select
                value={selectedBank}
                onChange={handleBankChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900"
                required
              >
                <option value="">Select a bank</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234567890"
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Accepting Deal...
                </>
              ) : (
                'Accept Deal & Continue'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
