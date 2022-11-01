import { NextPage } from "next"
import { useRouter } from "next/router";
import { useEffect } from "react";
import WithSnackbar from "../../../global/withSnackbar";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux/hooks"
import Signin from "../../../pages/signin";
import { refresh_token } from "../authSlice";

function WithPrivate({children}:any) {
    const { isSuccess , isAuthenticated , jwt} = useAppSelector(state=>state.auth);
    const router = useRouter();
    const dispatch = useAppDispatch()
    const {pathname} = router;
    const exceptionPaths = ['/forgot-password','/reset-password']
    useEffect(()=>{
      if(jwt || isAuthenticated) return;
       dispatch(refresh_token())

    },[jwt , isAuthenticated])

  return isAuthenticated || exceptionPaths.includes(pathname) ?children : <WithSnackbar><Signin/></WithSnackbar>;
}

export default WithPrivate