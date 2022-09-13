import type { NextPage } from 'next'
import DashboardLayout from '../features/dashboard/components/DashboardLayout.tsx/DashboardLayout'
import MainDashboard from '../features/dashboard/components/MainDashboard/MainDashboard'



const Home: NextPage = () => {
  return (
    <DashboardLayout>
      <MainDashboard/>
    </DashboardLayout>
  )
}

export default Home
