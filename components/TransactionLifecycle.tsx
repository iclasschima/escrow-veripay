'use client';

import { Transaction, TransactionStage } from '@/types';
import { CheckCircle2, Circle, Package, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionLifecycleProps {
  transaction: Transaction;
}

const stageConfig: Record<TransactionStage, { label: string; icon: any; color: string }> = {
  awaiting_payment: {
    label: 'Awaiting Payment',
    icon: Clock,
    color: 'text-orange-600',
  },
  funds_secured: {
    label: 'Funds Secured',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  in_transit: {
    label: 'In Transit',
    icon: Package,
    color: 'text-blue-600',
  },
  inspection: {
    label: 'Inspection',
    icon: Clock,
    color: 'text-yellow-600',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  refunded: {
    label: 'Refunded',
    icon: AlertCircle,
    color: 'text-red-600',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertCircle,
    color: 'text-orange-600',
  },
};

const stageOrder: TransactionStage[] = [
  'awaiting_payment',
  'funds_secured',
  'in_transit',
  'inspection',
  'completed',
];

export default function TransactionLifecycle({ transaction }: TransactionLifecycleProps) {
  const currentStageIndex = stageOrder.indexOf(transaction.stage);
  const isDisputed = transaction.isDisputed || transaction.stage === 'disputed';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Transaction Status
      </h3>

      <div className="space-y-4">
        {stageOrder.map((stage, index) => {
          const config = stageConfig[stage];
          const Icon = config.icon;
          const isActive = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div key={stage} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                    }`}
                >
                  <Icon size={20} />
                </div>
                {index < stageOrder.length - 1 && (
                  <div
                    className={`w-0.5 h-16 ${isActive ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                  />
                )}
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}
                  >
                    {config.label}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {getStageDescription(stage, transaction)}
                </p>
                {isCurrent && transaction.inspectionDeadline && stage === 'inspection' && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Auto-release in:{' '}
                    {formatDistanceToNow(transaction.inspectionDeadline, {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {isDisputed && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-orange-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium text-orange-900">Transaction Disputed</h4>
                <p className="text-sm text-orange-700 mt-1">
                  {transaction.disputeReason || 'Dispute raised. Evidence under review.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStageDescription(stage: TransactionStage, transaction: Transaction): string {
  switch (stage) {
    case 'awaiting_payment':
      return 'Payment is pending. Buyer needs to complete payment to proceed.';
    case 'funds_secured':
      return 'Payment received and secured. Safe for seller to ship.';
    case 'in_transit':
      return transaction.waybillNumber
        ? `Shipped with tracking: ${transaction.waybillNumber}`
        : 'Seller has marked item as shipped.';
    case 'inspection':
      return `Buyer has ${transaction.inspectionPeriodHours} hours to inspect and accept.`;
    case 'completed':
      return 'Transaction completed successfully. Funds released to seller.';
    default:
      return '';
  }
}
