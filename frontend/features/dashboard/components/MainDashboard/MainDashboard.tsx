import AgreementStatsCard from '../AgreementStatsCard/AgreementStatsCard';
import DateRangePicker from '../date-range-picker/DateRangePicker';
import LastEventsCard from '../lastEventsCard/LastEventsCard';
import UsersCard from '../UsersCard/UsersCard';
import VendorsCard from '../VendorsCard/VendorsCard';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
  return (
    <div className={styles.container}>
        {/* <DateRangePicker/> */}
        <div></div>
        <div className={styles.contentWrapper}>
            <AgreementStatsCard/>
            <div className={styles.middleCard}>
                <VendorsCard/>
                <UsersCard/>
            </div>
            <LastEventsCard/>
            
        </div>
    </div>
  )
}

export default MainDashboard