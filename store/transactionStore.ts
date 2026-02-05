import { create } from 'zustand';
import { Transaction, TrustLink, TransactionStage, ChatMessage } from '@/types';

// Helper function to create dates relative to now
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const hoursFromNow = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

// Dummy data
const createDummyData = () => {
  const dummyTrustLinks: TrustLink[] = [
    {
      id: 'link_1',
      itemName: 'iPhone 15 Pro Max',
      description: 'Brand new iPhone 15 Pro Max 256GB in Natural Titanium. Factory sealed with original accessories. Includes 1 year warranty.',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
      price: 1800000,
      shippingCost: 5000,
      inspectionPeriodHours: 48,
      feeSplit: 'split',
      createdAt: daysAgo(5),
      sellerName: 'Tiwa Adebayo',
      sellerPhone: '+2348098765432',
      sellerEmail: 'tiwa@example.com',
      sellerRating: 4.8,
      sellerVerified: true,
      sellerTrustScore: 92,
      sellerCompletedTransactions: 147,
      used: true,
      transactionId: 'txn_1',
    },
    {
      id: 'link_2',
      itemName: 'MacBook Pro M3',
      description: 'MacBook Pro 14-inch with M3 chip, 16GB RAM, 512GB SSD. Excellent condition, barely used. Comes with original box and charger.',
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop',
      price: 3750000,
      shippingCost: 10000,
      inspectionPeriodHours: 72,
      feeSplit: 'buyer',
      createdAt: daysAgo(3),
      sellerName: 'Tiwa Adebayo',
      sellerPhone: '+2348098765432',
      sellerEmail: 'tiwa@example.com',
      sellerRating: 4.8,
      sellerVerified: true,
      sellerTrustScore: 92,
      sellerCompletedTransactions: 147,
      used: true,
      transactionId: 'txn_2',
    },
    {
      id: 'link_3',
      itemName: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-cancelling wireless headphones. Like new condition with original packaging. Perfect for travel and daily use.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      price: 525000,
      shippingCost: 3000,
      inspectionPeriodHours: 24,
      feeSplit: 'seller',
      createdAt: daysAgo(1),
      sellerName: 'Tiwa Adebayo',
      sellerPhone: '+2348098765432',
      sellerEmail: 'tiwa@example.com',
      sellerRating: 4.8,
      sellerVerified: true,
      sellerTrustScore: 92,
      sellerCompletedTransactions: 147,
      used: false,
    },
  ];

  const dummyTransactions: Transaction[] = [
    // Shipping tasks - funds_secured without waybill
    {
      id: 'txn_1',
      trustLinkId: 'link_1',
      itemName: 'iPhone 15 Pro Max',
      price: 1800000,
      shippingCost: 5000,
      totalAmount: 1850000,
      feeAmount: 55500,
      feeSplit: 'split',
      stage: 'funds_secured',
      inspectionPeriodHours: 48,
      inspectionDeadline: hoursFromNow(48),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level2',
      buyerPhone: '+2348012345678',
      sellerPhone: '+2348098765432',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    {
      id: 'txn_4',
      trustLinkId: 'link_4',
      itemName: 'Nike Air Max 270',
      price: 225000,
      shippingCost: 2000,
      totalAmount: 227000,
      feeAmount: 6810,
      feeSplit: 'buyer',
      stage: 'funds_secured',
      inspectionPeriodHours: 24,
      inspectionDeadline: hoursFromNow(24),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level1',
      buyerPhone: '+2348023456789',
      sellerPhone: '+2348034567890',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    // In transit - has waybill
    {
      id: 'txn_2',
      trustLinkId: 'link_2',
      itemName: 'MacBook Pro M3',
      price: 3750000,
      shippingCost: 10000,
      totalAmount: 3850000,
      feeAmount: 115500,
      feeSplit: 'buyer',
      stage: 'in_transit',
      inspectionPeriodHours: 72,
      inspectionDeadline: hoursFromNow(72),
      buyerKYCLevel: 'level2',
      sellerKYCLevel: 'level2',
      buyerPhone: '+2348045678901',
      sellerPhone: '+2348056789012',
      waybillNumber: 'DHL123456789',
      proofOfDelivery: undefined,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    // Inspection stage
    {
      id: 'txn_5',
      trustLinkId: 'link_5',
      itemName: 'Samsung Galaxy S24 Ultra',
      price: 1650000,
      shippingCost: 5000,
      totalAmount: 1700000,
      feeAmount: 51000,
      feeSplit: 'split',
      stage: 'inspection',
      inspectionPeriodHours: 48,
      inspectionDeadline: hoursFromNow(12),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level1',
      buyerPhone: '+2348067890123',
      sellerPhone: '+2348078901234',
      waybillNumber: 'FEDEX987654321',
      proofOfDelivery: 'delivered.jpg',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    // Completed transactions - for payout wallet
    {
      id: 'txn_3',
      trustLinkId: 'link_3',
      itemName: 'AirPods Pro 2',
      price: 375000,
      shippingCost: 2000,
      totalAmount: 377000,
      feeAmount: 11310,
      feeSplit: 'seller',
      stage: 'completed',
      inspectionPeriodHours: 24,
      inspectionDeadline: daysAgo(10),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level1',
      buyerPhone: '+2348089012345',
      sellerPhone: '+2348090123456',
      waybillNumber: 'UPS456789123',
      proofOfDelivery: 'delivered_1.jpg',
      createdAt: daysAgo(12),
      updatedAt: daysAgo(10),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    {
      id: 'txn_6',
      trustLinkId: 'link_6',
      itemName: 'Canon EOS R5 Camera',
      price: 5700000,
      shippingCost: 15000,
      totalAmount: 5820000,
      feeAmount: 174600,
      feeSplit: 'buyer',
      stage: 'completed',
      inspectionPeriodHours: 72,
      inspectionDeadline: daysAgo(15),
      buyerKYCLevel: 'level2',
      sellerKYCLevel: 'level2',
      buyerPhone: '+2348012345678',
      sellerPhone: '+2348023456789',
      waybillNumber: 'DHL789123456',
      proofOfDelivery: 'delivered_2.jpg',
      createdAt: daysAgo(18),
      updatedAt: daysAgo(15),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    {
      id: 'txn_7',
      trustLinkId: 'link_7',
      itemName: 'PlayStation 5 Console',
      price: 750000,
      shippingCost: 4000,
      totalAmount: 754000,
      feeAmount: 22620,
      feeSplit: 'split',
      stage: 'completed',
      inspectionPeriodHours: 48,
      inspectionDeadline: daysAgo(8),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level1',
      buyerPhone: '+2348034567890',
      sellerPhone: '+2348045678901',
      waybillNumber: 'FEDEX321654987',
      proofOfDelivery: 'delivered_3.jpg',
      createdAt: daysAgo(11),
      updatedAt: daysAgo(8),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    // Refunded transaction
    {
      id: 'txn_8',
      trustLinkId: 'link_8',
      itemName: 'Damaged Laptop',
      price: 1200000,
      shippingCost: 5000,
      totalAmount: 1205000,
      feeAmount: 36150,
      feeSplit: 'buyer',
      stage: 'refunded',
      inspectionPeriodHours: 48,
      inspectionDeadline: daysAgo(20),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level1',
      buyerPhone: '+2348056789012',
      sellerPhone: '+2348067890123',
      waybillNumber: 'UPS147258369',
      proofOfDelivery: 'delivered_4.jpg',
      createdAt: daysAgo(25),
      updatedAt: daysAgo(20),
      isDisputed: false,
      evidence: [],
      chatMessages: [],
    },
    // Disputed transactions
    {
      id: 'txn_9',
      trustLinkId: 'link_9',
      itemName: 'Samsung Galaxy S24 Ultra',
      price: 1200000,
      shippingCost: 5000,
      totalAmount: 1205000,
      feeAmount: 36150,
      feeSplit: 'buyer',
      stage: 'disputed',
      inspectionPeriodHours: 48,
      inspectionDeadline: hoursFromNow(12),
      buyerKYCLevel: 'level1',
      sellerKYCLevel: 'level2',
      buyerPhone: '+2348078901234',
      sellerPhone: '+2348089012345',
      waybillNumber: 'DHL987654321',
      proofOfDelivery: 'delivered_5.jpg',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
      isDisputed: true,
      disputeReason: 'Item received is different from description. Screen has scratches and battery health is only 65% instead of the advertised 95%.',
      evidence: ['evidence_1.jpg', 'evidence_2.jpg', 'evidence_3.jpg'],
      chatMessages: [
        {
          id: 'msg_1',
          sender: 'buyer',
          message: 'The phone I received has significant scratches and the battery is not as described.',
          timestamp: daysAgo(1),
        },
        {
          id: 'msg_2',
          sender: 'seller',
          message: 'I shipped the phone in perfect condition. The damage must have occurred during shipping.',
          timestamp: daysAgo(1),
        },
      ],
    },
    {
      id: 'txn_10',
      trustLinkId: 'link_10',
      itemName: 'Designer Handbag - Gucci',
      price: 850000,
      shippingCost: 3000,
      totalAmount: 853000,
      feeAmount: 25590,
      feeSplit: 'split',
      stage: 'disputed',
      inspectionPeriodHours: 24,
      inspectionDeadline: hoursFromNow(6),
      buyerKYCLevel: 'level2',
      sellerKYCLevel: 'level1',
      buyerPhone: '+2348090123456',
      sellerPhone: '+2348101234567',
      waybillNumber: 'FEDEX456789123',
      proofOfDelivery: 'delivered_6.jpg',
      createdAt: daysAgo(2),
      updatedAt: hoursFromNow(-18),
      isDisputed: true,
      disputeReason: 'Item appears to be counterfeit. Stitching quality and logo placement do not match authentic Gucci products.',
      evidence: ['evidence_4.jpg', 'evidence_5.jpg'],
      chatMessages: [
        {
          id: 'msg_3',
          sender: 'buyer',
          message: 'I believe this is a fake. The quality is not what I expected from Gucci.',
          timestamp: hoursFromNow(-18),
        },
      ],
    },
  ];

  return { trustLinks: dummyTrustLinks, transactions: dummyTransactions };
};

interface TransactionStore {
  trustLinks: TrustLink[];
  transactions: Transaction[];
  activeTransactionId: string | null;
  
  createTrustLink: (link: Omit<TrustLink, 'id' | 'createdAt' | 'used'>) => string;
  getTrustLink: (id: string) => TrustLink | undefined;
  useTrustLink: (id: string, transactionId: string) => void;
  
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  getTransaction: (id: string) => Transaction | undefined;
  updateTransactionStage: (id: string, stage: TransactionStage) => void;
  updateWaybill: (id: string, waybillNumber: string, proofOfDelivery?: string) => void;
  acceptTransaction: (id: string) => void;
  rejectTransaction: (id: string, reason: string) => void;
  disputeTransaction: (id: string, reason: string) => void;
  addEvidence: (id: string, evidenceUrl: string) => void;
  addChatMessage: (id: string, message: ChatMessage) => void;
  setActiveTransaction: (id: string | null) => void;
}

// Initialize with dummy data
const initialData = createDummyData();

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  trustLinks: initialData.trustLinks,
  transactions: initialData.transactions,
  activeTransactionId: null,

  createTrustLink: (linkData) => {
    const id = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLink: TrustLink = {
      ...linkData,
      id,
      createdAt: new Date(),
      used: false,
      status: linkData.status || 'active',
    };
    set((state) => ({
      trustLinks: [...state.trustLinks, newLink],
    }));
    return id;
  },

  getTrustLink: (id) => {
    return get().trustLinks.find((link) => link.id === id);
  },

  useTrustLink: (id, transactionId) => {
    set((state) => ({
      trustLinks: state.trustLinks.map((link) =>
        link.id === id ? { ...link, used: true, transactionId, status: 'used' } : link
      ),
    }));
  },

  updateTrustLinkPhone: (id, phone) => {
    set((state) => ({
      trustLinks: state.trustLinks.map((link) =>
        link.id === id ? { ...link, sellerPhone: phone, status: 'active' } : link
      ),
    }));
  },

  getUnclaimedLinksByPhone: (phone) => {
    return get().trustLinks.filter(
      (link) => link.sellerPhone === phone && (link.status === 'unclaimed' || link.status === 'draft')
    );
  },

  createTransaction: (transactionData) => {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inspectionDeadline = new Date();
    inspectionDeadline.setHours(
      inspectionDeadline.getHours() + transactionData.inspectionPeriodHours
    );
    
    const newTransaction: Transaction = {
      ...transactionData,
      id,
      stage: 'funds_secured',
      inspectionDeadline,
      isDisputed: false,
      evidence: [],
      chatMessages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      transactions: [...state.transactions, newTransaction],
    }));
    return id;
  },

  getTransaction: (id) => {
    return get().transactions.find((txn) => txn.id === id);
  },

  updateTransactionStage: (id, stage) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? { ...txn, stage, updatedAt: new Date() }
          : txn
      ),
    }));
  },

  updateWaybill: (id, waybillNumber, proofOfDelivery) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              waybillNumber,
              proofOfDelivery,
              stage: 'in_transit',
              updatedAt: new Date(),
            }
          : txn
      ),
    }));
  },

  acceptTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? { ...txn, stage: 'completed', updatedAt: new Date() }
          : txn
      ),
    }));
  },

  rejectTransaction: (id, reason) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? { ...txn, stage: 'refunded', updatedAt: new Date() }
          : txn
      ),
    }));
  },

  disputeTransaction: (id, reason) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              isDisputed: true,
              disputeReason: reason,
              updatedAt: new Date(),
            }
          : txn
      ),
    }));
  },

  addEvidence: (id, evidenceUrl) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              evidence: [...txn.evidence, evidenceUrl],
              updatedAt: new Date(),
            }
          : txn
      ),
    }));
  },

  addChatMessage: (id, message) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              chatMessages: [...txn.chatMessages, message],
              updatedAt: new Date(),
            }
          : txn
      ),
    }));
  },

  setActiveTransaction: (id) => {
    set({ activeTransactionId: id });
  },
}));
