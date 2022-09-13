
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import styles from '../../styles/Users.module.css'
const Users = ()=> {
  return (
    <div className={styles.container}>
        <DashboardLayout>
            users
        </DashboardLayout>
    </div>
  )
}

export default Users;