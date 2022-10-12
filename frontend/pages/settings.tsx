import type { NextPage } from 'next'
import DashboardLayout from '../features/dashboard/components/DashboardLayout.tsx/DashboardLayout'
import Settings from '../features/settings/components/Settings/Settings'
const SettingsPage: NextPage = () => {
  return (
    <DashboardLayout>
      <Settings/>
    </DashboardLayout>
  )
}

export default SettingsPage;
