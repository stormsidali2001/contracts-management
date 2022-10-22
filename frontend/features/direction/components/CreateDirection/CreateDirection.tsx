import { Button, CircularProgress, Fab, Modal, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import useInput from '../../../../hooks/input/use-input';
import { validateDepartementAbriviationLength, validateDepartementTitleLength } from '../../../../shared/utils/validation/length';
import styles from './CreateDirection.module.css';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useState } from 'react';
import { Departement } from '../../models/departement.interface';
import CreateDepartement from '../CreateDepartement/CreateDepartement';
import { Direction } from '../../models/direction.interface';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';


interface PropTypes{
  pushDirection:(direction:Direction)=>void,
  handleDirectionModalClose:()=>void
}
const CreateDirection = ({
  pushDirection,
  handleDirectionModalClose
}:PropTypes) => {
    const axiosPrivate = useAxiosPrivate();
    const [openDepartementModal, setOpenDepartementModal] = useState(false);
    const [departements,setDepartements]= useState<Departement[]>([])
    
    const handleCloseDepartementModal = () => setOpenDepartementModal(false);
    const handleOpenDepartementModal = ()=>setOpenDepartementModal(true)
    const pushDepartementToDirection = (departement:Departement,selectedDirectionId?:string)=>{
      setDepartements(dpts=>[...dpts,departement])
    }
    const {
      text:title ,
      inputBlurHandler:titleBlurHandler,inputClearHandler:titleClearHandler,textChangeHandler:titleChangeHandler,
      shouldDisplayError:titleShouldDisplayError
  } = useInput(validateDepartementTitleLength);
  const {
      text:abriviation ,
      inputBlurHandler:abriviationBlurHandler,inputClearHandler:abriviationClearHandler,textChangeHandler:abriviationChangeHandler,
      shouldDisplayError:abriviationShouldDisplayError
  } = useInput(validateDepartementAbriviationLength);

  const dispatch = useAppDispatch();

  const [isLoading,setIsLoading]  = useState(false);
  const [isSuccess,setIsSuccess] = useState(false);


  const handleSubmit = (e:any)=>{
    e.preventDefault();
    if(!title || !abriviation || !departements) return;
    try{
      setIsLoading(true)
      axiosPrivate.post("http://localhost:8080/api/directions",{
        title,
        abriviation,
        departements
      })
      .then(res=>{
        setIsLoading(false)
        setIsSuccess(true)
        pushDirection({
          title,
          abriviation,
          departements,
          id:Date.now().toString()
        })
        handleDirectionModalClose()

        dispatch(showSnackbar({message:"la direction a été creé avec success." ,severty:"success"}))

      })
      .catch(err=>{
        console.error(err)
        setIsSuccess(false)
        setIsLoading(false)
        dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
      })
      
    }catch(err){
      console.error(err)
    }
  }
  return (
    <div className={styles.container}>
          <form onSubmit={handleSubmit}>
            {
                isLoading?(
                    <>
                    <Stack alignItems = "center" gap={2}>
                      <Typography>Creation de  Direction...</Typography>
                      <CircularProgress/>
                    </Stack>
                  </>
                    
                ):(
                  isSuccess?(
                    <>
                      <Typography>Direction cree</Typography>
                      <Fab
                      aria-label="save"
                      color="secondary"
                      size="small"
                      sx={{boxShadow:"none"}}
                      >
                      <CheckIcon sx={{ color:"white"}}/> 
                    </Fab>
                    </>
                  ):(
                    <>
                      <Stack className={styles.formElementsWrapper}>
                            <Typography className={styles.title} variant='h4' sx={{fontWeight:'400'}}>Nouvelle direction</Typography>
                            <TextField 
                                value={title} 
                                onChange={titleChangeHandler} 
                                onBlur={titleBlurHandler}
                                size='small' 
                                label = "Titre"
                                error={titleShouldDisplayError}
                                helperText = {titleShouldDisplayError && "min caracteres: 5 , max caracteres: 15"}
                            />
                            <TextField 
                                value={abriviation} 
                                onChange={abriviationChangeHandler} 
                                onBlur={abriviationBlurHandler}
                                size='small' 
                                label = "Mnemonique"
                                error={abriviationShouldDisplayError}
                                helperText = {abriviationShouldDisplayError && "min caracteres: 2 , max caracteres: 5"}
                            />
                        </Stack>
                     
                        <Stack className={styles.departementsContainer}>
                            <Stack direction="row" className={styles.departementsTitleWrapper}>
                            <Typography sx={{color:"#807D7D",paddingLeft:"10px"}}>Departements</Typography>
                                        <Button><AddCircleIcon onClick={()=>handleOpenDepartementModal()}/></Button>
                            </Stack>
                            <Stack className={styles.departements}>
                              {
                                departements.map((d,index)=>{
                                  return (
                                    <Stack direction="row" gap={2}>
                                      <Typography>{`${index+1}- ${d?.title}`}</Typography>
                                      <Typography sx={{fontSize:"500"}}>{`(${d?.abriviation})`}</Typography>
                                    </Stack>
                                  )
                                })
                              }
                            </Stack>
                        </Stack>
            
                    </>
                 
                  )

                )
              }
        

            <Stack direction="row" className={styles.actionButtonsContainer}>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="secondary"
                        disabled = {
                        title.length === 0 
                        || abriviation.length === 0 
                        || titleShouldDisplayError 
                        || abriviationShouldDisplayError
                        || isSuccess
                        || isLoading
                      }
                >Creer</Button>
                {
                  
                }
                <Button 
                  disabled={  
                    isSuccess
                    || isLoading
                  } 
                  onClick={()=>{handleDirectionModalClose()}}>Fermer</Button>
            </Stack>
        </form>
        <Modal
            open={openDepartementModal}
            onClose={handleCloseDepartementModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
      >
        <CreateDepartement  
            pushDepartementToDirection={pushDepartementToDirection}
            linkToDirectionAsync={false}
            handleCloseDepartementModal={handleCloseDepartementModal}
        />
      </Modal>
    </div>
  )
}

export default CreateDirection