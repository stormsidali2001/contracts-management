import { Button, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react'
import styles from './ExecutionModal.module.css'

const ExecutionModal = () => {
    const [startDate,setStartDate] = useState<any>('2022-04-20')
    const [endDate,setEndDate] = useState<any>('2022-04-20');
    const [observation,setObservation] = useState<any>('')
  return (
    <div className={styles.container}>
        <Stack gap={4}>
            <Typography className={styles.title}>Execution de Contrat</Typography>
            <Stack direction="row"  justifyContent="space-around">
                <TextField type="date" label="date de debut" size="small" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
                <TextField type="date" label="date de fin" size="small" value={endDate} onChange={e=>setEndDate(e.target.value)}/>
            </Stack>
            <TextField
                label = 'observation'
                multiline
                rows={3}
                maxRows = {5}
                value={observation}
                onChange={(e)=>setObservation(e.target.value)}
            />

          
         
            <Stack direction="row" gap={4} justifyContent="center">
                <Button size='small' variant="contained">Executer</Button>
                <Button size='small'>Annuller</Button>
            </Stack>

        </Stack>


    </div>
  )
}

export default ExecutionModal
