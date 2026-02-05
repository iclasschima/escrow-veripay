'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransactionStore } from '@/store/transactionStore';
import {
  LayoutDashboard,
  Plus,
  Store,
  Scale,
  CreditCard,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
  pageTitle?: string;
  pageDescription?: string;
}

export default function DashboardLayout({
  children,
  activeMenu: externalActiveMenu,
  pageTitle = 'Hello, Tiwa 👋',
  pageDescription = 'Track your transactions, manage orders, and get paid faster',
}: DashboardLayoutProps) {
  const router = useRouter();
  const transactions = useTransactionStore((state) => state.transactions);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(externalActiveMenu || 'Dashboard');

  // Calculate counts
  const sellingOrders = {
    awaitingShipping: transactions.filter(txn => txn.stage === 'funds_secured' && !txn.waybillNumber).length,
    fundsLocked: transactions.filter(txn => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage)).length,
    completed: transactions.filter(txn => txn.stage === 'completed').length,
  };

  const disputesCount = transactions.filter(txn => txn.isDisputed || txn.stage === 'disputed').length;

  const handleCreateLink = () => {
    router.push('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/app/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <span className="text-xl lg:text-2xl font-bold text-gray-900">VeriPay</span>
            <span className="text-xl lg:text-2xl font-bold text-gray-400">.io</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Top Section: Main Actions */}
          <div className="space-y-2 mb-6">
            <Link
              href="/app/dashboard"
              onClick={() => {
                setActiveMenu('Dashboard');
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                activeMenu === 'Dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>

            <button
              onClick={() => {
                handleCreateLink();
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold ${
                activeMenu === 'Create Transaction' ? 'ring-2 ring-purple-300' : ''
              }`}
            >
              <Plus size={18} />
              <span>Create Transaction</span>
            </button>

          </div>

          {/* Middle Section: The Escrow Lifecycle */}
          <div className="space-y-2 mb-6 border-t border-gray-200 pt-4">
            <Link
              href="/app/sales"
              onClick={() => {
                setActiveMenu('Selling');
                setSidebarOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                activeMenu === 'Selling'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store size={20} />
                <span className="font-medium">My Sales</span>
              </div>
              {(sellingOrders.awaitingShipping + sellingOrders.fundsLocked + sellingOrders.completed) > 0 && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {sellingOrders.awaitingShipping + sellingOrders.fundsLocked + sellingOrders.completed}
                </span>
              )}
            </Link>

            <Link
              href="/app/disputes"
              onClick={() => {
                setActiveMenu('Disputes');
                setSidebarOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                activeMenu === 'Disputes'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Scale size={20} />
                <span className="font-medium">Disputes</span>
              </div>
              {disputesCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium">
                  {disputesCount}
                </span>
              )}
            </Link>
          </div>

          {/* Bottom Section: Wallet & Tools */}
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <Link
              href="/app/wallet"
              onClick={() => {
                setActiveMenu('Wallet');
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                activeMenu === 'Wallet'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard size={20} />
              <span className="font-medium">Wallet / Payouts</span>
            </Link>

            <Link
              href="/verification"
              onClick={() => {
                setActiveMenu('Verification');
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                activeMenu === 'Verification'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCheck size={20} />
              <span className="font-medium">Verification (KYC)</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => {
                setActiveMenu('Settings');
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                activeMenu === 'Settings'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Mobile Header with Menu Button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <Link href="/app/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">VeriPay</span>
              <span className="text-xl font-bold text-gray-400">.io</span>
            </Link>
            <div className="w-10"></div>
          </div>

          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {pageDescription}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
