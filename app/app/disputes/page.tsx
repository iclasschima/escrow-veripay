'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTransactionStore } from '@/store/transactionStore';
import { format } from 'date-fns';
import { 
  Scale,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  CheckCircle2,
  X,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { formatAmount } from '@/utils/format';

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low';
type FilterStatus = 'all' | 'open' | 'resolved';

const ITEMS_PER_PAGE = 10;

export default function DisputesPage() {
  const transactions = useTransactionStore((state) => state.transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

  // Get all disputed transactions
  const disputedTransactions = useMemo(() => {
    return transactions.filter(txn => txn.isDisputed || txn.stage === 'disputed');
  }, [transactions]);

  // Filter and sort disputes
  const filteredAndSortedDisputes = useMemo(() => {
    let filtered = [...disputedTransactions];

    // Filter by status
    if (filterStatus === 'open') {
      filtered = filtered.filter(txn => txn.stage === 'disputed' || (txn.isDisputed && txn.stage !== 'completed' && txn.stage !== 'refunded'));
    } else if (filterStatus === 'resolved') {
      filtered = filtered.filter(txn => txn.stage === 'completed' || txn.stage === 'refunded');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(txn => 
        txn.itemName.toLowerCase().includes(query) ||
        txn.id.toLowerCase().includes(query) ||
        (txn.disputeReason && txn.disputeReason.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'oldest':
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case 'amount-high':
          return b.totalAmount - a.totalAmount;
        case 'amount-low':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [disputedTransactions, filterStatus, searchQuery, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDisputes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDisputes = filteredAndSortedDisputes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortOption]);

  // Calculate stats
  const stats = {
    total: disputedTransactions.length,
    open: disputedTransactions.filter(txn => txn.stage === 'disputed' || (txn.isDisputed && txn.stage !== 'completed' && txn.stage !== 'refunded')).length,
    resolved: disputedTransactions.filter(txn => txn.stage === 'completed' || txn.stage === 'refunded').length,
  };

  const selectedTransaction = selectedDispute 
    ? transactions.find(txn => txn.id === selectedDispute)
    : null;

  return (
    <DashboardLayout
      activeMenu="Disputes"
      pageTitle="Disputes"
      pageDescription="Manage and resolve transaction disputes"
    >
      <div className="max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-red-700">Total Disputes</span>
              <Scale className="text-red-600" size={20} />
            </div>
            {stats.total > 0 ? (
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600 mt-1">No disputes yet - great job!</p>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-orange-700">Open</span>
              <Clock className="text-orange-600" size={20} />
            </div>
            {stats.open > 0 ? (
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.open}</p>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600 mt-1">No open disputes</p>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-green-700">Resolved</span>
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
            {stats.resolved > 0 ? (
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.resolved}</p>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600 mt-1">No resolved disputes yet</p>
              </>
            )}
          </div>
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by item name, transaction ID, or dispute reason..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as FilterStatus);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
              >
                <option value="all">All Disputes</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedDisputes.length)} of {filteredAndSortedDisputes.length} disputes
          </p>
        </div>

        {/* Disputes List */}
        {paginatedDisputes.length > 0 ? (
          <div className="space-y-4 mb-6">
            {paginatedDisputes.map((txn) => {
              const isOpen = txn.stage === 'disputed' || (txn.isDisputed && txn.stage !== 'completed' && txn.stage !== 'refunded');
              
              return (
                <div
                  key={txn.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isOpen ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        <Scale size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {txn.itemName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {format(txn.createdAt, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isOpen ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isOpen ? 'Open' : 'Resolved'}
                          </span>
                        </div>

                        {txn.disputeReason && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            <strong>Reason:</strong> {txn.disputeReason}
                          </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatAmount(txn.totalAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Evidence</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {txn.evidence.length} file{txn.evidence.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Messages</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {txn.chatMessages.length} message{txn.chatMessages.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/app/transactions/${txn.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Eye size={16} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Scale className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Disputes Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'You don\'t have any disputes at the moment'}
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
      </div>
    </DashboardLayout>
  );
}
