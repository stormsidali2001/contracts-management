
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import UsersContent from '../../features/dashboard/components/UsersContent/UsersContent';
import styles from '../../styles/Users.module.css'
const Users = ()=> {
  return (
    <div className={styles.container}>
        <DashboardLayout>
            <UsersContent/>
        </DashboardLayout>
    </div>
  )
}

export default Users;