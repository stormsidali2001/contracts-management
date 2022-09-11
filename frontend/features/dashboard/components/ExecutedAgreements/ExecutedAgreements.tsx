import styles from './ExecutedAgreements.module.css';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr:false,
  
})
const ExecutedAgreements = () => {
  return (
    <div className={styles.container}>
      {
        (typeof window !== 'undefined')&&
        <Chart
        series={[
          {
            name:"accord executee",
            data:[10,50,30,90,40,120,100]
          }
        ]}
        type = 'area'
        options = {
          {
            chart:{
              type:"area",
              height:'auto'
            },
            fill:{
              colors:["#fff"],
              type:"gradient"
            },
            dataLabels:{
              enabled:false
            },
            stroke:{
              curve:"smooth",
              colors:["ff929f"]
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
                "2018-09-19T00:00:00.000Z",
                "2018-09-19T01:00:00.000Z",
                "2018-09-19T02:00:00.000Z",
                "2018-09-19T03:00:00.000Z",
                "2018-09-19T04:00:00.000Z",
                "2018-09-19T05:00:00.000Z",
                "2018-09-19T06:00:00.000Z"
              ],
              
            },
            yaxis:{
              show:false
            },
          
          
            
          }
        }
        />
      }
     
    </div>
  )
}

export default ExecutedAgreements;