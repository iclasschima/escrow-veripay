'use client';

import { useParams } from 'next/navigation';
import { useTransactionStore } from '@/store/transactionStore';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getTransactionStatus } from '@/utils/api';
import TransactionLifecycle from '@/components/TransactionLifecycle';
import DisputeSystem from '@/components/DisputeSystem';
import { 
  Shield,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { formatAmount } from '@/utils/format';

export default function TrackingPage() {
  const params = useParams();
  const trackingId = params.id as string;
  const getTransaction = useTransactionStore((state) => state.getTransaction);
  
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to get from store first (for backward compatibility)
  const transactions = useTransactionStore((state) => state.transactions);
  const storeTransaction = transactions.find(txn => 
    txn.id === trackingId || 
    txn.trustLinkId === trackingId ||
    txn.waybillNumber === trackingId
  );

  useEffect(() => {
    // If found in store, use it
    if (storeTransaction) {
      setTransaction(storeTransaction);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from backend API
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await getTransactionStatus(trackingId);
        
        if (response.success && response.data) {
          // Convert backend transaction to frontend format
          const backendData = response.data;
          const mappedStage = mapBackendStatusToStage(backendData.status);
          
          setTransaction({
            id: backendData.transactionId || trackingId,
            itemName: backendData.itemName,
            price: backendData.amount,
            shippingCost: 0, // Default, can be updated from backend
            totalAmount: backendData.amount,
            feeAmount: backendData.amount * 0.03, // 3% fee
            feeSplit: 'buyer', // Default
            stage: mappedStage,
            createdAt: new Date(backendData.createdAt),
            updatedAt: new Date(backendData.updatedAt),
            waybillNumber: null, // Will be updated when seller ships
            inspectionDeadline: backendData.autoReleaseAt ? new Date(backendData.autoReleaseAt) : null,
            inspectionPeriodHours: 48, // Default
            buyerKYCLevel: 'level1', // Default
            isDisputed: backendData.status === 'DISPUTED',
            evidence: [],
            chatMessages: [],
          });
        } else {
          setError('Transaction not found');
        }
      } catch (err: any) {
        console.error('Error fetching transaction:', err);
        setError(err.message || 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [trackingId, storeTransaction]);

  // Map backend status to frontend stage
  const mapBackendStatusToStage = (status: string): string => {
    switch (status) {
      case 'AWAITING_SELLER_ACCEPTANCE':
        return 'awaiting_payment';
      case 'AWAITING_PAYMENT':
        return 'awaiting_payment';
      case 'PENDING':
        return 'awaiting_payment';
      case 'PAID':
        return 'funds_secured';
      case 'SHIPPED':
        return 'in_transit';
      case 'DELIVERED':
        return 'inspection';
      case 'RELEASED':
        return 'completed';
      case 'DISPUTED':
        return 'disputed';
      default:
        return 'awaiting_payment';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Tracking Not Found
          </h1>
          <p className="text-gray-600">
            {error || 'This tracking reference is invalid or has expired.'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate total with fee
  const feeAmount = transaction.feeAmount || (transaction.totalAmount * 0.03);
  const totalWithFee = transaction.feeSplit === 'buyer' 
    ? transaction.totalAmount + feeAmount
    : transaction.feeSplit === 'seller'
    ? transaction.totalAmount
    : transaction.totalAmount + (feeAmount / 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <Shield className="text-purple-600" size={24} />
            <h1 className="text-lg font-bold text-gray-900">VeriPay Tracking</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {transaction.itemName}
          </h1>
          <p className="text-gray-600">
            Transaction ID: {transaction.id} • Created{' '}
            {format(transaction.createdAt, 'MMM d, yyyy')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Status */}
            <TransactionLifecycle transaction={transaction} />

            {/* Dispute & Evidence */}
            <DisputeSystem transaction={transaction} userRole="buyer" />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
                  <span className="text-gray-600">Item Price</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(transaction.price || transaction.totalAmount)}
                  </span>
            </div>
            <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(transaction.shippingCost || 0)}
                  </span>
            </div>
            <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold text-gray-900">
                    {formatAmount(feeAmount)}
              </span>
            </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee Paid By</span>
                  <span className="text-gray-500 capitalize">
                    {transaction.feeSplit === 'buyer'
                      ? 'Buyer'
                      : transaction.feeSplit === 'seller'
                      ? 'Seller'
                      : 'Split 50/50'}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900 underline">
                    {formatAmount(totalWithFee)}
                  </span>
              </div>
              </div>
            </div>
            
            {/* Transaction Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transaction Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Inspection Period</p>
                  <p className="font-medium text-gray-900">
                    {transaction.inspectionPeriodHours || 48} hours
                  </p>
                </div>
                {transaction.inspectionDeadline && (
                  <div>
                    <p className="text-sm text-gray-600">Inspection Deadline</p>
                    <p className="font-medium text-gray-900">
                      {format(transaction.inspectionDeadline, 'MMM d, yyyy HH:mm')}
                    </p>
              </div>
            )}
                {transaction.waybillNumber && (
                <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900">
                      {transaction.waybillNumber}
                    </p>
                </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Buyer KYC</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {transaction.buyerKYCLevel?.replace('level', 'Level ') || 'Level 1'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {transaction.stage === 'awaiting_payment' && (
                  <a
                    href={`/pay/${trackingId}`}
                    className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
                  >
                    Proceed to Payment
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
