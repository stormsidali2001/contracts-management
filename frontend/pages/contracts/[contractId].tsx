import { useRouter } from 'next/router';
import ContractContent from '../../features/contract/components/ContractContent/ContractContent';
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
const Contract = () => {
  const router = useRouter();
  const {query} = router;
  const {contractId:agreementId} = query;
  return (
    <DashboardLayout>
        <ContractContent  type='contract' agreementId={agreementId as string | undefined}/>
    </DashboardLayout>
  )
}

export default Contract;