import { Button, Input, Stack, TextField } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'
import { useAppSelector } from '../../../../../hooks/redux/hooks'
import styles from './ChangeDate.module.css'
interface PropType{
    start_date:Dayjs | null;
    end_date:Dayjs | null;
}
const ChangeDate = ({start_date,end_date}:PropType) => {
  const [byStartDate,setByStartDate] = useState(false)
  const [byEndDate,setByEndDate] = useState(false)
  const [startDate,setStartDate] = useState(start_date)
  const [endDate,setEndDate] = useState(end_date)

  const handleSubmitFilters = ()=>{
    
  }
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
                    onChange={(value)=>setStartDate(value ?? dayjs(""))}
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
                    onChange={(value)=>setEndDate(value ?? dayjs(""))}
                    renderInput={(params) => <TextField size="small"  {...params} />}
                    />


           </Stack>
          
     
        </div>
    </div>
    
        <Stack direction="row" className={styles.actionButtons}>
          <Button  onClick={()=>0}>Appliquer</Button>
          
            <Button onClick={()=>0}>Fermer</Button>
        </Stack>
</div>
  )
}

export default ChangeDate