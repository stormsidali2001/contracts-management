import { Badge, Button, IconButton, Popover } from '@mui/material'
import { useRouter } from 'next/router'
import { MouseEvent, useId ,useState } from 'react'
import { useAppSelector } from '../../../../hooks/redux/hooks'
import LittleChevronIcon from '../../../../icons/LittleChevronIcon'
import NotificationIcon from '../../../../icons/NotificationIcon'
import Notifications from './Notifications/Notifications'
import PopoverContent from './PopoverContent/PopoverContent'
import styles from './Topbar.module.css'

const Topbar = () => {
  const {notifications} = useAppSelector(state=>state.notification)
  const router = useRouter();
  const {pathname} = router
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const popoverIdNotification = useId();
  const [anchorElNotification, setAnchorElNotification] = useState<HTMLButtonElement | null>(null);
  const {user} = useAppSelector(state=>state.auth)
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClickNotification = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorElNotification(event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const openNotification = Boolean(anchorElNotification);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseNotification = () => {
    setAnchorElNotification(null);
  };

  const getStringFromPathName = ()=>{
    switch(pathname){
      case '/':
        return "Tableau de board";
      case '/directions':
        return "les directions";
      case '/vendors':
        return "les fournisseurs"
      case '/users':
        return "les utilisateurs";
      case '/contracts':
        return "les contrats"
      case '/convensions':
        return "Les convensions";
      case '/settings':
        return "Parametres";
    }
    if(pathname.includes("/users") )return "utilisateur"
  }
  return (
    <div className={styles.container}>
       <div className={styles.indications}>
            <span>{getStringFromPathName()}</span>
            <span>{user?.role ?? ''}</span>
       </div>
       <div className={styles.rightButtons}>

            <IconButton onClick={handleClickNotification}  aria-label={notificationsLabel(100)}> 
                <Badge badgeContent={notifications.length} sx={{padding:0}}  className={styles.notificationBdge}>
                    <NotificationIcon/>
                </Badge>
            </IconButton>
            <Button  onClick={handleClick} aria-describedby={popoverId}>
              <div  className={styles.profilImgContainer} >
                  <img src={user?.imageUrl?`http://localhost:8080/api/users/image/${user?.imageUrl}`:"/blank-profile-picture.png"} alt="profile picture"/>
                  <LittleChevronIcon className={styles.chevron}/>
              </div>
            </Button>
            <Popover
              id={popoverId}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              PaperProps={
                {
                  className:styles.popoverStyles,
                  
                }
              }

            >
               <PopoverContent/>
            </Popover>

            <Popover
              id={popoverIdNotification}
              open={openNotification}
              anchorEl={anchorElNotification}
              onClose={handleCloseNotification}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              PaperProps={
                {
                  className:styles.popoverStyles,
                  
                }
              }

            >
               <Notifications/>
            </Popover>
          
           
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