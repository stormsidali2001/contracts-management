import { AnimateSharedLayout ,motion} from 'framer-motion';
import { useMemo, useState ,useId } from 'react';
import AdminIcon from '../../../../icons/AdminIcon';
import EmployeeIcon from '../../../../icons/EmployeeIcon';
import JuridicalIcon from '../../../../icons/JuridicalIcon';
import styles from './UsersCard.module.css';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {Doughnut} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  registerables,
  ArcElement
} from "chart.js";
import { useAppSelector } from '../../../../hooks/redux/hooks';

ChartJS.register(
  ArcElement
)


const UsersCard = () => {
  const {userTypes:stats} = useAppSelector(state=>state.StatisticsSlice)
  
  const [expanded,setExpanded] = useState(false)
  const cardId = useId();
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
 
  
  return (
    <AnimateSharedLayout>
      {
        !expanded?(
          <CompactCard stats={stats} cardId={cardId} setExpanded={setExpanded}/>

         
        ):(
          <ExpandedCard stats={stats} cardId={cardId} setExpanded={setExpanded}/>
        )
      }
    </AnimateSharedLayout>
  )
}


export default UsersCard;

function CompactCard({stats,setExpanded,cardId}:any){
  const getEntityPercentage = (entity:string)=>{
    if(stats.total === 0) return 0;
    switch(entity){
      case 'admin': return Math.round(100*stats.admin/(stats.total)) ;
      case 'juridical': return Math.round(100*stats.juridical/(stats.total));
      case 'employee': return Math.round(100*stats.employee/(stats.total));
    }
    return 0
  }
  
  const percentages = [
    {percentage:getEntityPercentage('juridical'),icon:JuridicalIcon,name:"juridique"},
    {percentage:getEntityPercentage('employee'),icon:EmployeeIcon,name:"employee"},
    {percentage:getEntityPercentage('admin'),icon:AdminIcon,name:"admin"},
  ]
  return (
    <motion.div onClick={()=>setExpanded(true)} layoutId={cardId}  className={styles.container}>
     
    <div className={styles.title}>Utilisateurs</div>
    <div className={styles.numUsers}>{stats.total}</div>
    <div className={styles.percentages}>
        {
          percentages.map((percentage,index)=>{
            return (
              <div className={styles.percentage} key={index} >
                <percentage.icon/>
                <span>{`${percentage.percentage}%`}</span>
              </div>
            )
          })
        }
    </div>
  </motion.div>
  )
}
function ExpandedCard({stats,cardId,setExpanded}:any){
  const getEntityValue = (entity:string)=>{
    if(stats.total === 0) return 0;
    switch(entity){
      case 'admin': return stats.admin ;
      case 'juridical': return stats.juridical;
      case 'employee': return stats.employee;
    }
    return 0
  }
  const percentages = [
    {percentage:getEntityValue('juridical'),icon:JuridicalIcon,name:"juridique"},
    {percentage:getEntityValue('employee'),icon:EmployeeIcon,name:"employee"},
    {percentage:getEntityValue('admin'),icon:AdminIcon,name:"admin"},
  ]
  
  const data = {
    labels:percentages.map(p=>p.name),
    datasets: [{
      label: "les types d'utilisateur",
      data: percentages.map(p=>p.percentage),
      backgroundColor: [
        '#FFB359',
        '#2D568F',
        '#992CFF'
      ],
      hoverOffset: 2
    }]
  };
  return (
    <motion.div layoutId={cardId} className={styles.expandedCard}>
      <div onClick={()=>setExpanded(false)} className={styles.closeButton}>
                <CloseOutlinedIcon />
      </div>
    <div className={styles.title}>Utilisateurs</div>
    <div className={styles.chartContainer}>
      <Doughnut
        data={data}
      
        options={
          {
          
            maintainAspectRatio: false,
            layout:{
              padding:10
            }, 
            
          }
        }
      />
    </div>
   
  </motion.div>
  )
}