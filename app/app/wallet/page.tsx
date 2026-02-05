'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTransactionStore } from '@/store/transactionStore';
import { format } from 'date-fns';
import { 
  CreditCard,
  Wallet,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { formatAmount, formatNumberInput, parseFormattedNumber } from '@/utils/format';

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low';
type FilterType = 'all' | 'payouts' | 'deposits';

const ITEMS_PER_PAGE = 10;

interface WalletTransaction {
  id: string;
  type: 'payout' | 'deposit';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  transactionId?: string;
}

export default function WalletPage() {
  const transactions = useTransactionStore((state) => state.transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Calculate wallet balances
  const balances = useMemo(() => {
    const securedBalance = transactions
      .filter((txn) => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage))
      .reduce((sum, txn) => sum + txn.totalAmount, 0);

    const clearedFunds = transactions
      .filter((txn) => txn.stage === 'completed')
      .reduce((sum, txn) => sum + txn.totalAmount, 0);

    // Simulate wallet transactions from completed transactions
    const walletTransactions: WalletTransaction[] = transactions
      .filter((txn) => txn.stage === 'completed')
      .map((txn) => ({
        id: `wallet_${txn.id}`,
        type: 'payout' as const,
        amount: txn.totalAmount,
        description: `Payout for ${txn.itemName}`,
        status: 'completed' as const,
        date: txn.updatedAt,
        transactionId: txn.id,
      }));

    return {
      securedBalance,
      clearedFunds,
      walletTransactions,
    };
  }, [transactions]);

  // Filter and sort wallet transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...balances.walletTransactions];

    // Filter by type
    if (filterType === 'payouts') {
      filtered = filtered.filter(txn => txn.type === 'payout');
    } else if (filterType === 'deposits') {
      filtered = filtered.filter(txn => txn.type === 'deposit');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(txn => 
        txn.description.toLowerCase().includes(query) ||
        txn.id.toLowerCase().includes(query) ||
        (txn.transactionId && txn.transactionId.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.date.getTime() - a.date.getTime();
        case 'oldest':
          return a.date.getTime() - b.date.getTime();
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [balances.walletTransactions, filterType, searchQuery, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredAndSortedTransactions.slice(startIndex, endIndex);

  const handleWithdraw = () => {
    const parsedAmount = parseFormattedNumber(withdrawAmount);
    if (!withdrawAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (parsedAmount > balances.clearedFunds) return;
    
    // In a real app, this would call an API to process withdrawal
    alert(`Withdrawal request for ${formatAmount(parsedAmount)} submitted successfully!`);
    setWithdrawAmount('');
    setShowWithdrawModal(false);
  };

  return (
    <DashboardLayout
      activeMenu="Wallet"
      pageTitle="Wallet & Payouts"
      pageDescription="Manage your earnings and withdraw funds"
    >
      <div className="max-w-6xl">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-purple-700">Secured Balance</span>
              <Wallet className="text-purple-600" size={20} />
            </div>
            {balances.securedBalance > 0 ? (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(balances.securedBalance, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Funds locked in active transactions</p>
              </>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(0, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">No active transactions at the moment</p>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-green-700">Cleared Funds</span>
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
            {balances.clearedFunds > 0 ? (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(balances.clearedFunds, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Available for withdrawal</p>
              </>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(0, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Complete sales to earn cleared funds</p>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-blue-700">Total Earnings</span>
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            {(balances.clearedFunds + balances.securedBalance) > 0 ? (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(balances.clearedFunds + balances.securedBalance, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">All-time total</p>
              </>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(0, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Start selling to see your earnings</p>
              </>
            )}
          </div>
        </div>

        {/* Withdraw Button */}
        {balances.clearedFunds > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Withdraw Funds
                </h3>
                <p className="text-sm text-gray-600">
                  Transfer {formatAmount(balances.clearedFunds, false)} to your bank account or mobile money
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <ArrowDown size={18} />
                Withdraw Now
              </button>
            </div>
          </div>
        )}

        {/* Search, Filter, and Sort Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as FilterType);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
              >
                <option value="all">All Transactions</option>
                <option value="payouts">Payouts</option>
                <option value="deposits">Deposits</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-gray-400" size={20} />
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} transactions
          </p>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <Download size={16} />
            Export Statement
          </button>
        </div>

        {/* Transactions List */}
        {paginatedTransactions.length > 0 ? (
          <div className="space-y-4 mb-6">
            {paginatedTransactions.map((txn) => (
              <div
                key={txn.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      txn.type === 'payout' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {txn.type === 'payout' ? (
                        <ArrowDown size={24} />
                      ) : (
                        <ArrowUp size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {txn.description}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {format(txn.date, 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          txn.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : txn.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </span>
                      </div>
                      {txn.transactionId && (
                        <p className="text-xs text-gray-500">
                          Transaction ID: {txn.transactionId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className={`text-xl font-bold ${
                      txn.type === 'payout' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {txn.type === 'payout' ? '-' : '+'}{formatAmount(txn.amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Your wallet transactions will appear here'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowWithdrawModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                  <input
                      type="text"
                      value={withdrawAmount ? formatNumberInput(withdrawAmount) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d.]/g, '');
                        const parts = rawValue.split('.');
                        const formatted = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('')
                          : rawValue;
                        setWithdrawAmount(formatted);
                      }}
                      onBlur={(e) => {
                        const parsed = parseFormattedNumber(e.target.value);
                        if (!isNaN(parsed) && parsed >= 0) {
                          setWithdrawAmount(String(parsed));
                        }
                      }}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    placeholder={`Max: ${formatAmount(balances.clearedFunds, false)}`}
                  />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {formatAmount(balances.clearedFunds, false)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFormattedNumber(withdrawAmount) <= 0 || parseFormattedNumber(withdrawAmount) > balances.clearedFunds}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
