import { Button, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react'
import styles from './ExecutionModal.module.css'
import axios from '../../../../api/axios'
import { ExecuteAgreement } from '../../models/ExecuteAgreement.interface';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import { useRouter } from 'next/router';
const format = (d:Date)=>{
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g,"");

}
function getTomorrow(d:Date){
    d.setHours(0,0,0,0)
    d.setDate(d.getDate()+1)
    return d;
}
interface PropType{
    agreementId:string;
    handleClose:()=>void;
    type:"contract" | "convension"
}
const ExecutionModal = ({agreementId,handleClose,type }:PropType) => {
    const [startDate,setStartDate] = useState<any>(format(new Date(Date.now())))
    const [endDate,setEndDate] = useState<any>(format(getTomorrow(new Date(Date.now()))));
    const [observation,setObservation] = useState<any>('');
    const dispatch = useAppDispatch();
    const router = useRouter();
    const handleAgreementExecution = ()=>{
        const newExecAgreement:ExecuteAgreement = {
            execution_start_date:format(startDate),
            execution_end_date:format(endDate),
            agreementId,
            observation
        }
         axios.patch('/Agreements/exec',{...newExecAgreement})
         .then(res=>{
             handleClose()
             dispatch(showSnackbar({message:`${type === 'contract' ?"le contrat":"la convension"} a eté${type === 'contract'?'':'e'}`}))
             setTimeout(()=>{
                 router.reload()
             },1000)

         })
         .catch(err=>{
             //@ts-ignore
            dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
         })

    }
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
                <Button size='small' variant="contained" onClick={()=>handleAgreementExecution()}>Executer</Button>
                <Button size='small' onClick={()=>handleClose()}>Annuller</Button>
            </Stack>

        </Stack>


    </div>
  )
}

export default ExecutionModal
