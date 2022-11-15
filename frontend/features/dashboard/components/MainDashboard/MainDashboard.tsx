import { Button, TextField, useMediaQuery } from '@mui/material';
import { Stack } from '@mui/system';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import axios from '../../../../api/axios';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { getStatistics } from '../../../statistics/StatisticsSlice';
import { showSnackbar } from '../../../ui/UiSlice';
import AgreementStatsCard from '../AgreementStatsCard/AgreementStatsCard';
import LastEventsCard from '../lastEventsCard/LastEventsCard';
import UsersCard from '../UsersCard/UsersCard';
import VendorsCard from '../VendorsCard/VendorsCard';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
  
  const dispatch = useAppDispatch(); 
  const axiosPrivate = useAxiosPrivate({});
  const {end_date,start_date} = useAppSelector(state=>state.StatisticsSlice)
  const isMedium = useMediaQuery('(max-width: 900px)');
  useEffect(()=>{
    dispatch(getStatistics({axiosInstance:axiosPrivate}) )
  },[])
  return (
    <div className={styles.container}>
        
      <div></div>
        <div className={styles.contentWrapper}>
          {
            isMedium ?(
              <>
              <div className={styles.middleCard}>
                  <VendorsCard />
                  <UsersCard />
              </div>
              <div className={styles.flexy}>
               <AgreementStatsCard/>
              <LastEventsCard/>

              </div>
              </>

            ):(
              <>
              <AgreementStatsCard/>
              <div className={styles.middleCard}>
                  <VendorsCard />
                  <UsersCard />
              </div>
              <LastEventsCard/>
              </>
            )
          }
           
        </div>
    </div>
  )
}

export default MainDashboard