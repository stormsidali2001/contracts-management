'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import VendorContent from '@/features/vendor/components/vendorContent/vendorContent';

export default function VendorPage() {
  return (
    <DashboardLayout>
      <VendorContent />
    </DashboardLayout>
  );
}
