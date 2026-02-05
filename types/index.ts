export type TransactionStage = 
  | 'awaiting_payment'
  | 'funds_secured' 
  | 'in_transit' 
  | 'inspection' 
  | 'completed' 
  | 'refunded' 
  | 'disputed';

export type KYCLevel = 'none' | 'level1' | 'level2';

export type FeeSplitOption = 'buyer' | 'seller' | 'split';
export type LinkStatus = 'active' | 'draft' | 'unclaimed' | 'used';

export interface TrustLink {
  id: string;
  itemName: string;
  description?: string;
  imageUrl?: string;
  price: number;
  shippingCost: number;
  inspectionPeriodHours: number;
  feeSplit: FeeSplitOption;
  createdAt: Date;
  expiresAt?: Date;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerRating?: number;
  sellerVerified?: boolean;
  sellerTrustScore?: number;
  sellerCompletedTransactions?: number;
  used: boolean;
  transactionId?: string;
  status?: LinkStatus; // For frictionless funnel: draft/unclaimed links
}

export interface Transaction {
  id: string;
  trustLinkId: string;
  itemName: string;
  price: number;
  shippingCost: number;
  totalAmount: number;
  feeAmount: number;
  feeSplit: FeeSplitOption;
  stage: TransactionStage;
  inspectionPeriodHours: number;
  inspectionDeadline?: Date;
  buyerKYCLevel: KYCLevel;
  sellerKYCLevel: KYCLevel;
  buyerPhone?: string;
  sellerPhone?: string;
  waybillNumber?: string;
  proofOfDelivery?: string;
  createdAt: Date;
  updatedAt: Date;
  isDisputed: boolean;
  disputeReason?: string;
  evidence: string[];
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

export interface KYCData {
  level: KYCLevel;
  phoneVerified?: boolean;
  nationalIdVerified?: boolean;
  nationalIdType?: 'NIN' | 'GhanaCard' | 'KRAPin';
  nationalIdNumber?: string;
}
