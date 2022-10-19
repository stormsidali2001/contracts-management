import styles from './VendorsCard.module.css';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useEffect, useId, useState } from 'react';
// import {} from 'chartjs-adapter-date-fns'
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
  registerables
} from "chart.js";
import {Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns';
import {fr} from 'date-fns/locale';
import { AnimateSharedLayout,motion } from 'framer-motion';
import { useAppSelector } from '../../../../hooks/redux/hooks';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
 
);


const VendorsCard = () => {
  const [expanded , setExpanded] = useState(false);
  const cardId = useId();
  const {vendorStats:stats} = useAppSelector(state=>state.StatisticsSlice)

 
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

export default VendorsCard;



export function CompactCard({stats,cardId,setExpanded}:any){
  const data = {
    labels: stats?.map((el:any)=>(new Date(el.date) ))?? [],
    datasets: [
      {
        label: 'nombre de fournisseurs',
        backgroundColor: '#17498E',
        borderColor: '#17498ebb',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: '#17498ebb',
        data: stats?.map((el:any)=>(el.nb_vendors)) ?? [],
        
      }
    ]
  };
  return (
    <motion.div layoutId={`expandableCard-${cardId}`} className={styles.container} onClick={()=>setExpanded(true)}>
    <div className={styles.title}>Fournisseurs</div>
    
    <div className={styles.chartContainer}>
     
      <Line
        data={data}
        width={100}
        height={50}
  

        options={{
          maintainAspectRatio: false,
          scales:{
            x: {
              type: 'time',
              time: {
                parser: 'yyyy-MM-dd',
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Date'
              },
              adapters: {
                date: {locale: fr},

               
             
              }
            }
          }
        }}
      />
    </div>
  </motion.div>
  )

}
export function ExpandedCard({stats,cardId,setExpanded}:any){
  const data = {
    labels: stats?.map((el:any)=>(new Date(el.date) ))?? [],
    datasets: [
      {
        label: 'nombre de fournisseurs',
        backgroundColor: '#17498E',
        borderColor: '#17498e94',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
        hoverBorderColor: '#17498e94',
        data: stats?.map((el:any)=>(el.nb_vendors)) ?? []
      }
    ]
  };
  return (
    <motion.div layoutId={`expandableCard-${cardId}`} className={styles.expandedCard}>
      <div onClick={()=>setExpanded(false)} className={styles.closeButton}>
                <CloseOutlinedIcon />
      </div>
            <div className={styles.title}>Fournisseurs</div>
    
    <div className={styles.chartContainer}>
     
      <Line
        data={data}
        width='auto'
        height='auto'
  

        options={{
          maintainAspectRatio: false,
          scales:{
            x: {
              type: 'time',
              time: {
                parser: 'yyyy-MM-dd',
                unit: 'month'
              },
              title: {
                display: true,
                text: 'Date'
              },
              adapters: {
                date: {locale: fr},

               
             
              }
            }
          }
        }}
      />
    </div>
    </motion.div>
  )
}