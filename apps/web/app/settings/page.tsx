'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import Settings from '@/features/settings/components/Settings/Settings';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
}
