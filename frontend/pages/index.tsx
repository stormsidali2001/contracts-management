import type { NextPage } from 'next'
import DashboardContent from '../features/dashboard/components/DashboardContent/DashboardContent'
import Sidebar from '../features/dashboard/components/Sidebar/Sidebar'
import styles from '../styles/Home.module.css'
import Rightside from '../features/dashboard/components/Rightside/Rightside'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.glass}>
        <Sidebar/>
        <DashboardContent/>
        <Rightside/>
      </div>
    </div>
  )
}

export default Home
