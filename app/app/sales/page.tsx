'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTransactionStore } from '@/store/transactionStore';
import { format } from 'date-fns';
import { formatAmount } from '@/utils/format';
import { 
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown,
  Truck,
  Shield,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Link as LinkIcon,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { TransactionStage, TrustLink } from '@/types';

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'name-asc' | 'name-desc';
type FilterType = 'all' | 'payment-links' | 'awaiting-shipping' | 'funds-locked' | 'in-transit' | 'inspection' | 'completed' | 'refunded' | 'disputed';

const ITEMS_PER_PAGE = 10;

const stageLabels: Record<TransactionStage, string> = {
  funds_secured: 'Awaiting Shipping',
  in_transit: 'In Transit',
  inspection: 'In Inspection',
  completed: 'Completed',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

const stageColors: Record<TransactionStage, string> = {
  funds_secured: 'bg-red-100 text-red-700',
  in_transit: 'bg-blue-100 text-blue-700',
  inspection: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  refunded: 'bg-gray-100 text-gray-700',
  disputed: 'bg-orange-100 text-orange-700',
};

const stageIcons: Record<TransactionStage, any> = {
  funds_secured: Shield,
  in_transit: Truck,
  inspection: Clock,
  completed: CheckCircle2,
  refunded: AlertCircle,
  disputed: AlertCircle,
};

type UnifiedItem = 
  | { type: 'payment-link'; data: TrustLink }
  | { type: 'transaction'; data: any };

export default function SalesPage() {
  const transactions = useTransactionStore((state) => state.transactions);
  const trustLinks = useTransactionStore((state) => state.trustLinks);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const handleCopy = async (linkId: string) => {
    const fullLink = typeof window !== 'undefined' 
      ? `${window.location.origin}/pay/${linkId}`
      : `/pay/${linkId}`;
    await navigator.clipboard.writeText(fullLink);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleShare = (linkId: string, platform: 'whatsapp' | 'instagram') => {
    const fullLink = typeof window !== 'undefined' 
      ? `${window.location.origin}/pay/${linkId}`
      : `/pay/${linkId}`;
    const message = encodeURIComponent(
      `Check out this secure payment link: ${fullLink}`
    );

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } else if (platform === 'instagram') {
      window.open(`https://www.instagram.com/direct/inbox/`, '_blank');
    }
  };

  // Combine payment links and transactions into unified items
  const unifiedItems = useMemo(() => {
    const items: UnifiedItem[] = [];

    // Add active payment links
    trustLinks
      .filter(link => !link.used)
      .forEach(link => {
        items.push({ type: 'payment-link', data: link });
      });

    // Add transactions
    transactions.forEach(txn => {
      items.push({ type: 'transaction', data: txn });
    });

    return items;
  }, [trustLinks, transactions]);

  // Filter and sort unified items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...unifiedItems];

    // Filter by type/stage
    if (filterType === 'payment-links') {
      filtered = filtered.filter(item => item.type === 'payment-link');
    } else if (filterType === 'awaiting-shipping') {
      filtered = filtered.filter(item => 
        item.type === 'transaction' && 
        item.data.stage === 'funds_secured' && 
        !item.data.waybillNumber
      );
    } else if (filterType === 'funds-locked') {
      filtered = filtered.filter(item => 
        item.type === 'transaction' && 
        ['funds_secured', 'in_transit', 'inspection'].includes(item.data.stage)
      );
    } else if (filterType !== 'all') {
      const stageMap: Record<string, TransactionStage> = {
        'in-transit': 'in_transit',
        'inspection': 'inspection',
        'completed': 'completed',
        'refunded': 'refunded',
        'disputed': 'disputed',
      };
      if (stageMap[filterType]) {
        filtered = filtered.filter(item => 
          item.type === 'transaction' && 
          item.data.stage === stageMap[filterType]
        );
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (item.type === 'payment-link') {
          return item.data.itemName.toLowerCase().includes(query) ||
                 item.data.id.toLowerCase().includes(query);
        } else {
          return item.data.itemName.toLowerCase().includes(query) ||
                 item.data.id.toLowerCase().includes(query) ||
                 (item.data.waybillNumber && item.data.waybillNumber.toLowerCase().includes(query));
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const getDate = (item: UnifiedItem) => 
        item.type === 'payment-link' ? item.data.createdAt : item.data.createdAt;
      const getName = (item: UnifiedItem) => item.data.itemName;
      const getAmount = (item: UnifiedItem) => {
        if (item.type === 'payment-link') {
          const total = item.data.price + item.data.shippingCost;
          const fee = total * 0.03;
          return item.data.feeSplit === 'buyer' 
            ? total + fee 
            : item.data.feeSplit === 'seller' 
            ? total 
            : total + fee / 2;
        }
        return item.data.totalAmount;
      };

      switch (sortOption) {
        case 'newest':
          return getDate(b).getTime() - getDate(a).getTime();
        case 'oldest':
          return getDate(a).getTime() - getDate(b).getTime();
        case 'amount-high':
          return getAmount(b) - getAmount(a);
        case 'amount-low':
          return getAmount(a) - getAmount(b);
        case 'name-asc':
          return getName(a).localeCompare(getName(b));
        case 'name-desc':
          return getName(b).localeCompare(getName(a));
        default:
          return 0;
      }
    });

    return filtered;
  }, [unifiedItems, filterType, searchQuery, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredAndSortedItems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery, sortOption]);

  // Calculate stats
  const activeLinks = trustLinks.filter(link => !link.used);
  const stats = {
    paymentLinks: activeLinks.length,
    awaitingShipping: transactions.filter(txn => txn.stage === 'funds_secured' && !txn.waybillNumber).length,
    fundsLocked: transactions.filter(txn => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage)).length,
    completed: transactions.filter(txn => txn.stage === 'completed').length,
  };

  const securedBalance = transactions
    .filter((txn) => ['funds_secured', 'in_transit', 'inspection'].includes(txn.stage))
    .reduce((sum, txn) => sum + txn.totalAmount, 0);


  const renderItem = (item: UnifiedItem) => {
    if (item.type === 'payment-link') {
      const link = item.data;
      const fullLink = typeof window !== 'undefined' 
        ? `${window.location.origin}/pay/${link.id}`
        : `/pay/${link.id}`;
      const totalAmount = link.price + link.shippingCost;
      const feeAmount = totalAmount * 0.03;
      const finalAmount =
        link.feeSplit === 'buyer'
          ? totalAmount + feeAmount
          : link.feeSplit === 'seller'
          ? totalAmount
          : totalAmount + feeAmount / 2;

      return (
        <div
          key={`link-${link.id}`}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="text-purple-600" size={18} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {link.itemName}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Created {format(link.createdAt, 'MMM dd, yyyy')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Payment Link
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(link.price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Shipping</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(link.shippingCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(finalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Inspection</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {link.inspectionPeriodHours}h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={fullLink}
                  readOnly
                  className="flex-1 bg-transparent border-none text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(link.id)}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {copiedLinkId === link.id ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <Link
                href={`/pay/${link.id}`}
                target="_blank"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Eye size={16} />
                View
              </Link>
              <button
                onClick={() => handleShare(link.id, 'whatsapp')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Share2 size={16} />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare(link.id, 'instagram')}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Share2 size={16} />
                Instagram
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      const txn = item.data;
      const Icon = stageIcons[txn.stage];
      const colorClass = stageColors[txn.stage];
      const label = stageLabels[txn.stage];

      return (
        <Link
          key={`txn-${txn.id}`}
          href={`/app/transactions/${txn.id}`}
          className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon size={24} />
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                    {label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatAmount(txn.totalAmount)}
                    </p>
                  </div>
                  {txn.waybillNumber && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Waybill</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {txn.waybillNumber}
                      </p>
                    </div>
                  )}
                  {txn.inspectionDeadline && txn.stage === 'inspection' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Inspection Deadline</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(txn.inspectionDeadline, 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  )}
                  {txn.isDisputed && (
                    <div>
                      <p className="text-xs text-red-600 mb-1">Status</p>
                      <p className="text-sm font-semibold text-red-600">
                        Disputed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <ArrowRight className="text-gray-400" size={24} />
            </div>
          </div>
        </Link>
      );
    }
  };

  return (
    <DashboardLayout
      activeMenu="Selling"
      pageTitle="My Sales"
      pageDescription="Manage your payment links and sales transactions"
    >
      <div className="max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-purple-700">Payment Links</span>
              <LinkIcon className="text-purple-600" size={20} />
            </div>
            {stats.paymentLinks > 0 ? (
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paymentLinks}</p>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600 mt-1">Create your first payment link to start selling safely</p>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-purple-700">Secured Balance</span>
              <Shield className="text-purple-600" size={20} />
            </div>
            {securedBalance > 0 ? (
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatAmount(securedBalance, false)}
              </p>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatAmount(0, false)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Create your first payment link to start selling safely</p>
              </>
            )}
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-red-700">Awaiting Shipping</span>
              <Package className="text-red-600" size={20} />
            </div>
            {stats.awaitingShipping > 0 ? (
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.awaitingShipping}</p>
            ) : (
              <>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-600 mt-1">No items awaiting shipment</p>
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
                  placeholder="Search by item name, link ID, transaction ID, or waybill..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            {/* Filter */}
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
                <option value="all">All Items</option>
                <option value="payment-links">Payment Links</option>
                <option value="awaiting-shipping">Awaiting Shipping</option>
                <option value="funds-locked">Funds Locked</option>
                <option value="in-transit">In Transit</option>
                <option value="inspection">In Inspection</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="disputed">Disputed</option>
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
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
          </p>
        </div>

        {/* Items List */}
        {paginatedItems.length > 0 ? (
          <div className="space-y-4 mb-6">
            {paginatedItems.map(renderItem)}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Items Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first payment link to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Create Payment Link
              </Link>
            )}
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
