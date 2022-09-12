import { Badge, IconButton } from '@mui/material'
import LittleChevronIcon from '../../../../icons/LittleChevronIcon'
import NotificationIcon from '../../../../icons/NotificationIcon'
import styles from './Topbar.module.css'

const Topbar = () => {
  return (
    <div className={styles.container}>
       <div className={styles.indications}>
            <span>Tableau de Bord</span>
            <span>Juridique</span>
       </div>
       <div className={styles.rightButtons}>

            <IconButton  aria-label={notificationsLabel(100)}> 
                <Badge badgeContent={9} sx={{padding:0}}  className={styles.notificationBdge}>
                    <NotificationIcon/>
                </Badge>
            </IconButton>
            <div className={styles.profilImgContainer}>
                <img src="sidali.jpg" alt="profile picture"/>
                <LittleChevronIcon className={styles.chevron}/>
            </div>
          
           
       </div>
    </div>
  )
}
function notificationsLabel(count: number) {
    if (count === 0) {
      return 'no notifications';
    }
    if (count > 99) {
      return 'more than 99 notifications';
    }
    return `${count} notifications`;
  }
export default Topbar