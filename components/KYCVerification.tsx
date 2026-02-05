'use client';

import { useState } from 'react';
import { formatAmount } from '@/utils/format';
import { KYCLevel, KYCData } from '@/types';
import { Phone, IdCard, CheckCircle2 } from 'lucide-react';

interface KYCVerificationProps {
  amount: number;
  onVerify: (kycData: KYCData) => void;
  currentKYC?: KYCData;
}

export default function KYCVerification({
  amount,
  onVerify,
  currentKYC,
}: KYCVerificationProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [nationalIdType, setNationalIdType] = useState<'NIN' | 'GhanaCard' | 'KRAPin'>('NIN');
  const [nationalIdNumber, setNationalIdNumber] = useState('');

  const requiredLevel: KYCLevel = amount < 50 ? 'level1' : 'level2';
  const isLevel1Complete = currentKYC?.level === 'level1' || currentKYC?.phoneVerified;
  const isLevel2Complete = currentKYC?.level === 'level2' || currentKYC?.nationalIdVerified;

  const handleSendOTP = () => {
    // In production, this would call an API to send OTP
    setOtpSent(true);
    // Simulate OTP (in production, this comes from backend)
    console.log('OTP sent to', phone);
  };

  const handleVerifyOTP = () => {
    // In production, verify OTP with backend
    onVerify({
      level: 'level1',
      phoneVerified: true,
    });
    setOtpSent(false);
  };

  const handleVerifyNationalID = () => {
    // In production, this would integrate with Smile ID or Identifii
    onVerify({
      level: 'level2',
      phoneVerified: isLevel1Complete,
      nationalIdVerified: true,
      nationalIdType,
      nationalIdNumber,
    });
  };

  if (requiredLevel === 'level1' && isLevel1Complete) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-green-600">
          <CheckCircle2 size={24} />
          <div>
            <h3 className="font-semibold">Level 1 KYC Verified</h3>
            <p className="text-sm text-gray-600">Phone number verified</p>
          </div>
        </div>
      </div>
    );
  }

  if (requiredLevel === 'level2' && isLevel2Complete) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-green-600">
          <CheckCircle2 size={24} />
          <div>
            <h3 className="font-semibold">Level 2 KYC Verified</h3>
            <p className="text-sm text-gray-600">National ID verified</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Identity Verification Required
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Transaction amount: {formatAmount(amount)}
        {requiredLevel === 'level2' && ' - National ID verification required'}
      </p>

      {requiredLevel === 'level1' && !isLevel1Complete && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Phone size={20} />
            <span className="font-medium">Level 1: Phone Verification</span>
          </div>

          {!otpSent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>
              <button
                onClick={handleSendOTP}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Verify OTP
              </button>
            </>
          )}
        </div>
      )}

      {requiredLevel === 'level2' && (
        <div className="space-y-4">
          {!isLevel1Complete && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Phone size={20} />
                <span className="font-medium">Step 1: Phone Verification</span>
              </div>
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors mb-4"
                  >
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors mb-4"
                  >
                    Verify OTP
                  </button>
                </>
              )}
            </div>
          )}

          {isLevel1Complete && !isLevel2Complete && (
            <>
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 size={20} />
                <span className="font-medium text-sm">Phone verified</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <IdCard size={20} />
                <span className="font-medium">Step 2: National ID Verification</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Type
                </label>
                <select
                  value={nationalIdType}
                  onChange={(e) =>
                    setNationalIdType(e.target.value as 'NIN' | 'GhanaCard' | 'KRAPin')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  <option value="NIN">NIN (Nigeria)</option>
                  <option value="GhanaCard">Ghana Card</option>
                  <option value="KRAPin">KRA Pin (Kenya)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number
                </label>
                <input
                  type="text"
                  value={nationalIdNumber}
                  onChange={(e) => setNationalIdNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  placeholder="Enter your ID number"
                />
              </div>

              <button
                onClick={handleVerifyNationalID}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Verify National ID
              </button>

              <p className="text-xs text-gray-500 mt-2">
                Verification powered by Smile ID / Identifii
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
