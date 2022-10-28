import { Button, FormControl, Input, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { DatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { UserRole } from '../../../auth/models/user-role.enum';
import { Direction } from '../../../direction/models/direction.interface';
import { showSnackbar } from '../../../ui/UiSlice';
import styles from './ContractsFilter.module.css';
interface AgreementStatus{
    executed:number;
    executed_with_delay:number;
    in_execution:number;
    in_execution_with_delay:number;
    not_executed:number;
}
/*
    filter by :
    by direction
    by expiration|signature date
    by amount
    by status

*/
interface Filters{
  directionId?:string;
  departementId?:string;
  expiration_date?:string;
  signature_date?:string;
  amount_min?:number;
  amount_max?:number;
  status?:AgreementStatus

}
interface PropType{
    handleClose:Function,
    handleSetFilters:(filters:Filters)=>void,
    initialFilters:Filters
}
const ContractsFilter = ({handleSetFilters,handleClose,initialFilters}:PropType) => {
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useAppDispatch();

  const [signatureDate, setSignatureDate] = useState<Dayjs>(
    dayjs(new Date()),
  );
const [expirationDate, setExpirationDate] = useState<Dayjs>(
    dayjs(new Date()),
  );
  const [isByDate,setIsByDate] = useState(false);
  const [isByDirection,setIsByDirection] = useState(false);
  const [accountState,setAccountState] = useState(false);
  const [isActive,setIsActive] = useState(false)

  const [role,setRole] = useState('EMPLOYEE')
  const [directions,setDirections] = useState<Direction[]>([]);
  const [selectedDirection,setSelectedDirection] = useState<{label:string,value:string}>({label:"",value:""})
  const [selectedDepartement,setSelectedDepartement] = useState<{label:string,value:string}>({label:"",value:""});
  const handleDirectionChange = (event: SelectChangeEvent)=>{
    const directionId = event.target.value;
    const directionIndex = directions.findIndex(d=>d.id === directionId);
    if(directionIndex < 0 ) return ;
    const direction = directions[directionIndex];
    setSelectedDirection({label:direction?.title, value:directionId});
    console.log("selected direction: ",direction)
    if(direction.departements.length === 0 ) return;
    const departement = direction.departements[Math.floor(Math.random()*(direction.departements.length-1))];
    console.log("random departement",departement)
    setSelectedDepartement({label:departement?.title , value:departement.id as string})
  }
  const handleChangeDepartement = (event: SelectChangeEvent)=>{
    const departementId = event.target.value;
    const departements =  getDepartementsFromDirections();
    const directionIndex = departements.findIndex(d=>d.id === departementId);
    const departement = departements[directionIndex];
    if(directionIndex < 0 ) return ;
    setSelectedDepartement({label:departement.title , value:departementId})

  }
  function getDepartementsFromDirections(){
    if(directions.length === 0) return [];
    const directionId =selectedDirection?.value;
    const directionIndex = directions.findIndex(d=>d.id === directionId);
    if(directionIndex < 0 ) return [];
    return directions[directionIndex].departements;
  }
  const handleRoleChange = (event: SelectChangeEvent) => {
    if(event.target.value === 'ADMIN' || event.target.value === 'JURIDICAL'){
      setIsByDirection(false)
    }
    setRole(event.target.value as string);
  };
  useEffect(()=>{
    const abortController = new AbortController();
    axiosPrivate.get("http://localhost:8080/api/directions",{
      signal:abortController.signal
    }).then(res=>{
      const newDirections = res.data;
      setDirections(newDirections)
      if(newDirections.length ===0 ) return;
      const direction:Direction = newDirections[Math.floor(Math.random()*(newDirections.length-1))];
      setSelectedDirection({label:direction?.title, value:direction.id});
      console.log("selected direction: ",direction)
      if(direction.departements.length === 0 ) return;
      const departement = direction.departements[Math.floor(Math.random()*(direction.departements.length-1))];
      console.log("random departement",departement)
      setSelectedDepartement({label:departement?.title , value:departement.id as string})
      console.log(res.data,"t2")
    })
    .catch(err=>{
      console.error(err,"t2")
      if(err.code !== "ERR_CANCELED"){

        dispatch(showSnackbar({message:"verifiez si vous etes en ligne"}))
      }
     
    })
    return ()=>{
      abortController.abort();
    }
  },[])

 const handleByDirectionChange = ()=>{

  setIsByDirection(d=>!d)
 }

 const handleSubmitFilters = ()=>{
   
    handleClose();

 }


  return (
    <div className={styles.container}>
        <span className={styles.title}>Filtre</span>
        <div className={styles.filtersContainer}>
      
            <div className={styles.filterContainer} >
               <div className={styles.titleContainer}>
                  <label htmlFor='check-box-direction'>Par direction:</label>
                  <Input id='check-box-direction' type='checkbox' value={isByDirection} inputProps={{checked:isByDirection,}}  onChange={()=>handleByDirectionChange()}/>
               </div>
              
              <Stack direction="row" justifyContent="center" gap={5}>
              <FormControl className={styles.selectFormControl}>
                <InputLabel id="direction-input-label">Direction</InputLabel>
                <Select
                  labelId="direction-label"
                  id="direction-id"
                  value={selectedDirection?.value ??""}
                  label="direction"
                  size="small"
                  onChange={handleDirectionChange}
                  disabled = {!isByDirection}
                  fullWidth
                >
                  {
                    directions.map((dr,index)=>{
                      return (
                        <MenuItem value={dr?.id ?? ""} key={index}>{dr.abriviation ?? ""}</MenuItem>
                      )
                    })
                  }
              
                </Select>
            </FormControl>
            <FormControl className={styles.selectFormControl}>
                <InputLabel id="direction-input-label">Departement</InputLabel>
                <Select
                  labelId="direction-label"
                  id="direction-id"
                  value={selectedDepartement?.value }
                  label="direction"
                  size="small"
                  onChange={handleChangeDepartement}
                  disabled = {!isByDirection}
                  fullWidth
                >
                  {
                    getDepartementsFromDirections().map((dp:any,index:any)=>{
                      return (
                        <MenuItem value={dp?.id} key={index}>{dp?.abriviation}</MenuItem>
                      )
                    })
                  }
              
                </Select>
            </FormControl>
            </Stack>
            </div>
            <div className={styles.filterContainer} >
               <div className={styles.titleContainer}>
                  <label htmlFor='check-box-direction'>Par date:</label>
                  <Input id='check-box-direction' type='checkbox' value={isByDate} inputProps={{checked:isByDate,}}  onChange={()=>setIsByDate(d=>!d)}/>
               </div>
              
               <Stack direction="row" justifyContent="center" gap={3} sx={{marginTop:"10px"}}>
               
   
       
               <MobileDatePicker
               label="date de signature"
               inputFormat="MM/DD/YYYY"
               value={signatureDate}
               onChange={(value)=>setSignatureDate(value ?? dayjs(""))}
               renderInput={(params) => <TextField size="small" {...params} />}
               />
 
               <MobileDatePicker
               label="date d'expiration"
               inputFormat="MM/DD/YYYY"
               value={expirationDate}
               onChange={(value)=>setExpirationDate(value ?? dayjs(""))}
               renderInput={(params) => <TextField size="small"  {...params} />}
               />


           </Stack>
            </div>
      
         
            <div className={styles.filterContainer} >
               <div className={styles.titleContainer}>
                  <label htmlFor='check-box-etat-compte'>Par Etat compte:</label>
                  <Input type='checkbox' value={accountState} inputProps={{checked:accountState}} onChange={()=>setAccountState(a=>!a)}/>
               </div>
               <Stack direction="row" gap={2}>
               <label htmlFor='check-box-etat-compte'>Active:</label>
                  <Input type='checkbox' disabled={!accountState} value={isActive} inputProps={{checked:isActive}} onChange={()=>setIsActive(a=>!a)}/>

               </Stack>
              
         
            </div>
        </div>
        
            <Stack direction="row" className={styles.actionButtons}>
              <Button  onClick={()=>handleSubmitFilters()}>Appliquer</Button>
              
                <Button onClick={()=>handleClose()}>Fermer</Button>
            </Stack>
    </div>
  )
}

export default ContractsFilter