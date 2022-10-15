import type { NextPage } from 'next'
import ForgotPassword from '../features/forgot-password/components/ForgotPassword/ForgotPassword';
import WithSnackbar from '../global/withSnackbar';
const ForgotPasswordPage: NextPage = () => {
  return (
    <WithSnackbar>
        <ForgotPassword/>
    </WithSnackbar>
  )
}

export default ForgotPasswordPage;
