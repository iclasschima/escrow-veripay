/**
 * API Configuration and Utilities
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateLinkRequest {
  itemName: string;
  amount: number;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  feeSplit?: 'buyer' | 'seller' | 'split';
}

export interface CreateLinkResponse {
  success: boolean;
  data: {
    trackingId: string;
    trackingUrl: string;
    transactionId: string;
    amount: number;
    itemName: string;
  };
  error?: string;
}

/**
 * Create a payment link via the backend API
 */
export async function createPaymentLink(
  data: CreateLinkRequest
): Promise<CreateLinkResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/links/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: result.data || {} as any,
        error: result.error || 'Failed to create payment link',
      };
    }

    return result;
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    return {
      success: false,
      data: {} as any,
      error: error.message || 'Network error. Please check your connection.',
    };
  }
}

/**
 * Get transaction status by tracking ID
 */
export async function getTransactionStatus(trackingId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tracking/${trackingId}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

/**
 * Initialize Paystack payment
 */
export interface InitializePaymentRequest {
  trackingId: string;
  email: string;
  phone?: string;
  amount: number;
}

export interface InitializePaymentResponse {
  success: boolean;
  data: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
    publicKey: string;
  };
  error?: string;
}

export async function initializePayment(
  data: InitializePaymentRequest
): Promise<InitializePaymentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: result.data || {} as any,
        error: result.error || 'Failed to initialize payment',
      };
    }

    return result;
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    return {
      success: false,
      data: {} as any,
      error: error.message || 'Network error. Please check your connection.',
    };
  }
}

/**
 * Verify Paystack payment
 */
export async function verifyPayment(reference: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/verify/${reference}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Update transaction status
 */
export interface UpdateTransactionStatusRequest {
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'RELEASED' | 'DISPUTED';
  waybillNumber?: string;
  notes?: string;
}

export async function updateTransactionStatus(
  trackingId: string,
  data: UpdateTransactionStatusRequest
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${trackingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update transaction status');
    }

    return result;
  } catch (error: any) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}

/**
 * Release funds (seller action)
 */
export async function releaseFunds(trackingId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${trackingId}/release`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to release funds');
    }

    return result;
  } catch (error: any) {
    console.error('Error releasing funds:', error);
    throw error;
  }
}

/**
 * Create buyer-initiated payment intent
 */
export interface CreateIntentRequest {
  itemName: string;
  amount: number;
  buyerPhone: string;
  sellerPhone?: string;
  feeSplit?: 'buyer' | 'seller' | 'split';
}

export interface CreateIntentResponse {
  success: boolean;
  data: {
    trackingId: string;
    dealUrl: string;
    transactionId: string;
    amount: number;
    itemName: string;
    buyerPhone: string;
    sellerPhone?: string;
  };
  error?: string;
}

export async function createBuyerIntent(
  data: CreateIntentRequest
): Promise<CreateIntentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/links/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        data: result.data || {} as any,
        error: result.error || 'Failed to create buyer intent',
      };
    }

    return result;
  } catch (error: any) {
    console.error('Error creating buyer intent:', error);
    return {
      success: false,
      data: {} as any,
      error: error.message || 'Network error. Please check your connection.',
    };
  }
}

/**
 * Get deal details for seller acceptance
 */
export async function getDealDetails(trackingId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/deals/${trackingId}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error fetching deal:', error);
    throw error;
  }
}

/**
 * Accept deal (seller action)
 */
export interface AcceptDealRequest {
  sellerPhone: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

export async function acceptDeal(
  trackingId: string,
  data: AcceptDealRequest
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/deals/${trackingId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to accept deal');
    }

    return result;
  } catch (error: any) {
    console.error('Error accepting deal:', error);
    throw error;
  }
}

/**
 * Get list of banks (for bank selection)
 */
export async function getBanks() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/paystack/banks`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch banks');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error fetching banks:', error);
    throw error;
  }
}
