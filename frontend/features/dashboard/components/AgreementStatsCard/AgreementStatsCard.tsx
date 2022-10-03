import ContractFilledIcon from '../../../../icons/ContractFilledIcon';
import ContractsIcon from '../../../../icons/ContractsIcon';
import ConvensionFilledIcon from '../../../../icons/ConvensionFilledIcon';
import ConvensionIcon from '../../../../icons/ConvensionIcon';
import styles from './AgreementStatsCard.module.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
const AgreementStatsCard = () => {
  return (
    <div className={styles.container}>
          <div className={styles.title}>Accords</div>
          <div className={styles.status}>
            <div className={styles.subtitle}>Status:</div>
            <ul className={styles.statusList}>
              <li className={styles.statusItem}>
                 <div className={styles.statusCircle}></div>
                 <div className={styles.text}>non execute: <span>20</span></div>
              </li>
              <li className={styles.statusItem}>
                 <div className={styles.statusCircle}></div>
                 <div className={styles.text}>execute: <span>10</span></div>
              </li>
              <li className={styles.statusItem}>
                 <div className={styles.statusCircle}></div>
                 <div className={styles.text}>en cours d{'’'}execution: <span>10</span></div>
              </li>
              <li className={`${styles.statusItem} ${styles.statusSubItem}`}>
               
               <div className={styles.statusCircle}></div>
               <div className={styles.text}>avec retard: <span>7</span></div>
              </li>
              <li className={`${styles.statusItem} ${styles.statusSubItem}`}>
               
               <div className={styles.statusCircle}></div>
               <div className={styles.text}>sans retard: <span>3</span></div>
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
              <CircularProgressbar value={68} text={`${68}%`} 
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
              <CircularProgressbar value={32} text={`${38}%`} 
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
              <li className={styles.directionItem}>
                 <div className={styles.directionCircle}><span>1</span></div>
                 <div className={styles.text}>DRG: <span>20</span></div>
              </li>
              <li className={styles.directionItem}>
                 <div className={styles.directionCircle}><span>2</span></div>
                 <div className={styles.text}>DTQ: <span>20</span></div>
              </li>
              <li className={styles.directionItem}>
                 <div className={styles.directionCircle}><span>3</span></div>
                 <div className={styles.text}>DMQ: <span>20</span></div>
              </li>
             
            </ul>
         </div>
    </div>
  )
}

export default AgreementStatsCard;