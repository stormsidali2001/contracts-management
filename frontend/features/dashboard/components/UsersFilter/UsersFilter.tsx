import { Button, FormControl, Input, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { UserRole } from '../../../auth/models/user-role.enum';
import { Direction } from '../../../direction/models/direction.interface';
import { showSnackbar } from '../../../ui/UiSlice';
import styles from './UsersFilter.module.css';

interface Filters{
  directionId?:string;
  departementId?:string;
  active?:"active"| "not_active";
  role?:UserRole;
}
interface PropType{
    handleClose:Function,
    handleSetFilters:(filters:Filters)=>void,
    initialFilters:Filters
}
const UsersFilter = ({handleSetFilters,handleClose,initialFilters}:PropType) => {
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useAppDispatch();

  const [isByRole,setIsByRole] = useState(false);
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
     
    })
    return ()=>{
      abortController.abort();
    }
  },[])

 const handleByDirectionChange = ()=>{
  if(isByRole &&(role === 'ADMIN' || role === 'JURIDICAL')) {
    setIsByDirection(false);
    return;
  }
  setIsByDirection(d=>!d)
 }

 const handleSubmitFilters = ()=>{
    const filters:any = {};
    if(isByRole) filters.role = role;
    if(isByDirection){
      filters.directionId = selectedDirection.value;
      filters.departementId = selectedDepartement.value;
    }
    if(accountState) filters.active = isActive?"active":"not_active";
    handleSetFilters({...filters})
    handleClose();

 }

 useEffect(()=>{
    if(initialFilters.role){
        setIsByRole(true)
        setRole(initialFilters.role)
    }

    if(initialFilters.active){
      setAccountState(true)
      setIsActive(true)
    }
    if(initialFilters.directionId && initialFilters.departementId){
      setIsByDirection(true)
      const selectedDirection = directions.find(d=>d.id === initialFilters.directionId);
      setSelectedDirection({label:selectedDirection?.abriviation ?? "",value:initialFilters.directionId});
      const selectedDepartement = selectedDirection?.departements.find(dp=>dp.id === initialFilters.departementId);
      setSelectedDepartement({value:initialFilters.departementId , label:selectedDepartement?.abriviation ?? ""})
    }
 
 },[])
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
                    getDepartementsFromDirections().map((dp,index)=>{
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
                  <label htmlFor='check-box-role'>Par Role:</label>
                  <Input id='check-box-role' type='checkbox' value={isByRole} inputProps={{checked:isByRole}} onChange={()=>setIsByRole(r=>!r)}/>
               </div>
              
              <Stack direction="row" justifyContent="center" gap={5}>
              <FormControl className={styles.selectFormControl}>
                <InputLabel id="role-input-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role-id"
                  value={role}
                  label="role"
                  size="small"
                  onChange={handleRoleChange}
                  disabled = {!isByRole}
                  fullWidth
                >
                  <MenuItem value={'EMPLOYEE'}>Employee</MenuItem>
                  <MenuItem value={'ADMIN'}>Admin</MenuItem>
                  <MenuItem value={'JURIDICAL'}>Juridique</MenuItem>
                </Select>
              </FormControl>
      
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

export default UsersFilter