import { Stack, Typography } from '@mui/material';
import { useAppSelector } from '../../../../../hooks/redux/hooks';
import styles from './Notifications.module.css';

const Notifications = () => {
    const {notifications} = useAppSelector(state=>state.notification)
  return (
    <div className={styles.container}>
        <Typography textAlign="center">Notifications</Typography>
        <Stack gap={2}>
            {
                notifications.map(n=>{
                    return(
                        <Stack key={n.id} className={styles.item}>
                            <span className={styles.itemText}>{n.message}</span>
                        </Stack>
                    )
                })
            }
          
        </Stack>
    </div>
  )
}

export default Notifications