import { Chart , registerables ,LineController,LineElement,PointElement,LinearScale,Title} from 'chart.js';
import { useEffect, useId, useRef } from 'react';
import styles from './LineChart.module.css';
const LineChart = () => {
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
                    labels: ["19 sep", "20 sep", "21 sep","22 sep","23 sep","24 sep","25 sep"],
                    datasets: [
                        {
                            label: 'nombre de fournisseur',
                            backgroundColor: '#17498E',
                            borderColor: 'rgba(23, 73, 142, 0.5)',
                            data: [0, 10, 5, 2, 20, 30, 45],
                            tension: 0.1
                        }
                    ],
                
                },
                options: {
                    //Customize chart options
                    scales:{
                        x:{
                            beginAtZero:true,

                        },
                       
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
        
        
        
           
        

    },[])
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