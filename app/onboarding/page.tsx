'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Link as LinkIcon, 
  Package, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Onboarding is optional - users can skip or complete it
  // No authentication required

  const steps = [
    {
      icon: Shield,
      title: 'Welcome to VeriPay',
      description: 'Your secure escrow platform for safe transactions. We hold funds until you confirm delivery.',
      color: 'purple',
    },
    {
      icon: LinkIcon,
      title: 'Create Payment Links',
      description: 'Generate secure payment links in seconds. Share via WhatsApp, Instagram, or any platform.',
      color: 'blue',
    },
    {
      icon: Package,
      title: 'Safe Shipping',
      description: 'Upload tracking numbers when you ship. Funds stay locked until buyer confirms receipt.',
      color: 'green',
    },
    {
      icon: CheckCircle2,
      title: 'Get Paid Securely',
      description: 'Once buyer approves, funds are released to your wallet. Withdraw anytime to your bank or mobile money.',
      color: 'amber',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('veripay_onboarding_complete', 'true');
    setIsComplete(true);
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 500);
  };

  const CurrentIcon = steps[currentStep].icon;
  const currentColor = steps[currentStep].color;

  const colorClasses = {
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700',
      progress: 'bg-purple-600',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      progress: 'bg-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      progress: 'bg-green-600',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
      progress: 'bg-amber-600',
    },
  };

  const colors = colorClasses[currentColor as keyof typeof colorClasses];

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      {/* Header with Skip */}
      <header className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-sm font-medium">Skip</span>
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${colors.progress}`}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <CurrentIcon className={colors.text} size={40} />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {steps[currentStep].title}
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {steps[currentStep].description}
            </p>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? `${colors.progress} w-8`
                      : index < currentStep
                      ? 'bg-gray-400 w-2'
                      : 'bg-gray-200 w-2'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className={`flex-1 sm:flex-none px-8 py-3 ${colors.button} text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2`}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight size={20} />
                  </>
                ) : (
                  <>
                    Get Started
                    <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center">
              <Zap className="mx-auto text-purple-600 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Fast Setup</p>
              <p className="text-xs text-gray-600">Get started in minutes</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center">
              <TrendingUp className="mx-auto text-blue-600 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Build Trust</p>
              <p className="text-xs text-gray-600">Grow your reputation</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 text-center">
              <Users className="mx-auto text-green-600 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Secure Payments</p>
              <p className="text-xs text-gray-600">100% protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
