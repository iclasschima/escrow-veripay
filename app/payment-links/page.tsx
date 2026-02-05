'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useTransactionStore } from '@/store/transactionStore';
import { format } from 'date-fns';
import { formatAmount } from '@/utils/format';
import { 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import Link from 'next/link';

type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'name-asc' | 'name-desc';
type FilterStatus = 'all' | 'active' | 'used';

const ITEMS_PER_PAGE = 10;

export default function PaymentLinksPage() {
  const trustLinks = useTransactionStore((state) => state.trustLinks);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
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

  // Filter and sort links
  const filteredAndSortedLinks = useMemo(() => {
    let filtered = [...trustLinks];

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(link => !link.used);
    } else if (filterStatus === 'used') {
      filtered = filtered.filter(link => link.used);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(link => 
        link.itemName.toLowerCase().includes(query) ||
        link.id.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'amount-high': {
          const aTotal = a.price + a.shippingCost;
          const bTotal = b.price + b.shippingCost;
          return bTotal - aTotal;
        }
        case 'amount-low': {
          const aTotal = a.price + a.shippingCost;
          const bTotal = b.price + b.shippingCost;
          return aTotal - bTotal;
        }
        case 'name-asc':
          return a.itemName.localeCompare(b.itemName);
        case 'name-desc':
          return b.itemName.localeCompare(a.itemName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [trustLinks, filterStatus, searchQuery, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLinks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLinks = filteredAndSortedLinks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortOption]);

  const activeLinks = trustLinks.filter(link => !link.used);
  const usedLinks = trustLinks.filter(link => link.used);

  const renderLinkCard = (link: typeof trustLinks[0]) => {
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
        key={link.id}
        className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow ${
          link.used ? 'opacity-75' : ''
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {link.itemName}
                </h3>
                <p className="text-sm text-gray-600">
                  Created {format(link.createdAt, 'MMM dd, yyyy')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                link.used 
                  ? 'bg-gray-100 text-gray-600' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {link.used ? 'Used' : 'Active'}
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

            {!link.used && (
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
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            {!link.used ? (
              <>
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
              </>
            ) : (
              link.transactionId && (
                <Link
                  href={`/app/transactions/${link.transactionId}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  View Transaction
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      activeMenu="Payment Links"
      pageTitle="My Payment Links"
      pageDescription="Manage and share your payment links"
    >
      <div className="max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Total Links</span>
              <LinkIcon className="text-purple-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{trustLinks.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Active</span>
              <CheckCircle2 className="text-green-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeLinks.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Used</span>
              <Clock className="text-gray-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{usedLinks.length}</p>
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
                  placeholder="Search by item name or link ID..."
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
                <option value="all">All Links</option>
                <option value="active">Active Only</option>
                <option value="used">Used Only</option>
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
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedLinks.length)} of {filteredAndSortedLinks.length} links
          </p>
        </div>

        {/* Links List */}
        {paginatedLinks.length > 0 ? (
          <div className="space-y-4 mb-6">
            {paginatedLinks.map(renderLinkCard)}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <LinkIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Links Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first payment link to get started'}
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

        {/* Empty State - No links at all */}
        {trustLinks.length === 0 && !searchQuery && filterStatus === 'all' && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <LinkIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Payment Links Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first payment link to start accepting secure payments
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Create Payment Link
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
