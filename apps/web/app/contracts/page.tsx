'use client';

import ContractsContent from '@/features/contract/components/ContractsContent/ContractsContent';
import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import styles from '@/styles/Users.module.css';

export default function ContractsPage() {
  return (
    <div className={styles.container}>
      <DashboardLayout>
        <ContractsContent />
      </DashboardLayout>
    </div>
  );
}
