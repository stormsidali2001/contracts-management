import { useEffect, useState } from 'react';
import axios from '../../../../api/axios';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { getStatistics } from '../../../statistics/StatisticsSlice';
import { showSnackbar } from '../../../ui/UiSlice';
import AgreementStatsCard from '../AgreementStatsCard/AgreementStatsCard';
import LastEventsCard from '../lastEventsCard/LastEventsCard';
import UsersCard from '../UsersCard/UsersCard';
import VendorsCard from '../VendorsCard/VendorsCard';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
  
  const dispatch = useAppDispatch(); 
  const axiosPrivate = useAxiosPrivate();
 
  useEffect(()=>{
    dispatch(getStatistics({axiosInstance:axiosPrivate}) )
  },[])
  return (
    <div className={styles.container}>
        {/* <DateRangePicker/> */}
        <div></div>
        <div className={styles.contentWrapper}>
            <AgreementStatsCard/>
            <div className={styles.middleCard}>
                <VendorsCard />
                <UsersCard />
            </div>
            <LastEventsCard/>
        </div>
    </div>
  )
}

export default MainDashboard