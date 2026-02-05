"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Share2, Smartphone, AlertCircle } from "lucide-react";
import {
  formatAmount,
  formatNumberInput,
  parseFormattedNumber,
} from "@/utils/format";
import { createBuyerIntent } from "@/utils/api";

export default function BuyerLinkGenerator() {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [feeSplit, setFeeSplit] = useState<"buyer" | "seller" | "split">(
    "split"
  );
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate fees (2.5% escrow fee, min ₦500, max ₦10,000, buyer selects who pays)
  const calculations = useMemo(() => {
    if (!price) return null;

    const amount = parseFormattedNumber(price);
    if (isNaN(amount) || amount <= 0) return null;
    const calculatedFee = amount * 0.025; // 2.5% fee
    // Apply minimum and maximum caps
    const escrowFee = Math.max(500, Math.min(calculatedFee, 10000));

    let buyerFee = 0;
    let sellerFee = 0;

    if (feeSplit === "buyer") {
      buyerFee = escrowFee;
      sellerFee = 0;
    } else if (feeSplit === "seller") {
      buyerFee = 0;
      sellerFee = escrowFee;
    } else {
      // Split 50/50
      buyerFee = escrowFee / 2;
      sellerFee = escrowFee / 2;
    }

    return {
      buyerPays: amount + buyerFee,
      sellerReceives: amount - sellerFee,
      escrowFee,
      buyerFee,
      sellerFee,
      feeSplit,
    };
  }, [price, feeSplit]);

  const magicMessage = useMemo(() => {
    if (!generatedLink) return "";

    const parsedPrice = parseFormattedNumber(price);
    const formattedPrice =
      !isNaN(parsedPrice) && parsedPrice > 0
        ? formatAmount(parsedPrice, false)
        : `₦${price || ""}`;

    return `Hey! I want to buy your ${itemName} for ${formattedPrice}. To keep us both safe, I'm using VeriPay Escrow. Click here to accept the deal and I'll pay immediately: ${generatedLink}`;
  }, [generatedLink, itemName, price]);

  const handleGenerate = async () => {
    if (!itemName || !price || !buyerPhone) {
      setError("Please provide item name, amount, and your phone number");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const amount = parseFormattedNumber(price);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        setIsGenerating(false);
        return;
      }

      // Call backend API
      const response = await createBuyerIntent({
        itemName,
        amount,
        buyerPhone: buyerPhone.trim(),
        sellerPhone: sellerPhone.trim() || undefined,
        feeSplit: feeSplit,
      });

      if (!response.success || !response.data) {
        setError(response.error || "Failed to create purchase link");
        setIsGenerating(false);
        return;
      }

      setTrackingId(response.data.trackingId);
      setGeneratedLink(response.data.dealUrl);

      // Log success (in production, this would trigger SMS)
      console.log(
        `Purchase link created. Tracking ID: ${response.data.trackingId}`
      );
      console.log(`Deal URL: ${response.data.dealUrl}`);
    } catch (err: any) {
      console.error("Error creating purchase link:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (magicMessage) {
      navigator.clipboard.writeText(magicMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (magicMessage) {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(magicMessage)}`,
        "_blank"
      );
    }
  };

  const handleShareFacebook = () => {
    if (generatedLink) {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        generatedLink
      )}`;
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const handleShareInstagram = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert("Link copied! Paste it in your Instagram story or post.");
    }
  };

  const handleShareTikTok = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert(
        "Link copied! Paste it in your TikTok video description or comments."
      );
    }
  };

  const handleCreateAnother = () => {
    setItemName("");
    setPrice("");
    setBuyerPhone("");
    setSellerPhone("");
    setFeeSplit("split");
    setGeneratedLink(null);
    setTrackingId(null);
    setCopied(false);
    setError(null);
  };

  // Success State
  if (generatedLink) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-purple-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Your purchase link is ready!
          </h3>
          <p className="text-sm text-gray-600">
            Send this link to the seller to accept the deal
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-2 font-medium text-center">
            Magic message (copy & send to seller)
          </p>
          <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
            {magicMessage}
          </p>
        </div>

        <div className="mb-4">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Message
              </>
            )}
          </button>

          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-3 text-center font-medium">
              Share with seller
            </p>
            <div className="flex gap-2 justify-center">
              {/* WhatsApp */}
              <button
                onClick={handleShareWhatsApp}
                className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#20BA5A] transition-colors shadow-md hover:shadow-lg"
                title="Share on WhatsApp"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .96 4.534.96 10.089c0 1.847.485 3.58 1.336 5.081L.24 23.577l8.568-2.247a11.9 11.9 0 003.242.424h.004c5.554 0 10.089-4.535 10.089-10.088 0-2.898-1.204-5.51-3.144-7.373" />
                </svg>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareFacebook}
                className="w-9 h-9 bg-[#1877F2] rounded-full flex items-center justify-center hover:bg-[#166FE5] transition-colors shadow-md hover:shadow-lg"
                title="Share on Facebook"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* Instagram */}
              <button
                onClick={handleShareInstagram}
                className="w-9 h-9 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                title="Share on Instagram"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>

              {/* TikTok */}
              <button
                onClick={handleShareTikTok}
                className="w-9 h-9 bg-[#000000] rounded-full flex items-center justify-center hover:bg-[#161823] transition-colors shadow-md hover:shadow-lg"
                title="Share on TikTok"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-2">
          <Smartphone
            className="text-purple-600 flex-shrink-0 mt-0.5"
            size={16}
          />
          <p className="text-xs text-purple-900">
            Send this link to the seller. Once they accept, you'll be notified
            to proceed with payment.
          </p>
        </div>

        <button
          onClick={handleCreateAnother}
          className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Create another link
        </button>
      </div>
    );
  }

  // Form State
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Generate Purchase Link
      </h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., MacBook Air M1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              ₦
            </span>
            <input
              type="text"
              value={price ? formatNumberInput(price) : ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d.]/g, "");
                const parts = rawValue.split(".");
                const formatted =
                  parts.length > 2
                    ? parts[0] + "." + parts.slice(1).join("")
                    : rawValue;
                setPrice(formatted);
              }}
              onBlur={(e) => {
                const parsed = parseFormattedNumber(e.target.value);
                if (!isNaN(parsed) && parsed > 0) {
                  setPrice(String(parsed));
                }
              }}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Fee Split Selection */}
          {price && parseFormattedNumber(price) > 0 && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who pays the 2.5% service fee?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFeeSplit("seller")}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    feeSplit === "seller"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                  }`}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setFeeSplit("split")}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    feeSplit === "split"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                  }`}
                >
                  Split 50/50
                </button>
                <button
                  type="button"
                  onClick={() => setFeeSplit("buyer")}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    feeSplit === "buyer"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                  }`}
                >
                  You
                </button>
              </div>
            </div>
          )}

          {/* Live Calculation */}
          {calculations && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-700">Service fee (2.5%):</span>
                <span className="font-semibold text-gray-900">
                  {formatAmount(calculations.escrowFee, false)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-500">
                  {calculations.feeSplit === "buyer" && "Paid by you"}
                  {calculations.feeSplit === "seller" && "Paid by seller"}
                  {calculations.feeSplit === "split" && "Split 50/50"}
                </span>
                <span className="text-gray-500">Min: ₦500 • Max: ₦10,000</span>
              </div>
              <div className="border-t border-purple-200 pt-2 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Buyer pays:</span>
                  <span className="font-semibold text-gray-900">
                    {formatAmount(calculations.buyerPays, false)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-700">Seller receives:</span>
                  <span className="font-semibold text-purple-600">
                    {formatAmount(calculations.sellerReceives, false)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Phone
          </label>
          <input
            type="tel"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="080... (for notifications)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll notify you when the seller accepts
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seller Phone (Optional)
          </label>
          <input
            type="tel"
            value={sellerPhone}
            onChange={(e) => setSellerPhone(e.target.value)}
            placeholder="080... (if you know it)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Pre-fill seller's phone if you have it
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={16}
            />
            <p className="text-xs text-red-900">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!itemName || !price || !buyerPhone || isGenerating}
          className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>Generate Purchase Link — It's Free</>
          )}
        </button>
      </div>
    </div>
  );
}
