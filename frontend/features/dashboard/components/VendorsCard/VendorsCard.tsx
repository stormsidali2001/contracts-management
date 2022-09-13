import dynamic from 'next/dynamic';
import LineChart from '../../../../utils/components/LineChart/LineChart';
import styles from './VendorsCard.module.css';

const VendorsCard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Fournisseurs</div>
      <div className={styles.chartContainer}>
        <LineChart/>
      
      </div>
    </div>
  )
}

export default VendorsCard