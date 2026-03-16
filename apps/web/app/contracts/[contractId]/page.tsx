'use client';

import { useParams } from 'next/navigation';
import ContractContent from '@/features/contract/components/ContractContent/ContractContent';
import DashboardLayout from '@/features/dashboard/components/DashboardLayout.tsx/DashboardLayout';

export default function ContractPage() {
  const params = useParams();
  const agreementId = params.contractId;
  return (
    <DashboardLayout>
      <ContractContent type='contract' agreementId={agreementId as string | undefined} />
    </DashboardLayout>
  );
}
