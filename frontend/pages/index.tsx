import type { NextPage } from 'next'
import MainDashboard from '../features/dashboard/components/MainDashboard/MainDashboard'
import Sidebar from '../features/dashboard/components/Sidebar/Sidebar'
import Topbar from '../features/dashboard/components/Topbar/Topbar'
import styles from '../styles/Home.module.css'


const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Sidebar/>
      <div>
          <Topbar/>
          <MainDashboard/>
      </div>
    </div>
  )
}

export default Home
