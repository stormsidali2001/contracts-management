import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import styles from './DashboardLayout.module.css';
const DashboardLayout = ({children}:any) => {
  return (
    <div className={styles.container}>
    <Sidebar/>
    <div>
        <Topbar/>
        {children}
    </div>
  </div>
  )
}

export default DashboardLayout