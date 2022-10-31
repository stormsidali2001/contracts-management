import { Button, CircularProgress, Input, Modal } from '@mui/material';
import { useState } from 'react';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import NotificationIconA from '../../../../icons/NotificationIconA';
import PasswordIcon from '../../../../icons/PasswordIcon';
import { selectRecieveNotifications } from '../../../auth/authSlice';
import { recieveNotifications } from '../../../notification/notificationSlice';
import ChangePassword from '../../ChangePassword/ChangePassword';
import styles from './Settings.module.css';

const Settings = () => {
  const [changePasswordModal,setChangePasswordModal] = useState(false);
  const handleOpenChangePasswordModal = ()=>setChangePasswordModal(true);
  const handleCloseChangePasswordModal = ()=>setChangePasswordModal(false);
  const [recieveNotificationsModalOpen,setRecieveNotificationsModalOpen] = useState(false)
  const handleOpenRecieveNotificationsModal = ()=>setRecieveNotificationsModalOpen(false)
  const handleCloseRecieveNotificationsModal = ()=>setRecieveNotificationsModalOpen(true)
  const dispatch = useAppDispatch();
  const axiosPrivate = useAxiosPrivate();
  const {user,isLoading} = useAppSelector(state=>state.auth);
  const handleNotificationChange = ()=>{
    dispatch(selectRecieveNotifications({axios_instance:axiosPrivate}))
  }
  return (
    <div className={styles.container}>
      <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img src="phone1.jpg" />
              <div className={styles.box}>
                <NotificationIconA/>
                <span>Notifications</span>
              </div>
          </div>
          <div className={styles.content}>
            <p>
              si les notification de l’application vous suffit disactivez cette options
            </p>
           
              {
                isLoading?(
                  <CircularProgress sx={{margin:'0 auto',width:"2px",height:"2px"}} />
                ):(
                  <div className={styles.checkboxContainer}>
                  <Input id="notification-check-box" type="checkbox" value={!!user?.recieve_notifications} className={styles.checkbox} inputProps={{checked:!!user?.recieve_notifications}} onChange={()=>handleNotificationChange()}/>
                  <label htmlFor='notification-check-box'>recevoir des notification par email.</label>
                 </div>
                )
              }
         
             
          </div>
         
       </div>


       <div className={styles.card}>
          <div className={styles.imageContainer}>
            <img src="phone2.jpg" />
              <div className={styles.box}>
                <PasswordIcon/>
                <span>Mot de passe</span>
              </div>
          </div>
          <div className={styles.content}>
            <p>
              choisissez cette option si vous voulez changer votre mot de passe
            </p>
            <Button variant='contained' size='small'  sx={{marginTop:'15px'}} onClick={()=>handleOpenChangePasswordModal()}>Changer</Button>
          </div>
         
       </div>
     

     <Modal
      open={changePasswordModal}
      onClose={handleCloseChangePasswordModal}

     >
      <ChangePassword handleClose={handleCloseChangePasswordModal}/>

     </Modal>

  
    </div>
  )
}
export default Settings