import { Badge, Button, IconButton, Popover } from '@mui/material'
import { MouseEvent, useId ,useState } from 'react'
import LittleChevronIcon from '../../../../icons/LittleChevronIcon'
import NotificationIcon from '../../../../icons/NotificationIcon'
import PopoverContent from './PopoverContent/PopoverContent'
import styles from './Topbar.module.css'

const Topbar = () => {
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

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
            <Button  onClick={handleClick} aria-describedby={popoverId}>
              <div  className={styles.profilImgContainer} >
                  <img src="sidali.jpg" alt="profile picture"/>
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