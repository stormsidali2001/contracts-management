import ContractFilledIcon from '../../../../icons/ContractFilledIcon';
import ConvensionFilledIcon from '../../../../icons/ConvensionFilledIcon';
import styles from './AgreementStatsCard.module.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState ,useId} from 'react';
import { AnimateSharedLayout ,motion} from 'framer-motion';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { Box } from '@mui/system';
import { Tab, Tabs } from '@mui/material';
import {Doughnut, Pie,Bar} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement
} from "chart.js";
ChartJS.register(
  ArcElement,
  BarElement
)
interface PropTypes{
  stats:any
}
const AgreementStatsCard = ({stats}:PropTypes)=> {
  const [expanded,setExpanded] = useState(false);
  const cardId = useId();
 
  if(!stats) return <div className={styles.container}>Loading...</div>;
  return (
    <AnimateSharedLayout>
      {
        !expanded ?(
          <CompactCard cardId={cardId} stats={stats} setExpanded={setExpanded}/>
        ):(
          <ExpandedCard cardId={cardId} stats={stats} setExpanded={setExpanded}/>
        )
      }
    </AnimateSharedLayout>
  )
}

export default AgreementStatsCard;



function CompactCard({stats,cardId,setExpanded}:any){
  const getContractPercentage = ()=>{
    if(stats?.types?.contract === 0 && stats?.types?.convension ===0) return 0;
    return (stats?.types?.contract / (stats?.types?.contract + stats?.types?.convension))*100 ;
  }
  const getConvensionPercentage = ()=>{
    if(stats?.types?.contract === 0 && stats?.types?.convension ===0) return 0;
    return (stats.types.convension / (stats.types.contract + stats.types.convension))*100 ;
  }
  return (
    <motion.div layoutId={cardId} className={styles.container}>
        <div className={styles.title}>Accords</div>
        
        <ZoomOutMapIcon onClick={()=>setExpanded(true)} className={styles.zoomButton} sx={{fontSize:'18px'}} color='primary' />
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
            <div className={styles.text}>DRG: <span>{dr.agreementCount}</span></div>
         </li>
          )
        })
      }
     
       
      </ul>
   </div>
</motion.div>
  )
}

function ExpandedCard({stats,cardId,setExpanded}:any){
  const [value, setValue] = useState(0);
  const data = {
    labels: [
      'non executé',
      "en cours d'éxecution ",
      "en cours d'éxecution avec retard",
      'executé',
      'executé avec retard',
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [
          stats.status.not_executed,
          stats.status.in_execution,
          stats.status.in_execution_with_delay,
          stats.status.executed, 
          stats.status.executed_with_delay],
          backgroundColor: [
            '#FFB359',
            '#2D568F',
            '#992CFF'
          ],
          hoverOffset: 2
    }]

  }

  const data1 = {
    labels: [
      'Contrat',
      "Convension",
    ],
    datasets: [{
        label: 'My First Dataset',
        data: [

          stats.types.contract,
          stats.types.convension,
          
        ],
          backgroundColor: [
            '#FFB359',
            '#17498E',
          ],
          hoverOffset: 2
    }]

  }

  const data2 = {
    labels: stats.topDirections.map((el:any)=>el.abriviation),
    datasets: [{
        label: "nombre dáccord par direction",
        data:stats.topDirections.map((el:any)=>el.agreementCount)
        ,
          backgroundColor: [
            
            '#17498E',
          ],
          hoverOffset: 2
    }]

  }







  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <motion.div layoutId = {cardId} className={styles.expandedCard}>
      <div onClick={()=>setExpanded(false)} className={styles.closeButton}>
                <CloseOutlinedIcon />
      </div>
      <Box sx={{ width: '100%',height:'80%'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="agreementStats card tabs" centered>
          <Tab label="Status" {...a11yProps(0)} />
          <Tab label="Type" {...a11yProps(1)} />
          <Tab label="Top directions" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <TabPanel  value={value} index={0} className={styles.AgreementChart}>
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
           
      </TabPanel>
      <TabPanel value={value} index={1} className={styles.AgreementChart}>
      <Pie
                            data={data1}
                            options={
                              {
                                maintainAspectRatio: false,
                                layout:{
                                  padding:10
                                }, 
                                
                              }
                            }
                        />
      </TabPanel>
      <TabPanel value={value} index={2} className={styles.AgreementChart}>
        <Bar
             data={data2}
             options={
               {
                 maintainAspectRatio: false,
                 layout:{
                   padding:10
                 }, 
                 
               }
             }
        
        />
      </TabPanel>
    </Box>

    </motion.div>
  )
}


function TabPanel({ children, value, index, ...other }:any) {

  return (
     <>
      {  value === index &&
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
      
            {children}
        </div>}
      </>
    
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}