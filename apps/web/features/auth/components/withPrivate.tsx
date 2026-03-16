'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/hooks";
import { refresh_token } from "@/features/auth/authSlice";

function WithPrivate({children}:any) {
    const { isAuthenticated , jwt} = useAppSelector(state=>state.auth);
    const router = useRouter();
    const dispatch = useAppDispatch()
    const pathname = usePathname();
    const exceptionPaths = ['/signin', '/forgot-password','/reset-password']

    useEffect(()=>{
      if(jwt || isAuthenticated) return;
       dispatch(refresh_token())
    },[jwt , isAuthenticated])

    useEffect(()=>{
      if(!isAuthenticated && !exceptionPaths.includes(pathname)) {
        router.replace('/signin')
      }
    },[isAuthenticated, pathname])

  return isAuthenticated || exceptionPaths.includes(pathname) ? children : null;
}

export default WithPrivate
