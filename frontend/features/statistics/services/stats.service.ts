import { AxiosInstance } from "axios";

async function getStatistics({axiosInstance,startDate,endDate}:{axiosInstance:AxiosInstance,startDate?:string,endDate?:string}){
  let params  = '';
  if(startDate ){
    params += `?startDate=${startDate}`

   }
   if(endDate){
    params += `${startDate?'&':'?'}endDate=${endDate}`

   }
   console.log("t530",startDate,endDate)
    const res =  await axiosInstance.get('/statistics'+params) 
    if(!res.data) throw new Error("empty data statisticsService/getStatistics")
    return res.data;
}



  const statisticsService =  {getStatistics};

  export default statisticsService;