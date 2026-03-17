'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/hooks";
import { refresh_token } from "@/features/auth/authSlice";

function WithPrivate({children}:any) {
    const { isAuthenticated, jwt } = useAppSelector(state=>state.auth);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const [initialized, setInitialized] = useState(false);
    const exceptionPaths = ['/signin', '/forgot-password', '/reset-password'];

    useEffect(()=>{
      if(jwt || isAuthenticated) {
        setInitialized(true);
        return;
      }
      dispatch(refresh_token()).finally(() => setInitialized(true));
    }, []);

    useEffect(()=>{
      if(!initialized) return;
      if(!isAuthenticated && !exceptionPaths.includes(pathname)) {
        router.replace('/signin');
      }
    }, [isAuthenticated, initialized, pathname]);

    if(!initialized && !exceptionPaths.includes(pathname)) return null;
    return isAuthenticated || exceptionPaths.includes(pathname) ? children : null;
}

export default WithPrivate
