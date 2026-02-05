'use client';

import { useTransactionStore } from '@/store/transactionStore';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatAmount } from '@/utils/format';
import { ArrowRight, Package, CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { TransactionStage } from '@/types';

const stageIcons: Record<TransactionStage, any> = {
  awaiting_payment: CreditCard,
  funds_secured: CheckCircle2,
  in_transit: Package,
  inspection: Clock,
  completed: CheckCircle2,
  refunded: AlertCircle,
  disputed: AlertCircle,
};

const stageColors: Record<TransactionStage, string> = {
  awaiting_payment: 'text-purple-600 bg-purple-50',
  funds_secured: 'text-green-600 bg-green-50',
  in_transit: 'text-blue-600 bg-blue-50',
  inspection: 'text-yellow-600 bg-yellow-50',
  completed: 'text-green-600 bg-green-50',
  refunded: 'text-red-600 bg-red-50',
  disputed: 'text-orange-600 bg-orange-50',
};

export default function TransactionsPage() {
  const transactions = useTransactionStore((state) => state.transactions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              </Link>
            </div>
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Create Trust Link
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            All Transactions
          </h2>
          <p className="text-gray-600">
            View and manage all your transactions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {transactions.map((txn) => {
              const Icon = stageIcons[txn.stage];
              const colorClass = stageColors[txn.stage];

              return (
                <Link
                  key={txn.id}
                  href={`/app/transactions/${txn.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {txn.itemName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatAmount(txn.totalAmount)} •{' '}
                          {format(txn.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
                      >
                        {txn.stage.replace('_', ' ').toUpperCase()}
                      </span>
                      {txn.isDisputed && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-600">
                          DISPUTED
                        </span>
                      )}
                      <ArrowRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No transactions yet. Create a trust link to get started.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
