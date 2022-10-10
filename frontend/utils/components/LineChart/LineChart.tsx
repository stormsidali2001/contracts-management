import { Chart , registerables ,LineController,LineElement,PointElement,LinearScale,Title} from 'chart.js';
import { useEffect, useId, useRef } from 'react';
import styles from './LineChart.module.css';
interface PropType{
    stats:any
}
const LineChart = ({stats}:PropType) => {
    const chartRef =useRef(null);
    const canvasId = useId();

    useEffect(()=>{
        const canvas = chartRef.current as unknown as HTMLCanvasElement;
        const myChartRef = canvas.getContext('2d');
        if(!myChartRef) return;
        
        Chart.register(...registerables);
        Chart.register(LineController, LineElement, PointElement, LinearScale, Title);
        const chart =  new Chart(myChartRef, {
                type: "line",
                data: {
                    //Bring in data
                    labels: stats?.slice(0,7)?.map((el:any)=>(new Date(el.date).getMonth()+'/'+new Date(el.date).getDate())) ?? [],
                    datasets: [
                        {
                            label: 'nombre de fournisseur',
                            backgroundColor: '#17498E',
                            borderColor: 'rgba(23, 73, 142, 0.5)',
                            data: stats?.slice(0,7).map((el:any)=>(el.nb_vendors)) ?? [],
                        }
                    ],
                
                },
                options: {
                    //Customize chart options
                    scales:{
                    
                        
                      
                        
                       
                    },
                    responsive:true,
                    maintainAspectRatio: false,
                
                }
            });

        return ()=>{
            var chartExist = Chart.getChart(myChartRef); // <canvas> id
            if (chartExist != undefined)  
              chartExist.destroy(); 
        
       
        }
        
        
        
           
        

    },[stats])

  return (
    <div className={styles.container} >
         <canvas
                    id={canvasId}
                    ref={chartRef}
                />
    </div>
  )
}

export default LineChart;