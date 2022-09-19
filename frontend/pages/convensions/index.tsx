
import ConvensionsContent from '../../features/convension/components/ConvernsionsContent/ConvensionContent';
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import styles from '../../styles/Users.module.css'
const Convensions = ()=> {
  return (
    <div className={styles.container}>
        <DashboardLayout>
           <ConvensionsContent/>
        </DashboardLayout>
    </div>
  )
}

export default Convensions;