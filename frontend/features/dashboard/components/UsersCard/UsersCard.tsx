import AdminIcon from '../../../../icons/AdminIcon';
import EmployeeIcon from '../../../../icons/EmployeeIcon';
import JuridicalIcon from '../../../../icons/JuridicalIcon';
import styles from './UsersCard.module.css';
interface PropTypes{
  stats:any;
}
const UsersCard = ({stats}:PropTypes) => {
  if(!stats) return <div className={styles.container}>Loading...</div>

  const getEntityPercentage = (entity:string)=>{
    if(stats.total === 0) return 0;
    switch(entity){
      case 'admin': return (stats.admin/(stats.total)) ;
      case 'juridical': return (stats.juridical/(stats.total));
      case 'employee': return (stats.employee/(stats.total));
    }
    return 0
  }
  const percentages = [
    {percentage:getEntityPercentage('juridical'),icon:JuridicalIcon,name:"juridique"},
    {percentage:getEntityPercentage('employee'),icon:EmployeeIcon,name:"employee"},
    {percentage:getEntityPercentage('admin'),icon:AdminIcon,name:"admin"},
  ]
  
  return (
    <div className={styles.container}>
      <div className={styles.title}>Utilisateurs</div>
      <div className={styles.numUsers}>{stats.total}</div>
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