"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
  Lock,
  Building2,
  FileCheck,
  AlertTriangle,
  Clock,
  Smartphone,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import ProtectionModal from "@/components/ProtectionModal";
import QuickLinkGenerator from "@/components/QuickLinkGenerator";
import BuyerLinkGenerator from "@/components/BuyerLinkGenerator";

export default function LandingPage() {
  const [showProtectionModal, setShowProtectionModal] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">VeriPay</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/onboarding"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="text-3xl">Stop Worrying About</span>
              <br />
              <span className="text-purple-600">
                "What I Ordered vs. What I Got."
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Pay for anything online with <strong>VeriPay</strong>. We hold
              your money securely and only pay the seller when you confirm
              receipt. <strong>No scams. No stories. Just safe trade.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowProtectionModal(true)}
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                How we protect you
                <Shield size={20} />
              </button>
            </div>
          </div>

          {/* Right Side - Quick Link Generator (Floating Card) */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              {/* Toggle */}
              <div className="mb-4 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setIsBuyer(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isBuyer
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                      }`}
                  >
                    I am Selling
                  </button>
                  <button
                    onClick={() => setIsBuyer(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isBuyer
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900"
                      }`}
                  >
                    I am Buying
                  </button>
                </div>
              </div>

              {isBuyer ? <BuyerLinkGenerator /> : <QuickLinkGenerator />}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <Building2 className="text-purple-600" size={20} />
            <span className="text-sm text-gray-700">
              Secured by <strong>Paystack</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="text-green-600" size={20} />
            <span className="text-sm text-gray-700">
              <strong>NDPR</strong> Compliant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-blue-600" size={20} />
            <span className="text-sm text-gray-700">
              <strong className="text-purple-600">₦0M+</strong> Secured
            </span>
          </div>
        </div>
      </section>

      {/* Common Scams We Stop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">
            Common Scams We Stop
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Ghost Seller */}
          <div className="flex flex-col items-center text-center px-4 py-8 rounded-2xl bg-white/80 border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex items-center justify-center">
              <AlertTriangle className="text-[#3EC770]" size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-[#2C3E50] mb-3">
              The &quot;Ghost&quot; Seller
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-3">
              Seller takes payment and disappears.
            </p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              <span className="font-semibold text-[#2C3E50]">How VeriPay stops it:</span> We don&apos;t release funds until tracking is verified.
            </p>
          </div>

          {/* Stone in Box */}
          <div className="flex flex-col items-center text-center px-4 py-8 rounded-2xl bg-white/80 border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex items-center justify-center">
              <Clock className="text-[#3EC770]" size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-[#2C3E50] mb-3">
              The &quot;Stone in Box&quot;
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-3">
              Seller ships wrong or damaged item.
            </p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              <span className="font-semibold text-[#2C3E50]">How VeriPay stops it:</span> You have 48 hours to inspect before we pay.
            </p>
          </div>

          {/* Silent Vendor */}
          <div className="flex flex-col items-center text-center px-4 py-8 rounded-2xl bg-white/80 border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 flex items-center justify-center">
              <Smartphone className="text-[#3EC770]" size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-[#2C3E50] mb-3">
              The &quot;Silent&quot; Vendor
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-3">
              Seller collects payment but never ships.
            </p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              <span className="font-semibold text-[#2C3E50]">How VeriPay stops it:</span> Automatic 100% refund if they don&apos;t ship.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex items-center justify-center">
              <Shield className="text-[#3EC770]" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-3">
              100% Protected
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-sm">
              Funds held securely until you confirm delivery. No release until you&apos;re satisfied.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex items-center justify-center">
              <Zap className="text-[#3EC770]" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-3">
              Instant Links
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-sm">
              Create payment links in seconds. Share anywhere—no coding required.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex items-center justify-center">
              <TrendingUp className="text-[#3EC770]" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-3">
              Trust Built
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-sm">
              Build reputation with verified transactions. Buyers and sellers both win.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-[#FFFFFF]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">
            How It Works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#3EC770]/30 shadow-sm">
              <span className="text-xl font-bold text-[#3EC770]">1</span>
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-2">
              Create Link
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Seller creates secure payment link
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#3EC770]/30 shadow-sm">
              <span className="text-xl font-bold text-[#3EC770]">2</span>
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-2">
              Buyer Pays
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Buyer pays via Mobile Money, Bank, or Card
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#3EC770]/30 shadow-sm">
              <span className="text-xl font-bold text-[#3EC770]">3</span>
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-2">
              Seller Ships
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Seller ships with tracking. Funds locked
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-[#3EC770]/30 shadow-sm">
              <span className="text-xl font-bold text-[#3EC770]">4</span>
            </div>
            <h3 className="text-[19px] font-bold text-[#2C3E50] mb-2">
              Confirm & Release
            </h3>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Buyer confirms. Funds released
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F7F8FA] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {/* Testimonial 1 */}
            <div className="flex flex-col items-center text-center px-6 py-10">
              <div className="w-16 h-16 rounded-full bg-[#161C2D] flex items-center justify-center text-white text-xl font-bold mb-5">
                CA
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#161C2D] mb-3">
                &quot;You made it so simple&quot;
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-4 max-w-sm">
                My buyers pay with confidence and I get my money only after they confirm. No more chasing or disputes.
              </p>
              <p className="font-bold text-[#161C2D]">Chidi Amadi</p>
              <p className="text-sm text-[#6B7280]">Seller, Lagos</p>
            </div>
            {/* Testimonial 2 */}
            <div className="flex flex-col items-center text-center px-6 py-10">
              <div className="w-16 h-16 rounded-full bg-[#161C2D] flex items-center justify-center text-white text-xl font-bold mb-5">
                NO
              </div>
              <p className="text-lg sm:text-xl font-bold text-[#161C2D] mb-3">
                &quot;Simply the best&quot;
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-4 max-w-sm">
                Better than sending money first and hoping. I&apos;d recommend VeriPay to anyone buying or selling online.
              </p>
              <p className="font-bold text-[#161C2D]">Ngozi Okonkwo</p>
              <p className="text-sm text-[#6B7280]">Buyer, Abuja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#161C2D] text-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center">
                <span className="text-xl font-bold text-white">VeriPay</span>
              </div>
              <p className="text-sm text-[#CBD5E0] leading-relaxed max-w-sm">
                Secure payments for buyers and sellers. Create links, track transactions, and release funds only when everyone is happy.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="text-[#CBD5E0] hover:text-[#3EC770] transition-colors" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-[#CBD5E0] hover:text-[#3EC770] transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-[#CBD5E0] hover:text-[#3EC770] transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-[#CBD5E0] hover:text-[#3EC770] transition-colors" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">About us</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Contact us</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            {/* Product */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">News</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Help desk</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            {/* Services */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Services</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Escrow for Sellers</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Escrow for Buyers</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Payment Protection</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Transaction Tracking</Link></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="#" className="text-sm text-[#CBD5E0] hover:text-white transition-colors">Return Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-[#94A3B8]">© {new Date().getFullYear()} VeriPay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Protection Modal */}
      <ProtectionModal
        isOpen={showProtectionModal}
        onClose={() => setShowProtectionModal(false)}
      />
    </div>
  );
}
