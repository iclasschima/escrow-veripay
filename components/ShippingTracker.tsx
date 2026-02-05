'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { useTransactionStore } from '@/store/transactionStore';
import { updateTransactionStatus } from '@/utils/api';
import { Package, Upload } from 'lucide-react';

interface ShippingTrackerProps {
  transaction: Transaction;
  userRole: 'buyer' | 'seller';
}

export default function ShippingTracker({
  transaction,
  userRole,
}: ShippingTrackerProps) {
  const [waybillNumber, setWaybillNumber] = useState(
    transaction.waybillNumber || ''
  );
  const [proofOfDelivery, setProofOfDelivery] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(
    userRole === 'seller' && transaction.stage === 'funds_secured'
  );

  const updateWaybill = useTransactionStore((state) => state.updateWaybill);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofOfDelivery(file);
      // In production, upload to storage
      const url = URL.createObjectURL(file);
      // Store URL for now
    }
  };

  const handleSubmit = async () => {
    if (!waybillNumber.trim()) return;

    try {
      // Update in backend
      const trackingId = (transaction as any).trackingId || transaction.id;
      await updateTransactionStatus(trackingId, {
        status: 'SHIPPED',
        waybillNumber: waybillNumber.trim(),
      });

      // Update in local store for backward compatibility
      const podUrl = proofOfDelivery
        ? URL.createObjectURL(proofOfDelivery)
        : undefined;

      updateWaybill(transaction.id, waybillNumber, podUrl);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error updating shipping status:', error);
      alert(error.message || 'Failed to update shipping status');
    }
  };

  if (transaction.stage === 'funds_secured' && userRole === 'seller') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Ready to Ship
            </h3>
            <p className="text-sm text-gray-600">
              Funds are secured. You can now ship the item.
            </p>
          </div>
        </div>

        {showForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waybill / Tracking Number
              </label>
              <input
                type="text"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="Enter tracking number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof of Delivery (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="pod-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pod-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="text-gray-400" size={24} />
                  <span className="text-sm text-gray-600">
                    Upload delivery receipt
                  </span>
                </label>
              </div>
              {proofOfDelivery && (
                <p className="text-xs text-gray-500 mt-1">
                  {proofOfDelivery.name}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Mark as Shipped
            </button>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Add Shipping Details
          </button>
        )}
      </div>
    );
  }

  if (transaction.stage === 'in_transit' && transaction.waybillNumber) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Item In Transit
            </h3>
            <p className="text-sm text-gray-600">
              Tracking: <strong>{transaction.waybillNumber}</strong>
            </p>
          </div>
        </div>

        {transaction.proofOfDelivery && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Proof of Delivery
            </h4>
            <img
              src={transaction.proofOfDelivery}
              alt="Proof of delivery"
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}
