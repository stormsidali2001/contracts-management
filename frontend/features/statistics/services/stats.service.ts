import { AxiosInstance } from "axios";
import axios from "../../../api/axios";

async function getStatistics({axiosInstance,startDate,endDate}:{axiosInstance:AxiosInstance,startDate?:string,endDate?:string}){
  const body:{startDate?:string,endDate?:string} = {};
  if(startDate ){
    body.startDate = startDate;

   }
   if(endDate){
    body.endDate = endDate;
   }

    const res =  await axios.get('/statistics') 
    if(!res.data) throw new Error("empty data statisticsService/getStatistics")
    return res.data;
}



  const statisticsService =  {getStatistics};

  export default statisticsService;