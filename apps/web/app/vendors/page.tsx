'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import VendorsContent from '@/features/vendor/components/VendorsContent/VendorsContent';
import styles from '@/styles/Users.module.css';

export default function VendorsPage() {
  return (
    <div className={styles.container}>
      <DashboardLayout>
        <VendorsContent />
      </DashboardLayout>
    </div>
  );
}
