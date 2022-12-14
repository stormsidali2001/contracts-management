import { Accordion, AccordionDetails, AccordionSummary, Button, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import styles from './DirectionContent.module.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { useEffect, useState } from 'react';
import { Stack } from '@mui/system';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Direction, DisplayDirection } from '../../models/direction.interface';
import CreateDepartement from '../CreateDepartement/CreateDepartement';
import { Departement } from '../../models/departement.interface';
import CreateDirection from '../CreateDirection/CreateDirection';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import { UserRole } from '../../../auth/models/user-role.enum';
import DepartementUsersList from '../DepartementUsersList/DepartementUsersList';


const DirectionContent = () => {
  const [openDepartementUsers,setOpenDepartementUsers] = useState(false)
  const [choosenDepartementId,setChoosenDepartementId] = useState('')
  const handleOpenDepartementUsersModal = ()=>setOpenDepartementUsers(true)
  const handleCloseDepartementUsersModal = ()=>setOpenDepartementUsers(false)
  const {user} = useAppSelector(state=>state.auth)
  const axiosPrivate = useAxiosPrivate({});
  const [directions,setDirections] = useState<Direction[]>([]);
  const dispatch = useAppDispatch();
  //departement modal state ----------------
  const [openDepartementModal, setOpenDepartementModal] = useState(false);
  const [selectedDirectionId , setSelectedDirectionId] = useState<string | null>(null);
  
  //direction modal state ----------------
  const [openDirectionModal, setOpenDirectionModal] = useState(false);

  useEffect(()=>{
    const abortController = new AbortController()
    axiosPrivate.get("http://localhost:8080/api/directions?offset=0&limit=10",{
        signal:abortController.signal
    })
    .then(res=>{
        setDirections(res?.data)
    })
    .catch(err=>{
        console.log(err);
    })

    return ()=>{
        abortController.abort();
    }
  },[])

  const handleDirectionModalOpen = ()=>setOpenDirectionModal(true)
  const handleDirectionModalClose = ()=>setOpenDirectionModal(false)
  const pushDirection = (direction:Direction)=>{
      setDirections(d=>[...d,direction])
  }

  const handleCloseDepartementModal = () => setOpenDepartementModal(false);
  const pushDepartementToDirection = (departement:Departement,selectedDirectionId?:string)=>{
    const newDirections = [...directions];
    const index = newDirections.findIndex(d=>d.id === selectedDirectionId)
    newDirections[index].departements.push({...departement})

    setDirections(newDirections)
  }
  const handleOpenDepartementModal = (directionId:string)=>{
    setOpenDepartementModal(true)
    setSelectedDirectionId(directionId)

  }
  const handleDeleteDepartement =  (id:string,directionId:string)=>{
     
     axiosPrivate.delete("/departements/"+id)
     .then(res=>{
        const directionIndex = directions.findIndex(d=>d.id === directionId);
        if(directionIndex < 0) return;
        const newDirections = [...directions];
        newDirections[directionIndex].departements = newDirections[directionIndex].departements.filter(d=>d.id !== id);
        setDirections(newDirections);
        dispatch(showSnackbar({message:"la suppression de departement a reusi",severty:"success"}))
     })
     .catch(err=>{
      dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
     })

  }
  const handleDeleteDirection =  (directionId:string)=>{
     
     axiosPrivate.delete("/directions/"+directionId)
     .then(res=>{
        
        const newDirections = directions.filter(d=>d.id != directionId);
        setDirections(newDirections);
        dispatch(showSnackbar({message:"la suppression de la direction a reusi",severty:"success"}))
     })
     .catch(err=>{
      dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
     })

  }

  const dispalayIfAdmin = ()=>{
    if(!user) return false;
    return user.role === UserRole.ADMIN;
  }

  const handleShowDepartementUsers = (departementId:string)=>{
    handleOpenDepartementUsersModal();
    setChoosenDepartementId(departementId);
  }
  return (
    <div className={styles.container}>
        <div className={styles.wrapperBox}>
             <Stack direction="row" className={styles.departementsTitleWrapper}>
             <Typography sx={{color:"#807D7D",paddingLeft:"10px"}}>Directions</Typography>
                       { 
                       dispalayIfAdmin() &&<Button onClick={()=>handleDirectionModalOpen()}><AddCircleIcon /></Button>
                       }
            </Stack>
            <div className={styles.directionsWrapper}>
            {
                directions.map((direction,index)=>{
                    return (
                        <Accordion key={index}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <div className={styles.accordingContainer}>
                            <Typography>{direction?.title}</Typography>
                            <div className={styles.actionButtons}>
                               
                               {
                                dispalayIfAdmin()&&(
                                <Button onClick={(e)=>e.stopPropagation()}>
                                    <DeleteIcon onClick={()=>handleDeleteDirection(direction?.id ?? "")}/>
                                </Button>
                                )
                               }
                            </div>
                          </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack>
                                
                                <Stack direction="row" className={styles.departementsTitleWrapper}>
                                    <Typography >Departements</Typography>
                                    
                                   { dispalayIfAdmin() &&<Button onClick={()=>handleOpenDepartementModal(direction.id)}><AddCircleIcon/></Button>}
                                      
                                </Stack>
                                <TableContainer className={styles.departementsWrapper} >
                                    <Table  aria-label="simple table" >
                                        <TableHead>
                                        <TableRow>
                                            <TableCell align="left">titre</TableCell>
                                            <TableCell align="left">Mnemonique</TableCell>
                                            <TableCell align="left">utilisateurs</TableCell>
                                            <TableCell align="center">details</TableCell>
                                            {
                                              dispalayIfAdmin()&&(
                                                <TableCell align="center" >delete</TableCell>
                                              )
                                            }
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {direction?.departements?.map((row,index) => (
                                            <TableRow
                                            key={index}
                                            >
                                         
                                            <TableCell align="left">{row.title}</TableCell>
                                            <TableCell align="left">{row.abriviation}</TableCell>
                                            <TableCell align="left">{row.users}</TableCell>
                                            <TableCell align="center"><Button onClick={()=>handleShowDepartementUsers(row?.id ?? "" )}>Details</Button></TableCell>
                                            {
                                              dispalayIfAdmin()&&(
                                                <TableCell align="center">
                                                  <Button onClick={()=>handleDeleteDepartement(row?.id ?? "",direction?.id ?? "")}><DeleteIcon/></Button>
                                                  </TableCell>
                                               
                                              )
                                            }
                                          </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                    </TableContainer>
                           </Stack>
                        </AccordionDetails>
                      </Accordion>
                    )
                })
            }
            </div>
      
     
        </div>
        <Modal
            open={openDepartementModal}
            onClose={handleCloseDepartementModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
      >
        <CreateDepartement 
            selectedDirectionId={selectedDirectionId} handleCloseDepartementModal={handleCloseDepartementModal}
            pushDepartementToDirection={pushDepartementToDirection}
        />
      </Modal>

      <Modal
            open={openDirectionModal}
            onClose={handleDirectionModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
      >
       
        <CreateDirection pushDirection={pushDirection} handleDirectionModalClose={handleDirectionModalClose}/>
      </Modal>

      <Modal
        open={openDepartementUsers}
        onClose={handleCloseDepartementUsersModal}
        aria-labelledby="departement-users-modal-modal-title"
        aria-describedby="departement-users-modal-modal-description"

      >
        <DepartementUsersList
          departementId={choosenDepartementId}
          handleClose={handleCloseDepartementUsersModal}
        />
      </Modal>
    </div>
  )
}

export default DirectionContent