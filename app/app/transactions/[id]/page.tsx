'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTransactionStore } from '@/store/transactionStore';
import { useState, useEffect } from 'react';
import TransactionLifecycle from '@/components/TransactionLifecycle';
import InspectionTimer from '@/components/InspectionTimer';
import DisputeSystem from '@/components/DisputeSystem';
import ShippingTracker from '@/components/ShippingTracker';
import { ArrowLeft, DollarSign, Package, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatAmount } from '@/utils/format';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;
  const getTransaction = useTransactionStore((state) => state.getTransaction);
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');

  const transaction = getTransaction(transactionId);

  useEffect(() => {
    // In production, determine user role from auth context
    // For now, we'll default to buyer but allow switching
    const storedRole = localStorage.getItem(`role_${transactionId}`);
    if (storedRole) {
      setUserRole(storedRole as 'buyer' | 'seller');
    }
  }, [transactionId]);

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Transaction Not Found
          </h1>
          <Link href="/app/dashboard" className="text-gray-600 hover:text-gray-900">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Viewing as:</span>
              <select
                value={userRole}
                onChange={(e) => {
                  const role = e.target.value as 'buyer' | 'seller';
                  setUserRole(role);
                  localStorage.setItem(`role_${transactionId}`, role);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Lifecycle */}
            <TransactionLifecycle transaction={transaction} />

            {/* Shipping Tracker */}
            <ShippingTracker transaction={transaction} userRole={userRole} />

            {/* Inspection Timer */}
            <InspectionTimer transaction={transaction} userRole={userRole} />

            {/* Dispute System */}
            <DisputeSystem transaction={transaction} userRole={userRole} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Price</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(transaction.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(transaction.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(transaction.feeAmount)}
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
                  <span className="font-bold text-lg text-gray-900">
                    {formatAmount(transaction.totalAmount)}
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
                    {transaction.inspectionPeriodHours} hours
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
                    {transaction.buyerKYCLevel.replace('level', 'Level ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {transaction.stage !== 'completed' &&
              transaction.stage !== 'refunded' &&
              !transaction.isDisputed && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    {userRole === 'seller' &&
                      transaction.stage === 'funds_secured' && (
                        <p className="text-sm text-gray-600">
                          Funds are secured. You can now ship the item.
                        </p>
                      )}
                    {userRole === 'buyer' && transaction.stage === 'inspection' && (
                      <p className="text-sm text-gray-600">
                        Inspect your item and accept or reject.
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
