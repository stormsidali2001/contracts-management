import axios from "../../api/axios";
import { setJwt } from "../../features/auth/authSlice";
import { useAppDispatch } from "../redux/hooks"

const useRefreshToken = ()=>{
    const dispatch = useAppDispatch();

    async function refresh(){
        try{
            const response = await axios.get("/auth/refresh_token",{
                withCredentials:true
            })
            dispatch(setJwt({access_token:response.data.access_token}))
            return response.data.access_token;
        }catch(err){
            console.error(err);
        }
        
    }
    return refresh;
}

export default useRefreshToken;