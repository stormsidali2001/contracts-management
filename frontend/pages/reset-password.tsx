import type { NextPage } from 'next'
import ResetPassword from '../features/forgot-password/components/RestPassword/ResetPassword';
import WithSnackbar from '../global/withSnackbar';
const ResetPasswordPage: NextPage = () => {
  return (
      <WithSnackbar>
        <ResetPassword/>
      </WithSnackbar>
  )
}

export default ResetPasswordPage;
export async function getServerSideProps({ query }:any) {
  console.log(query,'..............')
  if(!query.token || !query.userId)  return {
    redirect: {
      permanent: false,
      destination: "/signin"
    }
  }

  return {
    props:{}
  }
  //...
}