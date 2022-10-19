import { useEffect, useState } from 'react';
import axios from '../../../../api/axios';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { getStatistics } from '../../../statistics/StatisticsSlice';
import { showSnackbar } from '../../../ui/UiSlice';
import AgreementStatsCard from '../AgreementStatsCard/AgreementStatsCard';
import DateRangePicker from '../date-range-picker/DateRangePicker';
import LastEventsCard from '../lastEventsCard/LastEventsCard';
import UsersCard from '../UsersCard/UsersCard';
import VendorsCard from '../VendorsCard/VendorsCard';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
  const [agreementStats,setAgreementStats]  = useState(null);
  const [usersStats,setUsersStats] = useState(null) 
  const [vendorsStats,setVendorsStats] = useState(null)
  const dispatch = useAppDispatch(); 
  const axiosPrivate = useAxiosPrivate();
  useEffect(()=>{
      dispatch(getStatistics({axiosInstance})
  },[])
  return (
    <div className={styles.container}>
        {/* <DateRangePicker/> */}
        <div></div>
        <div className={styles.contentWrapper}>
            <AgreementStatsCard stats={agreementStats}/>
            <div className={styles.middleCard}>
                <VendorsCard stats={vendorsStats}/>
                <UsersCard stats={usersStats}/>
            </div>
            <LastEventsCard/>
            
        </div>
    </div>
  )
}

export default MainDashboard