import ExecutedAgreements from '../ExecutedAgreements/ExecutedAgreements'
import Updates from '../Updates/Updates'
import styles from './Rightside.module.css'

const Rightside = () => {
  return (
    <div className={styles.container}>
      <div>
        <h3>Updates</h3>
        <Updates/>
      </div>
      <div>
        <h3>Observations</h3>
        <ExecutedAgreements/>
      </div>
    </div>
  )
}

export default Rightside