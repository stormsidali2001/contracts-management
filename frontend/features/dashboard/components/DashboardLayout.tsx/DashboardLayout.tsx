import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import WithSnackbar from '../../../../global/withSnackbar';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { startConnecting } from '../../../notification/notificationSlice';
import { clear } from '../../../ui/UiSlice';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import styles from './DashboardLayout.module.css';
const DashboardLayout = ({children}:any) => {
  const {message,open,severty} = useAppSelector(state=>state.uiSlice);
  const dispatch = useAppDispatch();
  const {jwt} = useAppSelector(state=>state.auth)
  const handleClose = ()=>{
    dispatch(clear())
  }
  const [runOnce,setRunOnce] = useState(false)
  useEffect(()=>{
    if(!jwt) return;
    if(!runOnce ){
      dispatch(startConnecting())
      setRunOnce(true)
    }

  },[jwt])
  return (
    <div className={styles.container}>
    <Sidebar/>
    <div>
        <Topbar/>
        <WithSnackbar>
          {children}
        </WithSnackbar>
        
    </div>
  </div>
  )
}

export default DashboardLayout