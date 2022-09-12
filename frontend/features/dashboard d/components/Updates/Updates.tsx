import { updatesData } from '../../data';
import styles from './Updates.module.css';

const Updates = () => {
  return (
    <div className={styles.container}>
        {updatesData.map((update)=>{
            return (
                <div className={styles.updateItem}>
                    <update.icon/>
                    <div className={styles.event}>
                        <span>{update.username}</span>
                        <span>{update.text}</span>
                        <span>{update.time}</span>
                    </div>
                </div>
            )
        })}
    </div>
  )
}

export default Updates