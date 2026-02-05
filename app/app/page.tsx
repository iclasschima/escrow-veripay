'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TrustLinkGenerator from '@/components/TrustLinkGenerator';

export default function CreateLinkPage() {
  return (
    <DashboardLayout
      activeMenu="Create Transaction"
      pageTitle="Create Payment Link"
      pageDescription="Generate a secure payment link to share with your buyers"
    >
      <div className="max-w-6xl">
        <TrustLinkGenerator />
      </div>
    </DashboardLayout>
  );
}
