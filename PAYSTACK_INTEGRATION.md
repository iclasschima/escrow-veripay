# Paystack Payment Integration

## Overview

The escrow service now integrates with Paystack for payment processing and backend tracking for transaction management.

## Backend API Endpoints

### 1. Initialize Payment
**POST** `/api/payments/initialize`

Creates a Paystack payment session for a transaction.

**Request:**
```json
{
  "trackingId": "uuid-here",
  "email": "buyer@example.com",
  "phone": "+2348012345678",
  "amount": 500000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "access_code_here",
    "reference": "VERIPAY_transaction_id_timestamp",
    "publicKey": "pk_test_..."
  }
}
```

### 2. Verify Payment
**GET** `/api/payments/verify/:reference`

Verifies a Paystack payment after completion.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "amount": 500000,
    "reference": "VERIPAY_...",
    "transactionStatus": "PAID"
  }
}
```

### 3. Update Transaction Status
**PATCH** `/api/transactions/:trackingId/status`

Updates transaction status (shipping, delivery, etc.).

**Request:**
```json
{
  "status": "SHIPPED",
  "waybillNumber": "FEDEX123456789",
  "notes": "Optional notes"
}
```

**Valid Statuses:**
- `PENDING` - Initial state
- `PAID` - Payment received
- `SHIPPED` - Item shipped
- `DELIVERED` - Item delivered
- `RELEASED` - Funds released to seller
- `DISPUTED` - Transaction disputed

### 4. Release Funds
**PATCH** `/api/transactions/:trackingId/release`

Manually release funds (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Funds released successfully",
  "data": {
    "trackingId": "uuid-here",
    "status": "RELEASED",
    "amount": 500000
  }
}
```

## Frontend Integration

### Payment Flow

1. **User fills payment form** → Enters phone number and selects payment method
2. **Click "Secure My Funds Now"** → Calls `/api/payments/initialize`
3. **Paystack popup opens** → User completes payment
4. **Payment callback** → Verifies payment with `/api/payments/verify/:reference`
5. **Success** → Transaction marked as PAID, auto-release set to 48h

### Transaction Status Updates

- **Shipping**: Seller updates status to `SHIPPED` with waybill number
- **Delivery**: Status automatically updates to `DELIVERED` when item arrives
- **Inspection**: Buyer has 48 hours to accept/reject
- **Release**: Funds released after acceptance or auto-release

## Components Updated

1. **Payment Page** (`/app/pay/[id]/page.tsx`)
   - Integrated Paystack inline.js
   - Payment initialization and verification
   - Success/failure handling

2. **ShippingTracker** (`/components/ShippingTracker.tsx`)
   - Updates transaction status to `SHIPPED`
   - Saves waybill number to backend

3. **InspectionTimer** (`/components/InspectionTimer.tsx`)
   - Accept: Releases funds via backend API
   - Reject: Marks transaction as `DISPUTED`

4. **Tracking Page** (`/app/t/[id]/page.tsx`)
   - Fetches real-time status from backend
   - Displays current transaction state

## Environment Variables

**Backend** (`.env`):
```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Webhook Configuration

Configure Paystack webhook URL in Paystack Dashboard:
```
https://your-domain.com/api/paystack/webhook
```

The webhook handles:
- `charge.success` - Updates transaction to PAID
- `transfer.success` - Confirms withdrawal (optional)

## Testing

1. **Test Payment**:
   - Use Paystack test cards: `4084084084084081`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - PIN: Any 4 digits

2. **Test Webhook**:
   - Use Paystack webhook testing tool
   - Or use ngrok to expose local backend

## Transaction Lifecycle

```
PENDING → (Payment) → PAID → (Shipping) → SHIPPED → (Delivery) → DELIVERED → (Inspection) → RELEASED
                                                                                    ↓
                                                                              DISPUTED
```

## Notes

- All transaction updates are synced with backend
- Local store is maintained for backward compatibility
- Payment verification happens both client-side and via webhook
- Auto-release is set to 48 hours after payment
- Seller must be authenticated to release funds manually
