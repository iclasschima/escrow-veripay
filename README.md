# Escrow Service - Secure Payment Protection Platform

A modern Next.js escrow service application designed for secure transactions with automated lifecycle management, tiered KYC verification, and dispute resolution.

## Features

### 1. Quick "Trust Link" Generator
- Create single-use payment links with customizable fields:
  - Item name
  - Price
  - Shipping cost
  - Inspection period (hours)
- One-tap sharing to WhatsApp and Instagram DM
- Dynamic fee split options (buyer pays, seller pays, or 50/50 split)

### 2. Automated Transaction Lifecycle (State Machine)
Clear visual representation of transaction stages:
- **Funds Secured**: Payment received and held safely
- **In Transit**: Seller has shipped with tracking
- **Inspection**: Buyer has goods, inspection period active
- **Completed**: Funds released to seller
- **Refunded**: Transaction cancelled, funds returned
- **Disputed**: Transaction frozen pending resolution

### 3. Tiered KYC (Identity Verification)
- **Level 1**: Phone number verification (OTP) for transactions under $50
- **Level 2**: National ID verification (NIN, Ghana Card, KRA Pin) for higher amounts
- Integration ready for Smile ID or Identifii

### 4. Milestone/Inspection Timer
- Automatic countdown timer during inspection period
- Auto-release mechanism: Funds automatically released if buyer doesn't reject within the set time period
- Proof of Delivery (POD) upload for sellers
- Waybill/tracking number support

### 5. Dispute System & Evidence Locker
- One-click dispute button to freeze transactions
- Evidence upload interface for photos (wrong item, damaged goods, etc.)
- In-app chat system for buyer-seller communication
- All evidence and chat logs stored for moderator review

### 6. Dynamic Fee Split
- Flexible fee payment options:
  - Buyer pays all fees
  - Seller pays all fees
  - Split 50/50 between buyer and seller
- Psychological feature for African market flexibility

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
escrow-service/
├── app/
│   ├── dashboard/          # Dashboard page
│   ├── transactions/       # Transaction list and detail pages
│   ├── trust-link/[id]/    # Trust link payment page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── TrustLinkGenerator.tsx      # Trust link creation form
│   ├── TransactionLifecycle.tsx    # Transaction stage visualization
│   ├── KYCVerification.tsx         # KYC verification forms
│   ├── InspectionTimer.tsx         # Inspection countdown and actions
│   ├── DisputeSystem.tsx           # Dispute and evidence management
│   └── ShippingTracker.tsx         # Shipping and tracking
├── store/
│   └── transactionStore.ts         # Zustand state management
└── types/
    └── index.ts                    # TypeScript type definitions
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Usage Flow

1. **Create Trust Link**: Vendor creates a trust link with item details, price, shipping, and inspection period
2. **Share Link**: Share the generated link via WhatsApp or Instagram DM
3. **Buyer Verification**: Buyer completes KYC verification based on transaction amount
4. **Payment**: Buyer makes payment, funds are secured
5. **Shipping**: Seller marks item as shipped with tracking number
6. **Inspection**: Buyer receives item and has inspection period to accept/reject
7. **Auto-Release**: If buyer doesn't reject within the period, funds auto-release
8. **Dispute (if needed)**: Either party can raise a dispute with evidence

## Key Components

### TrustLinkGenerator
Main component for creating payment links. Includes form validation, fee split selection, and social sharing.

### TransactionLifecycle
Visual state machine showing current transaction stage with clear indicators and descriptions.

### KYCVerification
Tiered verification system that adapts based on transaction amount. Handles OTP and National ID verification.

### InspectionTimer
Countdown timer with auto-release logic. Provides accept/reject buttons for buyers.

### DisputeSystem
Complete dispute management with evidence upload, chat interface, and transaction freezing.

### ShippingTracker
Allows sellers to add waybill numbers and proof of delivery documents.

## State Management

The application uses Zustand for state management. The `transactionStore` handles:
- Trust link creation and management
- Transaction lifecycle updates
- KYC data storage
- Evidence and chat message management
- Stage transitions

## Future Enhancements

- Integration with payment gateways (Paystack, Flutterwave)
- Real-time notifications
- Email/SMS notifications
- Admin dashboard for dispute moderation
- Analytics and reporting
- Multi-currency support
- API integration with Smile ID/Identifii for KYC
- Image storage service integration (Cloudinary, AWS S3)

## Design Philosophy

The UI follows a clean, modern design inspired by real estate platforms:
- Clean white backgrounds with subtle borders
- Dark gray accents for primary actions
- Clear visual hierarchy
- Responsive grid layouts
- Intuitive navigation

## License

Private project - All rights reserved
