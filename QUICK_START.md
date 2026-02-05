# Quick Start Guide

## Running the Application

1. **Start the development server:**
   ```bash
   cd /Users/apple/Documents/escrow-service
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

## Testing the Flow

### 1. Create a Trust Link
- Go to the home page
- Fill in the Trust Link form:
  - Item name (e.g., "iPhone 15 Pro")
  - Price (e.g., 1000)
  - Shipping cost (e.g., 50)
  - Inspection period (e.g., 48 hours)
  - Select fee split option
- Click "Generate Trust Link"
- Copy or share the link

### 2. Use the Trust Link
- Open the generated trust link in a new tab/browser
- Complete KYC verification:
  - For amounts < $50: Phone OTP verification
  - For amounts ≥ $50: Phone + National ID verification
- Enter phone number
- Click "Proceed to Payment"

### 3. View Transaction
- After creating a transaction, you'll be redirected to the transaction detail page
- Switch between "Buyer" and "Seller" views using the dropdown
- Track the transaction lifecycle stages

### 4. Seller Actions
- When viewing as "Seller":
  - Mark item as shipped (add waybill number)
  - Upload proof of delivery

### 5. Buyer Actions
- When viewing as "Buyer":
  - Accept or reject the item during inspection period
  - Raise a dispute if needed
  - Upload evidence photos
  - Use the chat feature

### 6. Dispute System
- Click "Raise Dispute" button
- Enter dispute reason
- Upload evidence photos
- Use the chat to communicate

## Key Features to Test

✅ Trust Link generation with social sharing
✅ Tiered KYC verification (Level 1 & 2)
✅ Transaction lifecycle state machine
✅ Inspection timer with auto-release
✅ Shipping tracking with waybill
✅ Dispute system with evidence upload
✅ In-app chat functionality
✅ Dynamic fee split options

## Notes

- All data is stored in browser state (Zustand store)
- For production, you'll need to:
  - Integrate with a payment gateway
  - Set up backend API
  - Integrate with KYC providers (Smile ID/Identifii)
  - Add image storage service
  - Implement authentication
  - Add database persistence
