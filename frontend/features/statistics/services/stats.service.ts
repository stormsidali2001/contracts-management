import { AxiosInstance } from "axios";
import axios from "../../../api/axios";

async function getStatistics({axiosInstance}:{axiosInstance:AxiosInstance}){
    const res =  await axios.get('/statistics') 
    if(!res.data) throw new Error("empty data statisticsService/getStatistics")
    return res.data;
}




  const statisticsService =  {getStatistics};

  export default statisticsService;