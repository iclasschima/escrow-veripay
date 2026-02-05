'use client';

import { useState } from 'react';
import { X, Shield, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProtectionModal({ isOpen, onClose }: ProtectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-10"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              How We Protect You
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
          {/* Video Placeholder */}
          <div className="bg-gray-100 rounded-lg aspect-video mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="text-purple-600" size={32} />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                30-Second Protection Video
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Video player would be embedded here)
              </p>
            </div>
          </div>

          {/* Protection Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Vault</h3>
                <p className="text-sm text-gray-700">
                  Your money is held in a secure escrow vault. The seller cannot access it until you confirm receipt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Inspection Period</h3>
                <p className="text-sm text-gray-700">
                  You have time to inspect your item (typically 24-48 hours) before funds are released. If something's wrong, raise a dispute.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">100% Money-Back Guarantee</h3>
                <p className="text-sm text-gray-700">
                  If the seller doesn't ship, ships the wrong item, or the item is damaged, you get a full refund. No questions asked.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">No Automatic Payouts</h3>
                <p className="text-sm text-gray-700">
                  Funds are only released when you explicitly approve. If you don't approve within the inspection period, funds are automatically released, but you can dispute before then.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Dispute Resolution</h3>
                <p className="text-sm text-gray-700">
                  If there's a problem, our neutral team reviews evidence from both sides and makes a fair decision. Your money stays safe during the process.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">SSL Secured</p>
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto">
                  <Lock className="text-gray-600" size={20} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">PCI-DSS Compliant</p>
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto">
                  <Shield className="text-gray-600" size={20} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Bank-Grade Encryption</p>
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto">
                  <Lock className="text-gray-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
