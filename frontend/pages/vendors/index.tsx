
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import VendorsContent from '../../features/vendor/components/VendorsContent/VendorsContent';
import styles from '../../styles/Users.module.css'

const Vendors = ()=> {
  return (
    <div className={styles.container}>
        <DashboardLayout>
          <VendorsContent/>
        </DashboardLayout>
    </div>
  )
}

export default  Vendors;