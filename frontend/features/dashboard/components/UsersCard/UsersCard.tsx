import AdminIcon from '../../../../icons/AdminIcon';
import EmployeeIcon from '../../../../icons/EmployeeIcon';
import JuridicalIcon from '../../../../icons/JuridicalIcon';
import styles from './UsersCard.module.css';

const UsersCard = () => {
  const percentages = [
    {percentage:0.3,icon:JuridicalIcon,name:"juridique"},
    {percentage:0.6,icon:EmployeeIcon,name:"employee"},
    {percentage:0.1,icon:AdminIcon,name:"admin"},
  ]
  return (
    <div className={styles.container}>
      <div className={styles.title}>Utilisateurs</div>
      <div className={styles.numUsers}>210</div>
      <div className={styles.percentages}>
          {
            percentages.map((percentage,index)=>{
              return (
                <div className={styles.percentage} key={index} >
                  <percentage.icon/>
                  <span>{`${percentage.percentage*100}%`}</span>
                </div>
              )
            })
          }
      </div>
    </div>
  )
}

export default UsersCard;