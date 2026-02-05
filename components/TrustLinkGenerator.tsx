'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { FeeSplitOption } from '@/types';
import { Share2, Copy, Check } from 'lucide-react';
import { formatNumberInput, parseFormattedNumber } from '@/utils/format';

export default function TrustLinkGenerator() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [inspectionPeriod, setInspectionPeriod] = useState('48');
  const [feeSplit, setFeeSplit] = useState<FeeSplitOption>('split');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createTrustLink = useTransactionStore((state) => state.createTrustLink);

  const handleGenerate = () => {
    if (!itemName || !price) return;

    const parsedPrice = parseFormattedNumber(price);
    const parsedShipping = parseFormattedNumber(shippingCost);

    const linkId = createTrustLink({
      itemName,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      price: parsedPrice,
      shippingCost: parsedShipping || 0,
      inspectionPeriodHours: parseInt(inspectionPeriod) || 48,
      feeSplit,
      sellerName: 'Tiwa Adebayo', // This would come from user profile in real app
      sellerPhone: '+2348098765432',
      sellerEmail: 'tiwa@example.com',
      sellerRating: 4.8,
      sellerVerified: true,
      sellerTrustScore: 92,
      sellerCompletedTransactions: 147,
    });

    const fullLink = `${window.location.origin}/pay/${linkId}`;
    setGeneratedLink(fullLink);
  };

  const handleCopy = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: 'whatsapp' | 'instagram') => {
    if (!generatedLink) return;

    const message = encodeURIComponent(
      `Check out this secure payment link: ${generatedLink}`
    );

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } else if (platform === 'instagram') {
      // Instagram DM sharing would require mobile app or different approach
      window.open(`https://www.instagram.com/direct/inbox/`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
            placeholder="e.g., iPhone 15 Pro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
            placeholder="Brief description of the item..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image URL (Optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
            <input
                type="text"
                value={price ? formatNumberInput(price) : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d.]/g, '');
                  const parts = rawValue.split('.');
                  const formatted = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : rawValue;
                  setPrice(formatted);
                }}
                onBlur={(e) => {
                  const parsed = parseFormattedNumber(e.target.value);
                  if (!isNaN(parsed) && parsed >= 0) {
                    setPrice(String(parsed));
                  }
                }}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
              placeholder="0.00"
            />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Cost (₦)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
            <input
                type="text"
                value={shippingCost ? formatNumberInput(shippingCost) : ''}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d.]/g, '');
                  const parts = rawValue.split('.');
                  const formatted = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : rawValue;
                  setShippingCost(formatted);
                }}
                onBlur={(e) => {
                  const parsed = parseFormattedNumber(e.target.value);
                  if (!isNaN(parsed) && parsed >= 0) {
                    setShippingCost(String(parsed));
                  }
                }}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
              placeholder="0.00"
            />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspection Period (hours)
          </label>
          <input
            type="number"
            value={inspectionPeriod}
            onChange={(e) => setInspectionPeriod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
            placeholder="48"
            min="1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Funds will auto-release if buyer doesn't reject within this time
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Split
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFeeSplit('buyer')}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                feeSplit === 'buyer'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
              }`}
            >
              Buyer Pays
            </button>
            <button
              onClick={() => setFeeSplit('seller')}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                feeSplit === 'seller'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
              }`}
            >
              Seller Pays
            </button>
            <button
              onClick={() => setFeeSplit('split')}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                feeSplit === 'split'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
              }`}
            >
              Split 50/50
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
        >
          Generate Payment Link
        </button>

        {generatedLink && (
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Link Generated!</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleCopy}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share to WhatsApp
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share to Instagram
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
