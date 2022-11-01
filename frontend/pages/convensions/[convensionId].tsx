import { useRouter } from 'next/router';
import ContractContent from '../../features/contract/components/ContractContent/ContractContent';
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
const Convension= () => {
 const router = useRouter();
 const {query} = router;
 const {convensionId:agreementId} = query;
  return (
    <DashboardLayout>
        <ContractContent type='convension' agreementId={agreementId as string | undefined}/>
    </DashboardLayout>
  )
}

export default Convension;