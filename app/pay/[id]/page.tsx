'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTransactionStore } from '@/store/transactionStore';
import { useState, useEffect } from 'react';
import { getTransactionStatus, initializePayment, verifyPayment } from '@/utils/api';
import Script from 'next/script';
import {
  Shield,
  User,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  TrendingUp,
  Lock,
  CreditCard,
  FileText,
  MessageCircle,
  Download,
  CheckCircle,
  Package,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatAmount } from '@/utils/format';
import DisputeTermsModal from '@/components/DisputeTermsModal';

export default function TrustLinkPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;
  const getTrustLink = useTransactionStore((state) => state.getTrustLink);
  const createTransaction = useTransactionStore((state) => state.createTransaction);
  const useTrustLink = useTransactionStore((state) => state.useTrustLink);

  const [trustLink, setTrustLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Try to get from store first (for backward compatibility)
  const storeTrustLink = getTrustLink(linkId);

  useEffect(() => {
    // If found in store, use it
    if (storeTrustLink) {
      setTrustLink(storeTrustLink);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from backend API
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const response = await getTransactionStatus(linkId);

        if (response.success && response.data) {
          // Convert backend transaction to TrustLink format
          const transactionData = response.data;

          // Allow payment for PENDING and AWAITING_PAYMENT statuses
          const allowedStatuses = ['PENDING', 'AWAITING_PAYMENT'];
          const isActive = allowedStatuses.includes(transactionData.status);

          setTrustLink({
            id: linkId,
            itemName: transactionData.itemName,
            price: transactionData.amount,
            shippingCost: 0,
            inspectionPeriodHours: 48, // Default, can be updated from backend
            feeSplit: 'split',
            sellerName: transactionData.seller?.firstName
              ? `${transactionData.seller.firstName} ${transactionData.seller.lastName || ''}`.trim()
              : 'Seller',
            sellerPhone: transactionData.seller?.phone || '',
            sellerEmail: transactionData.seller?.email || '',
            sellerRating: 4.8,
            sellerVerified: true,
            sellerTrustScore: 92,
            sellerCompletedTransactions: 0,
            used: !isActive,
            transactionId: transactionData.transactionId,
            status: isActive ? 'active' : 'used',
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
  }, [linkId, storeTrustLink]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment link...</p>
        </div>
      </div>
    );
  }

  if (error || !trustLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Link Not Found
          </h1>
          <p className="text-gray-600">
            {error || 'This payment link is invalid or has expired.'}
          </p>
        </div>
      </div>
    );
  }

  if (trustLink.used) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2">
              <Shield className="text-purple-600" size={24} />
              <h1 className="text-lg font-bold text-gray-900">
                Secure Escrow Payment via VeriPay
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Link Already Used
            </h1>
            <p className="text-gray-600 mb-4">
              This trust link has already been used for a transaction.
            </p>
            {trustLink.transactionId && (
              <Link
                href={`/app/transactions/${trustLink.transactionId}`}
                className="text-gray-800 font-medium hover:underline"
              >
                View Transaction
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  const totalAmount = trustLink.price + trustLink.shippingCost;
  const feeAmount = totalAmount * 0.03; // 3% fee
  const finalAmount =
    trustLink.feeSplit === 'buyer'
      ? totalAmount + feeAmount
      : trustLink.feeSplit === 'seller'
        ? totalAmount
        : totalAmount + feeAmount / 2;

  const handleProceed = async () => {
    if (!phone) {
      alert('Please enter your phone number');
      return;
    }

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const buyerEmail = email;

    setProcessing(true);

    try {
      // Initialize Paystack payment
      const paymentResponse = await initializePayment({
        trackingId: linkId,
        email: buyerEmail,
        phone,
        amount: finalAmount,
      });

      if (!paymentResponse.success || !paymentResponse.data) {
        alert(paymentResponse.error || 'Failed to initialize payment. Please try again.');
        setProcessing(false);
        return;
      }

      // Wait for Paystack script to load if not already loaded
      if (!paystackLoaded) {
        // Try to load Paystack script dynamically
        await new Promise((resolve) => {
          if (typeof window !== 'undefined' && (window as any).PaystackPop) {
            setPaystackLoaded(true);
            resolve(true);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.async = true;
          script.onload = () => {
            setPaystackLoaded(true);
            resolve(true);
          };
          script.onerror = () => {
            console.error('Failed to load Paystack script');
            resolve(false);
          };
          document.head.appendChild(script);
        });
      }

      // Open Paystack payment popup
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          key: paymentResponse.data.publicKey,
          email: buyerEmail,
          amount: Math.round(finalAmount * 100), // Convert to kobo
          ref: paymentResponse.data.reference,
          metadata: {
            custom_fields: [
              {
                display_name: 'Phone Number',
                variable_name: 'phone',
                value: phone,
              },
              {
                display_name: 'Item Name',
                variable_name: 'item_name',
                value: trustLink.itemName,
              },
            ],
          },
          callback: function (response: any) {
            // Handle payment verification asynchronously
            (async () => {
              try {
                const verifyResponse = await verifyPayment(response.reference);
                if (verifyResponse.success && verifyResponse.data.status === 'success') {
                  // Create transaction in local store for backward compatibility
                  const transactionId = createTransaction({
                    trustLinkId: linkId,
                    itemName: trustLink.itemName,
                    price: trustLink.price,
                    shippingCost: trustLink.shippingCost,
                    totalAmount: finalAmount,
                    feeAmount,
                    feeSplit: trustLink.feeSplit,
                    inspectionPeriodHours: trustLink.inspectionPeriodHours,
                    buyerKYCLevel: 'none',
                    sellerKYCLevel: 'none',
                    buyerPhone: phone,
                    stage: 'funds_secured',
                    isDisputed: false,
                    evidence: [],
                    chatMessages: [],
                  });

                  useTrustLink(linkId, transactionId);
                  setPaymentSuccess(true);
                } else {
                  alert('Payment verification failed. Please contact support with reference: ' + response.reference);
                  setProcessing(false);
                }
              } catch (error: any) {
                console.error('Payment verification error:', error);
                alert('Payment verification failed. Please contact support.');
                setProcessing(false);
              }
            })();
          },
          onClose: function () {
            setProcessing(false);
            // Don't show alert on close - user might have completed payment
          },
        });

        handler.openIframe();
      } else {
        // Fallback: redirect to Paystack payment page
        window.location.href = paymentResponse.data.authorizationUrl;
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      alert(error.message || 'Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleTermsAgree = () => {
    setShowTermsModal(false);
    // Automatically proceed with payment after agreeing
    handleProceed();
    setTimeout(() => {
      const transactionId = createTransaction({
        trustLinkId: linkId,
        itemName: trustLink.itemName,
        price: trustLink.price,
        shippingCost: trustLink.shippingCost,
        totalAmount: finalAmount,
        feeAmount,
        feeSplit: trustLink.feeSplit,
        inspectionPeriodHours: trustLink.inspectionPeriodHours,
        buyerKYCLevel: 'none',
        sellerKYCLevel: 'none',
        buyerPhone: phone,
        stage: 'funds_secured',
        isDisputed: false,
        evidence: [],
        chatMessages: [],
      });

      useTrustLink(linkId, transactionId);
      setPaymentSuccess(true);
      setProcessing(false);
    }, 2000);
  };

  // Success state after payment
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">VeriPay</span>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Secured Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Your {formatAmount(finalAmount)} is now locked in our secure vault.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Seller Notified</p>
                  <p className="text-sm text-gray-600">
                    We've notified {trustLink.sellerName || 'the seller'} that your payment is secured. They will ship your item soon.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Track Your Order</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Once the seller ships, you'll receive a tracking number. You can monitor your order's progress here.
                  </p>
                  {trustLink.transactionId && (
                    <Link
                      href={`/t/${trustLink.transactionId}`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1"
                    >
                      View Tracking Page →
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Inspect & Approve</p>
                  <p className="text-sm text-gray-600">
                    After delivery, you have {trustLink.inspectionPeriodHours} hours to inspect your item before funds are released.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Payment Receipt</h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                <Download size={16} />
                Download PDF
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium text-gray-900">{trustLink.itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-gray-900">{formatAmount(finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-900">Paystack</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-gray-900 text-xs">{linkId}</span>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6">
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors">
              <MessageCircle size={20} />
              Chat with Support
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trust Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-purple-600" size={24} />
              <h1 className="text-lg font-bold text-gray-900">
                Secure Escrow Payment via VeriPay
              </h1>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Lock size={14} />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <CheckCircle2 size={14} />
                <span>PCI-DSS Compliant</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Shield size={14} />
                <span>Bank-Grade Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item & Seller Info - Merged */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-6 mb-4">
                {/* Product Image */}
                {trustLink.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={trustLink.imageUrl}
                      alt={trustLink.itemName}
                      className="w-full sm:w-48 h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{trustLink.itemName}</h2>

                  {trustLink.description && (
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {trustLink.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="text-gray-400" size={14} />
                      <span>{trustLink.sellerName || 'Tiwa Adebayo'}</span>
                    </div>
                    {trustLink.sellerVerified !== false && (
                      <span title="Verified">
                        <CheckCircle2 className="text-green-500" size={14} />
                      </span>
                    )}
                    {trustLink.sellerRating !== undefined && (
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="font-medium text-gray-900">
                          {trustLink.sellerRating.toFixed(1)}
                        </span>
                        {trustLink.sellerCompletedTransactions !== undefined && (
                          <span className="text-gray-500">
                            ({trustLink.sellerCompletedTransactions} deals)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <Clock className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-blue-900">
                    <strong>Inspection Period:</strong> You have {trustLink.inspectionPeriodHours} hours to inspect after delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder="+234 801 234 5678"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send payment confirmation to this number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder="your@email.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send payment receipt and updates to this email
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Item Price</span>
                  <span className="text-gray-900">
                    {formatAmount(trustLink.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {formatAmount(trustLink.shippingCost)}
                  </span>
                </div>
                {trustLink.feeSplit === 'buyer' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Escrow Fee</span>
                    <span className="text-gray-900">{formatAmount(feeAmount)}</span>
                  </div>
                )}
                {trustLink.feeSplit === 'split' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Escrow Fee (50%)</span>
                    <span className="text-gray-900">{formatAmount(feeAmount / 2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">
                    You Pay
                  </span>
                  <span className="font-bold text-xl text-gray-900">
                    {formatAmount(finalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={processing || !phone || !email}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  'Secure My Funds Now'
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                <Shield className="inline-block mr-1" size={14} />
                Your payment is secured until delivery confirmation
              </p>

              {/* How it Works - Compact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">How It Works</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CreditCard className="text-purple-600" size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">1. Secure Your Funds</p>
                      <p className="text-xs text-gray-600">Pay via Mobile Money, Bank Transfer, or Card.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package className="text-blue-600" size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">2. Seller Ships</p>
                      <p className="text-xs text-gray-600">Seller ships your item with proof of delivery.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="text-yellow-600" size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">3. Inspect Your Order</p>
                      <p className="text-xs text-gray-600">You have {trustLink.inspectionPeriodHours} hours to inspect.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-green-600" size={12} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">4. Release & Smile</p>
                      <p className="text-xs text-gray-600">Confirm receipt and we pay the seller.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Protection - Compact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="text-purple-600" size={16} />
                  <h4 className="text-sm font-semibold text-gray-900">Our Guarantee</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs font-medium text-gray-900">100% Refund</p>
                      <p className="text-xs text-gray-600">If seller fails to ship</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs font-medium text-gray-900">Neutral Mediation</p>
                      <p className="text-xs text-gray-600">Fair dispute resolution</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                    <div>
                      <p className="text-xs font-medium text-gray-900">No Direct Payouts</p>
                      <p className="text-xs text-gray-600">Money stays secure until delivery</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-purple-700 hover:text-purple-800"
                  >
                    <FileText size={12} />
                    View Dispute Terms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dispute Terms Modal */}
      <DisputeTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        inspectionPeriodHours={trustLink.inspectionPeriodHours}
        appName="VeriPay"
      />

      {/* Paystack Script */}
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="beforeInteractive"
        onLoad={() => {
          setPaystackLoaded(true);
          console.log('Paystack script loaded');
        }}
        onError={() => {
          console.error('Failed to load Paystack script');
        }}
      />
    </div>
  );
}
