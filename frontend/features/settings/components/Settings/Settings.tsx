import { Button, Input } from '@mui/material';
import NotificationIconA from '../../../../icons/NotificationIconA';
import PasswordIcon from '../../../../icons/PasswordIcon';
import styles from './Settings.module.css';

const Settings = () => {
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
            <div className={styles.checkboxContainer}>
              <Input id="notification-check-box" type="checkbox" className={styles.checkbox}/>
              <label htmlFor='notification-check-box'>recevoir des notification par email.</label>
            </div>
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
            <Button variant='contained' size='small'  sx={{marginTop:'15px'}}>Changer</Button>
          </div>
         
       </div>
     

   
    </div>
  )
}
export default Settings