'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import UsersContent from '@/features/dashboard/components/UsersContent/UsersContent';
import styles from '@/styles/Users.module.css';

export default function UsersPage() {
  return (
    <div className={styles.container}>
      <DashboardLayout>
        <UsersContent />
      </DashboardLayout>
    </div>
  );
}
