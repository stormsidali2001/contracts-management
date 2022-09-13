import dynamic from 'next/dynamic'
import styles from './Card.module.css'
import {Suspense, useState ,useId} from 'react';
import { AnimateSharedLayout,motion } from 'framer-motion';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
const Chart = dynamic(() => import('react-apexcharts'), {
    ssr:false,
    
  })
interface PropType{
    title:string;
    barValue:number;
    png:any;
    series:any;
    styles:any;
}
const Card = (props:PropType) => {
    const [expanded , setExpanded] = useState(false);
    const cardId = useId();
  return (
        <AnimateSharedLayout>
            {
                expanded?(
                    <ExpandedCard cardId={cardId}  params={props} setExpanded={()=>setExpanded(false)}

                    />
                ):(
                    <CompactCard cardId={cardId}  params={props} setExpanded={()=>setExpanded(true)}/>
                )
            }
        </AnimateSharedLayout>
  )
}

//compact card
function CompactCard({params,setExpanded,cardId}:{params:PropType,setExpanded:any,cardId:string}){
    const {png:Png,barValue,styles:st,title} = params;
    return(
        <motion.div layoutId={`expandableCard-${cardId}`} className={styles.compactCard} style={{...st,}} onClick={setExpanded}>
            <div className={styles.radialBar}>
                <CircularProgressbar
                    value={barValue}
                    text = {`${barValue}%`}
                    styles={
                        {
                           
                            root:{
                                overflow:'visible',
                                height:'auto',
                                maxHeight:'60%',
                                maxWidth:'60%'
                            },
                            path: {
                                // Path color
                                stroke: `white`,
                                strokeWidth:'10px',
                                filter:'drop-shadow(2px 4px 6px white)'
                              },
                            trail:{
                                display:'none',
                               
                            },
                            text:{
                                fill:'white',
                                fontWeight:'bold'
                            }
                        }
                    }

                />
                <span>{title}</span>
            </div>
            <div className={styles.details}>
                <Png/>
                <span>${barValue}</span>
                <span>Derniere semaine</span>
            </div>
        </motion.div>
    )
}
function ExpandedCard({params,setExpanded,cardId}:{params:PropType,setExpanded:any,cardId:string}){
   
    const {title,series,png,styles:st} = params;
    return(
        <motion.div layoutId={`expandableCard-${cardId}`} className={styles.expandedCard} style={{...st}}>
            <div onClick={setExpanded} className={styles.closeButton}>
                <CloseOutlinedIcon />
            </div>
            <span>{title}</span>
            <div className={styles.chartContainer}>
            
                {(typeof window !== 'undefined') &&
                <Chart
                        options={{
                            chart:{
                                type:'area',
                                height:'auto',
                            },
                            dataLabels:{
                                enabled:false,
                            },
                            stroke:{
                                curve:'smooth',
                                colors:["white"]
                            },
                            tooltip:{
                                x:{
                                    format:"dd/MM/yy HH:mm"
                                }
                            },
                            grid:{
                                show:true
                            },
                            xaxis:{
                                type:"datetime",
                                categories:[
                                    "2022-09-09T00:13:58.487Z",
                                    "2022-09-09T01:13:58.487Z",
                                    "2022-09-09T02:13:58.487Z","2022-09-09T03:13:58.487Z",
                                    "2022-09-09T04:13:58.487Z",
                                    "2022-09-09T05:13:58.487Z",
                                    "2022-09-09T06:13:58.487Z"
                                ]
                            }
                           
                            
                        
                        }}
                        series={series}
                        type='area'
                    />}
          
               
            </div>
            <span>Derniere semaine</span>
        </motion.div>
    )
}
export default Card