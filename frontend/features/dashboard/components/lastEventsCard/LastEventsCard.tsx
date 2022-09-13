import styles from './LastEventsCard.module.css'

const LastEventsCard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Evenements</div>
      <ul className={styles.events}>
        <li className={styles.event}>
            <span  className={`${styles.circle} ${styles.juridicalCircle}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>

        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.juridicalCircle}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>

        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.adminOrChief}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>

        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.adminOrChief}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>
        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.adminOrChief}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>
        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.adminOrChief}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>
        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.adminOrChief}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>
        </li>
        <li className={styles.event}>
            <span className={`${styles.circle} ${styles.adminOrChief}`}></span>
            <p className={styles.body}>nouveau contrat: DRG dp1 
            dans le departement 
            </p>
        </li>
      </ul>
    </div>
  )
}

export default LastEventsCard