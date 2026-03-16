'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import MainDashboard from '@/features/dashboard/components/MainDashboard/MainDashboard';

export default function Home() {
  return (
    <DashboardLayout>
      <MainDashboard />
    </DashboardLayout>
  );
}
