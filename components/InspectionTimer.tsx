'use client';

import { useEffect, useState } from 'react';
import { Transaction } from '@/types';
import { useTransactionStore } from '@/store/transactionStore';
import { updateTransactionStatus, releaseFunds } from '@/utils/api';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface InspectionTimerProps {
  transaction: Transaction;
  userRole: 'buyer' | 'seller';
}

export default function InspectionTimer({
  transaction,
  userRole,
}: InspectionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const updateTransactionStage = useTransactionStore(
    (state) => state.updateTransactionStage
  );
  const acceptTransaction = useTransactionStore((state) => state.acceptTransaction);

  useEffect(() => {
    if (
      transaction.stage !== 'inspection' ||
      !transaction.inspectionDeadline
    ) {
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const deadline = transaction.inspectionDeadline!;

      if (isAfter(now, deadline)) {
        // Auto-release funds
        acceptTransaction(transaction.id);
        setTimeRemaining('Auto-released');
      } else {
        setTimeRemaining(formatDistanceToNow(deadline, { addSuffix: true }));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [transaction, acceptTransaction]);

  if (transaction.stage !== 'inspection') {
    return null;
  }

  const handleAccept = async () => {
    try {
      const trackingId = (transaction as any).trackingId || transaction.id;
      
      // Update status to RELEASED in backend
      await releaseFunds(trackingId);
      
      // Update local store for backward compatibility
    acceptTransaction(transaction.id);
    } catch (error: any) {
      console.error('Error accepting transaction:', error);
      alert(error.message || 'Failed to release funds');
    }
  };

  const handleReject = async () => {
    try {
      const trackingId = (transaction as any).trackingId || transaction.id;
      
      // Update status to DISPUTED in backend
      await updateTransactionStatus(trackingId, {
        status: 'DISPUTED',
        notes: 'Buyer rejected item during inspection',
      });
      
      // Update local store for backward compatibility
    updateTransactionStage(transaction.id, 'refunded');
    } catch (error: any) {
      console.error('Error rejecting transaction:', error);
      alert(error.message || 'Failed to reject transaction');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="text-yellow-600" size={24} />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Inspection Period Active
          </h3>
          <p className="text-sm text-gray-600">
            {transaction.inspectionPeriodHours} hours to inspect your item
          </p>
        </div>
      </div>

      {userRole === 'buyer' && (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Time remaining:</strong> {timeRemaining}
            </p>
            <p className="text-xs text-yellow-700">
              If you don't reject within this time, funds will automatically
              be released to the seller.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Accept & Release Funds
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={20} />
              Reject & Request Refund
            </button>
          </div>
        </>
      )}

      {userRole === 'seller' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Waiting for buyer to accept or reject. Funds will auto-release in:{' '}
            <strong>{timeRemaining}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
