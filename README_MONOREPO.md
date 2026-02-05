# VeriPay Monorepo Structure

This project is organized in a monorepo-style architecture to accommodate different sections of the application with shared branding, logic, and SEO.

## URL Structure

| URL Type | Example | Goal |
|----------|---------|------|
| **Landing** | `veripay.africa` | Convert visitors to users |
| **Payment** | `veripay.africa/pay/xyz` | Ease of payment for buyers |
| **Tracking** | `veripay.africa/t/unique-ref` | Quick assurance for buyers |
| **App** | `veripay.africa/app/wallet` | Full application features |

## Directory Structure

```
app/
├── landing/          # Landing pages (root)
│   └── page.tsx      # Main landing page
├── pay/              # Payment links (buyer-facing)
│   └── [id]/
│       └── page.tsx  # Payment page
├── t/                # Tracking pages (buyer-facing)
│   └── [id]/
│       └── page.tsx  # Tracking page
└── app/              # Application routes (authenticated)
    ├── dashboard/    # Dashboard
    ├── sales/        # My Sales
    ├── wallet/       # Wallet & Payouts
    ├── disputes/     # Disputes
    ├── transactions/ # Transaction management
    └── page.tsx      # Create Payment Link

components/           # Shared React components
store/                # Shared state management (Zustand)
types/                # Shared TypeScript types
utils/                # Shared utility functions
```

## Shared Resources

All sections share:
- **Branding**: Components, colors, fonts (Josefin Sans)
- **Logic**: Transaction store, types, utilities
- **SEO**: Metadata configuration in root layout
- **Styling**: Global CSS and Tailwind configuration

## Route Migration

- Old: `/trust-link/[id]` → New: `/pay/[id]`
- Old: `/dashboard` → New: `/app/dashboard`
- Old: `/sales` → New: `/app/sales`
- Old: `/wallet` → New: `/app/wallet`
- Old: `/disputes` → New: `/app/disputes`
- Old: `/transactions` → New: `/app/transactions`
