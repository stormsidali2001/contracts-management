'use client';

import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import DirectionContent from '@/features/direction/components/DirectionContent/DirectionContent';
import styles from '@/styles/Users.module.css';

export default function DirectionsPage() {
  return (
    <div className={styles.container}>
      <DashboardLayout>
        <DirectionContent />
      </DashboardLayout>
    </div>
  );
}
