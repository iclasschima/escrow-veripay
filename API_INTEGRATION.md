# API Integration Guide

## Backend Connection

The frontend is now connected to the backend API for transaction creation.

### Configuration

1. **Environment Variable**: Set `NEXT_PUBLIC_API_URL` in your `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

2. **Default**: If not set, it defaults to `http://localhost:3001`

### API Endpoint

**POST** `/api/links/create`

**Request Body:**
```json
{
  "itemName": "iPhone 15 Pro",
  "amount": 500000,
  "phone": "+2348012345678",
  "email": "seller@example.com",  // Optional
  "firstName": "John",            // Optional
  "lastName": "Doe"                // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trackingId": "uuid-here",
    "trackingUrl": "http://localhost:3000/t/uuid-here",
    "transactionId": "transaction-id",
    "amount": 500000,
    "itemName": "iPhone 15 Pro"
  }
}
```

### Implementation Details

- The `QuickLinkGenerator` component now calls the backend API
- Creates a "Ghost User" if the user doesn't exist
- Returns a tracking ID that can be used for payment links
- Error handling is implemented with user-friendly messages

### Running the Backend

Make sure the backend server is running:

```bash
cd /Users/apple/Documents/escrow-backend
npm install
npm run dev
```

The backend should be running on `http://localhost:3001`

### Testing

1. Start the backend server
2. Start the frontend server (`npm run dev`)
3. Fill out the form on the landing page
4. Click "Generate Secure Link"
5. The link should be created via the backend API
