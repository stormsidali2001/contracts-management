'use client';

import ConvensionsContent from '@/features/convension/components/ConvernsionsContent/ConvensionContent';
import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import styles from '@/styles/Users.module.css';

export default function ConvensionsPage() {
  return (
    <div className={styles.container}>
      <DashboardLayout>
        <ConvensionsContent />
      </DashboardLayout>
    </div>
  );
}
