import { useEffect, useState } from 'react';
import axios from '../../../../api/axios';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import AgreementStatsCard from '../AgreementStatsCard/AgreementStatsCard';
import DateRangePicker from '../date-range-picker/DateRangePicker';
import LastEventsCard from '../lastEventsCard/LastEventsCard';
import UsersCard from '../UsersCard/UsersCard';
import VendorsCard from '../VendorsCard/VendorsCard';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
  const [agreementStats,setAgreementStats]  = useState(null);
  const dispatch = useAppDispatch();
  useEffect(()=>{
    const abortController = new AbortController();
    axios.get("/Agreements/stats",{
      signal:abortController.signal
    })
    .then(res=>{
      setAgreementStats(res.data)
    })
    .catch(err=>{
      console.error(err)
      if(err.code !== "ERR_CANCELED"){
        //@ts-ignore
        dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
      }
    })
    return ()=>{
      abortController.abort();
    }
  },[])
  return (
    <div className={styles.container}>
        {/* <DateRangePicker/> */}
        <div></div>
        <div className={styles.contentWrapper}>
            <AgreementStatsCard stats={agreementStats}/>
            <div className={styles.middleCard}>
                <VendorsCard/>
                <UsersCard/>
            </div>
            <LastEventsCard/>
            
        </div>
    </div>
  )
}

export default MainDashboard