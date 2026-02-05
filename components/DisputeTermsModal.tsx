'use client';

import { useState } from 'react';
import { X, Shield, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface DisputeTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionPeriodHours: number;
  appName?: string;
}

export default function DisputeTermsModal({
  isOpen,
  onClose,
  inspectionPeriodHours,
  appName = 'VeriPay',
}: DisputeTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              Payment Terms & Protection Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 mb-6">
            Payment Terms & Protection Summary:
          </p>

          <div className="space-y-4">
            {/* Neutral Holding */}
            <div className="flex items-start gap-3">
              <Shield className="text-purple-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Neutral Holding</h3>
                <p className="text-sm text-gray-700">
                  Your funds will be held securely by {appName} (the "Escrow Agent") and will not be accessible by the seller until you confirm receipt or the inspection period expires.
                </p>
              </div>
            </div>

            {/* Inspection Clock */}
            <div className="flex items-start gap-3">
              <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">The Inspection Clock</h3>
                <p className="text-sm text-gray-700">
                  You have exactly <strong>{inspectionPeriodHours} hours</strong> from the moment the delivery is confirmed to inspect the item.
                </p>
              </div>
            </div>

            {/* Automatic Release */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Automatic Release</h3>
                <p className="text-sm text-gray-700">
                  If no dispute is raised within the inspection period, the system will automatically release the funds to the seller.
                </p>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Refund Policy</h3>
                <p className="text-sm text-gray-700">
                  If the seller fails to ship the item or provides a tracking number that cannot be verified, you are entitled to a <strong>100% refund</strong> of the purchase price (excluding non-refundable payment gateway fees, if applicable).
                </p>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div className="flex items-start gap-3">
              <FileText className="text-purple-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Dispute Resolution</h3>
                <p className="text-sm text-gray-700">
                  In the event of a dispute, {appName} will act as a neutral arbitrator. Both parties agree to provide evidence (photos/videos) within 24 hours of a dispute being raised. Our decision on the fund release will be final based on the evidence provided.
                </p>
              </div>
            </div>

            {/* Prohibited Items */}
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Prohibited Items</h3>
                <p className="text-sm text-gray-700">
                  You confirm this transaction does not involve illegal goods, firearms, or services that violate our Acceptable Use Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-700">{appName}</strong> is a technology platform and acts as a third-party escrow agent. We are not the seller of the goods and do not provide warranties for the items themselves. For your safety, always keep communication within the {appName} chat to ensure your dispute evidence is valid.
            </p>
          </div>
        </div>

        {/* Footer with Close Button */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
