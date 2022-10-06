import dynamic from 'next/dynamic';
import LineChart from '../../../../utils/components/LineChart/LineChart';
import styles from './VendorsCard.module.css';

interface PropType{
  stats:any
}
const VendorsCard = ({stats}:PropType) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Fournisseurs</div>
      <div className={styles.chartContainer}>
        <LineChart stats={stats}/>
      
      </div>
    </div>
  )
}

export default VendorsCard