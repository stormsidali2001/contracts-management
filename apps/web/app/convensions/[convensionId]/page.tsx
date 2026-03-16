'use client';

import { useParams } from 'next/navigation';
import ContractContent from '@/features/contract/components/ContractContent/ContractContent';
import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';

export default function ConvensionPage() {
  const params = useParams();
  const agreementId = params.convensionId;
  return (
    <DashboardLayout>
      <ContractContent type='convension' agreementId={agreementId as string | undefined} />
    </DashboardLayout>
  );
}
