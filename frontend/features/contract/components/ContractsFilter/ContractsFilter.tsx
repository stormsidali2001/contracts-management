import { Button, FormControl, Input, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { DatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { UserRole } from '../../../auth/models/user-role.enum';
import { Direction } from '../../../direction/models/direction.interface';
import { showSnackbar } from '../../../ui/UiSlice';
import styles from './ContractsFilter.module.css';
enum  AgreementStatus{
    executed = 'executed' ,
    executed_with_delay = 'executed_with_delay',
    in_execution = 'in_execution',
    in_execution_with_delay = 'in_execution_with_delay',
    not_executed = 'in_execution_with_delay'

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
  start_date?:string;
  end_date?:string;
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

  const [isByAmount,setIsByAmount] = useState(false)
  const [minAmount,setMinAmount] = useState(0)
  const [maxAmount,setMaxAmount] = useState(0)
  const [selectedStatus,setSelectedStatus] = useState({label:'not_executed',value:'not_executed'})
  const [isByStatus,setIsByStatus] = useState(false)
  const [startDate, setStartDate] = useState<Dayjs>(
    dayjs(new Date()),
  );
  const [endDate, setEndDate] = useState<Dayjs>(
      dayjs(new Date()),
    );
  const {user} = useAppSelector(state=>state.auth)
  const shouldDisplayFilter = ()=>{
    return user?.role === UserRole.ADMIN || user?.role === UserRole.JURIDICAL;
  }
  const [isByDate,setIsByDate] = useState(false);
  const [isByDirection,setIsByDirection] = useState(false);

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
      console.error(err,"t2");
    })
    return ()=>{
      abortController.abort();
    }
  },[])

 const handleByDirectionChange = ()=>{

  setIsByDirection(d=>!d)
 }

 const handleSubmitFilters = ()=>{
    const format = (d:Date)=>{
        const newD = new Date(d);
        return newD.toISOString().replace(/T[0-9:.Z]*/g,"");
    
    }
    const filters:Filters = {};
    if(isByDirection) {
        filters.directionId = selectedDirection.value;
        filters.departementId = selectedDepartement.value;
    }
    if(isByDate){
        filters.start_date = format(startDate.toDate());
        filters.end_date = format(endDate.toDate());
    }
    if(isByStatus){
        filters.status = selectedStatus.value as unknown as AgreementStatus;
    }

    if(isByAmount){
        filters.amount_min = minAmount;
        filters.amount_max = maxAmount;
    }
    handleSetFilters(filters)
    handleClose();

 }

 useEffect(()=>{
  if(initialFilters.directionId && initialFilters.departementId){
    setIsByDirection(true)
    const selectedDirection = directions.find(d=>d.id === initialFilters.directionId);
    setSelectedDirection({label:selectedDirection?.abriviation ?? "",value:initialFilters.directionId});
    const selectedDepartement = selectedDirection?.departements.find(dp=>dp.id === initialFilters.departementId);
    setSelectedDepartement({value:initialFilters.departementId , label:selectedDepartement?.abriviation ?? ""})
  }

  if(initialFilters.amount_min!== undefined && initialFilters.amount_max !== undefined){
      setIsByAmount(true)
      setMinAmount(initialFilters.amount_min)
      setMaxAmount(initialFilters.amount_max)
  }
  if(initialFilters.start_date && initialFilters.end_date){
    setIsByDate(true)
    setStartDate( dayjs(initialFilters.start_date) )
    setEndDate(  dayjs(initialFilters.end_date))
  }
  if(initialFilters.status){
    setIsByStatus(true)
    setSelectedStatus({label:initialFilters.status,value:initialFilters.status})
  }
 },[])
  return (
    <div className={styles.container}>
        <span className={styles.title}>Filtre</span>
        <div className={styles.filtersContainer}>
      
           { shouldDisplayFilter() &&(<div className={styles.filterContainer} >
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
            </div>)
            }
            <div className={styles.filterContainer} >
               <div className={styles.titleContainer}>
                  <label htmlFor='check-box-direction'>Par date:</label>
                  <Input id='check-box-direction' type='checkbox' value={isByDate} inputProps={{checked:isByDate,}}  onChange={()=>setIsByDate(d=>!d)}/>
               </div>
              
               <Stack direction="row" justifyContent="center" gap={3} sx={{marginTop:"10px"}}>
               
   
       
               <MobileDatePicker
               label="date de debut"
               inputFormat="MM/DD/YYYY"
               value={startDate}
               disabled={!isByDate}
               onChange={(value)=>setStartDate(value ?? dayjs(""))}
               renderInput={(params) => <TextField size="small" {...params} />}
               />
 
               <MobileDatePicker
               label="date end"
               inputFormat="MM/DD/YYYY"
               value={endDate}
               disabled={!isByDate}
               onChange={(value)=>setEndDate(value ?? dayjs(""))}
               renderInput={(params) => <TextField size="small"  {...params} />}
               />


           </Stack>
            </div>
         
            <div className={styles.filterContainer} >
               <div className={styles.titleContainer}>
                  <label htmlFor='check-box-direction'>Par Status:</label>
                  <Input id='check-box-direction' type='checkbox' value={isByStatus} inputProps={{checked:isByStatus,}}  onChange={()=>setIsByStatus(s=>!s)}/>
               </div>
              
              <Stack direction="row" justifyContent="center" gap={5}>
              <FormControl className={styles.selectFormControl}>
                <InputLabel id="direction-input-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status-id"
                  value={selectedStatus?.value ??""}
                  label="status"
                  size="small"
                  onChange={(e:any)=>setSelectedStatus({value:e.target.value,label:e.target.value})}
                  disabled = {!isByStatus}
                  fullWidth
                >
                   

                  {
                    Object.keys(AgreementStatus).map((k,index)=>{
                        return (
                            <MenuItem key={index} value={k} >{k}</MenuItem>
                        )
                    })
                  }
                       
                     
              
                </Select>
            </FormControl>
           
            </Stack>
            </div>

            <div className={styles.filterContainer} >
               <div className={styles.titleContainer}>
                  <label htmlFor='check-box-direction'>Par Montant:</label>
                  <Input id='check-box-direction' type='checkbox' value={isByAmount} inputProps={{checked:isByAmount,}}  onChange={()=>setIsByAmount(d=>!d)}/>
               </div>
              
               <Stack direction="row" justifyContent="center" gap={3} sx={{marginTop:"10px"}}>
               
   
       
                <TextField 
                    value={minAmount} 
                    sx={{width:"200px"}}
                    size="small" 
                    label="min montant"
                    type="number"
                    onChange={(e)=>setMinAmount(parseInt(e.target.value))}
                    inputProps={{
                        min:0,
                        max:maxAmount
                    }}
                    disabled={!isByAmount}
                />
                <TextField 
                    value={maxAmount}
                    sx={{width:"200px"}}
                    onChange={(e)=>setMaxAmount(parseInt(e.target.value))}
                    size="small" 
                    label="max montant"
                    type="number"
                    inputProps={{
                        min:minAmount,
                        max:6000
                    }}
                    disabled={!isByAmount}
                />


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