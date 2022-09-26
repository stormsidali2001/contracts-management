import { useEffect } from "react";
import { axiosPrivate } from "../../api/axios";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate  = ()=>{
    const refresh = useRefreshToken();
    useEffect(()=>{
        const responseInterceptor = axiosPrivate.interceptors.response.use(
            response => response, // normal case
            async (error)=>{
                const previousRequest = error?.config;
                if(error?.response?.status === 403 && !previousRequest?.sent){ 
                    previousRequest.sent = true;
                    const access_token = await refresh();
                }
            }
        )
    },[])
    return axiosPrivate;
}

export default useAxiosPrivate;