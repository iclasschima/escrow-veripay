'use client';

import { useTransactionStore } from '@/store/transactionStore';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatAmount } from '@/utils/format';
import { 
  LayoutDashboard, 
  Wallet, 
  Settings, 
  LogOut,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Shield,
  Star,
  DollarSign,
  Link as LinkIcon,
  Store,
  Scale,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { TransactionStage } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Dashboard() {
  const transactions = useTransactionStore((state) => state.transactions);
  const trustLinks = useTransactionStore((state) => state.trustLinks);
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // No authentication required - users can access dashboard directly
  // Onboarding is optional and can be skipped
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Calculate Secured Balance (active deals: funds_secured, in_transit, inspection)
  const securedBalance = transactions
    .filter((txn) => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage))
    .reduce((sum, txn) => sum + txn.totalAmount, 0);

  // Shipping Tasks: transactions marked as funds_secured (paid) that need waybill
  const shippingTasks = transactions
    .filter((txn) => txn.stage === 'funds_secured' && !txn.waybillNumber)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());


  // Calculate Vendor Trust Score
  const totalCompleted = transactions.filter((txn) => txn.stage === 'completed').length;
  const totalDisputed = transactions.filter((txn) => txn.isDisputed).length;
  const totalTransactions = transactions.length;
  
  const completionRate = totalTransactions > 0 ? (totalCompleted / totalTransactions) * 100 : 0;
  const disputeRate = totalTransactions > 0 ? (totalDisputed / totalTransactions) * 100 : 0;
  
  // Trust score: 0-100 based on completion rate and low dispute rate
  // Higher completion rate = higher score, lower dispute rate = higher score
  const trustScore = Math.max(0, Math.min(100, 
    (completionRate * 0.7) + ((100 - disputeRate) * 0.3)
  ));

  // Safe to Ship indicator: transactions with funds_secured that are ready to ship
  const safeToShipCount = shippingTasks.length;

  // Calculate selling orders (as seller perspective)
  const sellingOrders = {
    awaitingShipping: transactions.filter(txn => txn.stage === 'funds_secured' && !txn.waybillNumber).length,
    fundsLocked: transactions.filter(txn => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage)).length,
    completed: transactions.filter(txn => txn.stage === 'completed').length,
  };

  // Disputes count
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
          <Link href="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
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
              href="/app/onboarding"
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
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors">
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
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">VeriPay</span>
              <span className="text-xl font-bold text-gray-400">.io</span>
            </Link>
            <div className="w-10"></div>
          </div>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Hello, Tiwa 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your transactions, manage orders, and get paid faster
            </p>
          </div>

          <div className="max-w-6xl">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
            {/* Secured Balance */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-medium text-purple-700">Secured Balance</span>
                <Shield className="text-purple-600" size={20} />
              </div>
              {securedBalance > 0 ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {formatAmount(securedBalance)}
                  </p>
                  <p className="text-xs text-gray-600">Held for active deals</p>
                </>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {formatAmount(0)}
                  </p>
                  <p className="text-xs text-gray-600">Create your first payment link to start selling safely</p>
                </>
              )}
            </div>

            {/* Safe to Ship */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-medium text-green-700">Safe to Ship</span>
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              {safeToShipCount > 0 ? (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {safeToShipCount}
                  </p>
                  <p className="text-xs text-gray-600">Ready to ship now</p>
                </>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    0
                  </p>
                  <p className="text-xs text-gray-600">No pending shipments at the moment</p>
                </>
              )}
            </div>


            {/* Vendor Trust Score */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-medium text-amber-700">Trust Score</span>
                <Star className="text-amber-600" size={20} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {Math.round(trustScore)}
              </p>
              <p className="text-xs text-gray-600">Based on performance</p>
            </div>
          </div>

          {/* Shipping Tasks Section */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shipping Tasks</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Transactions paid and ready to ship - upload tracking numbers
                </p>
              </div>
              {shippingTasks.length > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                  {shippingTasks.length} pending
                </span>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {shippingTasks.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {shippingTasks.map((txn) => (
                    <Link
                      key={txn.id}
                      href={`/app/transactions/${txn.id}`}
                      className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Package className="text-green-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{txn.itemName}</h4>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium self-start">
                                Paid
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatAmount(txn.totalAmount)} • {format(txn.createdAt, 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              ⚠️ Tracking number required
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:ml-auto">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Add Waybill →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500 font-medium">No shipping tasks</p>
                  <p className="text-sm text-gray-400 mt-1">All paid orders have tracking numbers</p>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Active Deals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Deals</h2>
                <Link href="/app/transactions" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all →
                </Link>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {transactions.filter((txn) => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage)).length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {transactions
                      .filter((txn) => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage))
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .slice(0, 5)
                      .map((txn) => {
                        const stageLabels: Record<string, string> = {
                          funds_secured: 'Funds Secured',
                          in_transit: 'In Transit',
                          inspection: 'Inspection',
                        };
                        const stageColors: Record<string, string> = {
                          funds_secured: 'bg-green-100 text-green-700',
                          in_transit: 'bg-blue-100 text-blue-700',
                          inspection: 'bg-yellow-100 text-yellow-700',
                        };
                        
                        return (
                          <Link
                            key={txn.id}
                            href={`/app/transactions/${txn.id}`}
                            className="block p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">{txn.itemName}</h4>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {formatAmount(txn.totalAmount)} • {format(txn.createdAt, 'MMM dd')}
                                </p>
                              </div>
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${stageColors[txn.stage]}`}>
                                {stageLabels[txn.stage]}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No active deals
                  </div>
                )}
              </div>
            </div>

            {/* Trust Score Details */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Trust Score Breakdown</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Score</span>
                    <span className="text-2xl font-bold text-gray-900">{Math.round(trustScore)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${trustScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalCompleted} of {totalTransactions} completed
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Dispute Rate</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.round(disputeRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${disputeRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalDisputed} of {totalTransactions} disputed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
