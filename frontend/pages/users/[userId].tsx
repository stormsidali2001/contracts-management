import DashboardLayout from '../../features/dashboard/components/DashboardLayout.tsx/DashboardLayout';
import UserProfile from '../../features/user/components/UserProfile/UserProfile';
const User = ()=> {

  return (
        <DashboardLayout>
            <UserProfile/>
        </DashboardLayout>
  )
}

export default User;