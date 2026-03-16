'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import UserProfile from '@/features/user/components/UserProfile/UserProfile';

export default function UserPage() {
  return (
    <DashboardLayout>
      <UserProfile />
    </DashboardLayout>
  );
}
