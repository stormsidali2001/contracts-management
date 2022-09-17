
import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import DirectionContent from '../../features/direction/components/DirectionContent/DirectionContent';
import styles from '../../styles/Users.module.css'
const Directions = ()=> {
  return (
    <div className={styles.container}>
        <DashboardLayout>
            <DirectionContent/>
        </DashboardLayout>
    </div>
  )
}

export default Directions;