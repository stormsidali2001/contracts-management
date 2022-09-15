import { NextPage } from "next"
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux/hooks"
import Signin from "../../../pages/signin";
import { verifyAccessToken } from "../authSlice";

function WithPrivate({children}:any) {
    const dispatch = useAppDispatch();
    const { isSuccess , isAuthenticated , jwt} = useAppSelector(state=>state.auth);
    const router = useRouter();
    const {pathname} = router;
    useEffect(()=>{
        if(!jwt || !jwt.access_token ) return;

        dispatch(verifyAccessToken(jwt.access_token));
    },[jwt , isAuthenticated])

  return isAuthenticated ?children : <Signin/>;
}

export default WithPrivate