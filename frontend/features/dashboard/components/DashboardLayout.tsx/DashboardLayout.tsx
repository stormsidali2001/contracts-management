import { Alert, Snackbar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { clear } from '../../../ui/UiSlice';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import styles from './DashboardLayout.module.css';
const DashboardLayout = ({children}:any) => {
  const {message,open,severty} = useAppSelector(state=>state.uiSlice);
  const dispatch = useAppDispatch();
  const handleClose = ()=>{
    dispatch(clear())
  }
  return (
    <div className={styles.container}>
    <Sidebar/>
    <div>
        <Topbar/>
        {children}
        <Snackbar anchorOrigin={{horizontal:'center',vertical:"top"}} open={open} autoHideDuration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={severty} sx={{ width: '100%' }}>
              {message}
            </Alert>
        </Snackbar>
    </div>
  </div>
  )
}

export default DashboardLayout