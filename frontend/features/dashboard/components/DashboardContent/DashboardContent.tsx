import Cards from '../Cards/Cards';
import TableComponent from '../Table/Table';
import styles from './DashboardContent.module.css';
const DashboardContent = () => {
  return (
    <div className={styles.container}>
        <h1>Dashboard</h1>
        <Cards/>
        <TableComponent/>
    </div>
  )
}

export default DashboardContent