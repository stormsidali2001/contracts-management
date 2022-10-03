import ContractFilledIcon from '../../../../icons/ContractFilledIcon';
import ContractsIcon from '../../../../icons/ContractsIcon';
import ConvensionFilledIcon from '../../../../icons/ConvensionFilledIcon';
import ConvensionIcon from '../../../../icons/ConvensionIcon';
import styles from './AgreementStatsCard.module.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
interface PropTypes{
  stats:any
}
const AgreementStatsCard = ({stats}:PropTypes)=> {
  const getContractPercentage = ()=>{
    if(stats?.types?.contract === 0 && stats?.types?.convension ===0) return 0;
    return (stats?.types?.contract / (stats?.types?.contract + stats?.types?.convension))*100 ;
  }
  const getConvensionPercentage = ()=>{
    if(stats?.types?.contract === 0 && stats?.types?.convension ===0) return 0;
    return (stats.types.convension / (stats.types.contract + stats.types.convension))*100 ;
  }
  if(!stats) return <div className={styles.container}>Loading...</div>
  return (
    <div className={styles.container}>
          <div className={styles.title}>Accords</div>
          <div className={styles.status}>
            <div className={styles.subtitle}>Status:</div>
            <ul className={styles.statusList}>
              <li className={styles.statusItem}>
                 <div className={styles.statusCircle}></div>
                 <div className={styles.text}>non execute: <span>{stats?.status?.not_executed ?? 0}</span></div>
              </li>
             
              <li className={styles.statusItem}>
                 <div className={styles.statusCircle}></div>
                 <div className={styles.text}>execute: <span>{stats?.status?.executed +stats?.status?.executed_with_delay ?? 0}</span></div>
              </li>
              <li className={`${styles.statusItem} ${styles.statusSubItem}`}>
               
               <div className={styles.statusCircle}></div>
               <div className={styles.text}>avec retard: <span>{stats?.status?.executed_with_delay ?? 0}</span></div>
              </li>
              <li className={`${styles.statusItem} ${styles.statusSubItem}`}>
               
               <div className={styles.statusCircle}></div>
               <div className={styles.text}>sans retard: <span>{stats?.status?.executed  ?? 0}</span></div>
              </li>





              <li className={styles.statusItem}>
                 <div className={styles.statusCircle}></div>
                 <div className={styles.text}>en cours d{'’'}execution: <span>{stats?.status?.in_execution +stats?.status?.in_execution_with_delay ?? 0}</span></div>
              </li>
              <li className={`${styles.statusItem} ${styles.statusSubItem}`}>
               
               <div className={styles.statusCircle}></div>
               <div className={styles.text}>avec retard: <span>{stats?.status?.in_execution_with_delay ?? 0}</span></div>
              </li>
              <li className={`${styles.statusItem} ${styles.statusSubItem}`}>
               
               <div className={styles.statusCircle}></div>
               <div className={styles.text}>sans retard: <span>{stats?.status?.in_execution  ?? 0}</span></div>
              </li>
            </ul>
          </div>
          <div className={styles.type}>
            <div  className={styles.subtitle}>Type:</div>
            <div className={styles.typeContainer}>
              <div className={styles.contract}>

                <div className={styles.contractContainer}>
                  <ContractFilledIcon/>
                </div>
                <span>Contrat</span>

              </div>
              <div className={styles.contractPercentage}>
              <CircularProgressbar value={getContractPercentage()} text={`${getContractPercentage()}%`} 
                styles={
                  {
                     
                      path: {
                          // Path color
                          stroke: `#FFB359`,
                          strokeWidth:'10px',
                          filter:'drop-shadow(2px 4px 6px white)'
                        },
                      trail:{
                          display:'none',
                         
                      },
                      text:{
                          fill:'rgba(65, 62, 62, 0.89)',
                          fontWeight:'bold',
                          fontSize:'35px',
                          fontStyle:'normal',
                          fontFamily:'Inter'
                      }
                  }
              }
              />
              </div>
              <div className={styles.convensionPercentage}>
              <CircularProgressbar value={getConvensionPercentage()} text={`${getConvensionPercentage()}%`} 
                styles={
                  {
                     
                      path: {
                          // Path color
                          stroke: `#17498E`,
                          strokeWidth:'10px',
                          filter:'drop-shadow(2px 4px 6px white)'
                        },
                      trail:{
                          display:'none',
                         
                      },
                      text:{
                          fill:'rgba(65, 62, 62, 0.89)',
                          fontWeight:'bold',
                          fontSize:'35px',
                          fontStyle:'normal',
                          fontFamily:'Inter'
                      }
                  }
              }
              />
              </div>
              <div className={styles.convension}>
               <div >
                  <ConvensionFilledIcon/>
                </div>
                <span>Convension</span>
              </div>
            </div>
          </div>
          <div className={styles.direction}>
          <div  className={styles.subtitle}>Top directions:</div>
          <ul className={styles.directionList}>
            {
              stats?.topDirections?.map((dr:any,index:number)=>{
                return (
                  <li key={index} className={styles.directionItem}>
                  <div className={styles.directionCircle}><span>{index+1}</span></div>
                  <div className={styles.text}>DRG: <span>{dr.abriviation}</span></div>
               </li>
                )
              })
            }
           
             
            </ul>
         </div>
    </div>
  )
}

export default AgreementStatsCard;