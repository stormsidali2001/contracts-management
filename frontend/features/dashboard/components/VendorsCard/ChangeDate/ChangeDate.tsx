import { Button, Input, Stack, TextField } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import useAxiosPrivate from '../../../../../hooks/auth/useAxiosPrivate'
import { useAppDispatch, useAppSelector } from '../../../../../hooks/redux/hooks'
import { getStatisticsIntervall } from '../../../../statistics/StatisticsSlice'
import styles from './ChangeDate.module.css'
const format = (d:Date)=>{
   const newD = new Date(d);
   return newD.toISOString().replace(/T[0-9:.Z]*/g,"");

}
interface PropType{
    start_date:Dayjs | null;
    end_date:Dayjs | null;
    handleClose:()=>void
}
const ChangeDate = ({start_date,end_date,handleClose}:PropType) => {
  const [byStartDate,setByStartDate] = useState(false)
  const [byEndDate,setByEndDate] = useState(false)
  const [startDate,setStartDate] = useState(start_date)
  const [endDate,setEndDate] = useState(end_date)
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useAppDispatch();

  const handleSubmitFilters = ()=>{
 
  
      dispatch(getStatisticsIntervall({
         axiosInstance:axiosPrivate,
         startDate:startDate ?format(startDate.toDate()) :undefined,
         endDate:endDate ?format(endDate.toDate()) :undefined
      }))
   handleClose();
   
  }
  useEffect(()=>{
      if(startDate){
         setByStartDate(true)
      }
      if(endDate){
         setByEndDate(true)
      }
  },[])
  return (
    <div className={styles.container}>
    <span className={styles.title}>Filtre</span>
    <div className={styles.filtersContainer}>
  
     
  
        <div className={styles.filterContainer} >
           <div className={styles.titleContainer}>
              <label htmlFor='check-box-etat-compte'>Par date de debut</label>
              <Input type='checkbox' value={byStartDate} inputProps={{checked:byStartDate}} onChange={()=>setByStartDate(a=>!a)}/>
           </div>
           <Stack direction="row" justifyContent="center">
           <MobileDatePicker
                    label="date debut"
                    inputFormat="MM/DD/YYYY"
                    value={startDate}
                    disabled={!byStartDate}
                    onChange={(value)=>setStartDate(value ?? dayjs())}
                    renderInput={(params) => <TextField size="small"  {...params} />}
                    />

           </Stack>
          
     
        </div>
        <div className={styles.filterContainer} >
           <div className={styles.titleContainer}>
              <label htmlFor='check-box-etat-compte'>Par date de fin</label>
              <Input type='checkbox' value={byEndDate} inputProps={{checked:byEndDate}} onChange={()=>setByEndDate(a=>!a)}/>
           </div>
           <Stack direction="row" justifyContent="center">
                <MobileDatePicker
                    label="date fin"
                    inputFormat="MM/DD/YYYY"
                    value={endDate}
                    disabled={!byEndDate}
                    onChange={(value)=>setEndDate(value ?? dayjs())}
                    renderInput={(params) => <TextField size="small"  {...params} />}
                    />


           </Stack>
          
     
        </div>
    </div>
    
        <Stack direction="row" className={styles.actionButtons}>
          <Button disabled={!byStartDate && !byEndDate}  onClick={()=>handleSubmitFilters()}>Appliquer</Button>
          
            <Button onClick={()=>handleClose()}>Fermer</Button>
        </Stack>
</div>
  )
}

export default ChangeDate