import WithSnackbar from '@/global/withSnackbar';
import { useNotificationSocket } from '@/features/notification/hooks/useNotificationSocket';
import Sidebar from '@/features/dashboard/components/Sidebar/Sidebar';
import Topbar from '@/features/dashboard/components/Topbar/Topbar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }: any) => {
  useNotificationSocket();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Topbar />
        <WithSnackbar>{children}</WithSnackbar>
      </div>
    </div>
  );
};

export default DashboardLayout;
