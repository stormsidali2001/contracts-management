
import { Button } from '@mui/material';
import ContractsContent from '../../features/contract/components/ContractsContent/ContractsContent';
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import styles from '../../styles/Users.module.css'
const Contracts = ()=> {
   console.log("t1","Contracts rerender")
  return (
    <div className={styles.container}>
        <DashboardLayout>
            <ContractsContent/>
        </DashboardLayout>
    </div>
  )
}

export default Contracts;