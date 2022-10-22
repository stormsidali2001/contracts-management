import { Button, CircularProgress, Fab, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import useInput from '../../../../hooks/input/use-input';
import { validateDepartementAbriviationLength, validateDepartementTitleLength } from '../../../../shared/utils/validation/length';
import styles from './CreateDepartement.module.css';
import axios from 'axios';
import { Departement } from '../../models/departement.interface';
import useAxiosPrivate from '../../../../hooks/auth/useAxiosPrivate';
import { useAppDispatch } from '../../../../hooks/redux/hooks';
import { showSnackbar } from '../../../ui/UiSlice';
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';

const CreateDepartement = ({
    selectedDirectionId,
    handleCloseDepartementModal,
    pushDepartementToDirection,
    linkToDirectionAsync = true}:{
    selectedDirectionId?:string | null,
    handleCloseDepartementModal:()=>void,
    pushDepartementToDirection:(departement:Departement ,selectedDirectionId?:string,)=>void,
    linkToDirectionAsync?:boolean 
}) => {
    const axiosPrivate = useAxiosPrivate();
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
    const [isLoading,setIsLoading] = useState(false)
    const [isSuccess,setIsSuccess] = useState(false)
    const dispatch = useAppDispatch();
    const handleSubmit = (e:any)=>{
        e.preventDefault();
        console.log(123,linkToDirectionAsync,title,abriviation)
        if(!title || !abriviation ) return;
        const departement = {
            directionId:selectedDirectionId,
            title,
            abriviation
        }
       
        if(linkToDirectionAsync && selectedDirectionId){

            setIsLoading(true)
            axiosPrivate.post('http://localhost:8080/api/departements',{
               ...departement
            })
            .then(res=>{    
                console.log("create departement response",res)
                const departementId = res.data.id;
                pushDepartementToDirection({ 
                    id:departementId,
                    title,
                    abriviation,
                    users:0
                },selectedDirectionId)
                dispatch(showSnackbar({message:"le deparartement a eté creé avec success",severty:"success"}))
                setIsSuccess(true)
                setIsLoading(false)
                setTimeout(()=>{
                    handleCloseDepartementModal();
                },2000)
    
            })
            .catch(err=>{
                console.error(err);
                setIsLoading(false)
                setIsSuccess(false)
                dispatch(showSnackbar({message:err?.response?.data?.error ?? "erreur iconu"}))
            })
        }else{
            pushDepartementToDirection({ 
                title,
                abriviation,
                users:0,
                id:new Date().toString()
            })
            handleCloseDepartementModal();
        }
    }
  return (
    <div className={styles.container}>
        <form onSubmit={handleSubmit}>
            {
                isLoading?(
                    <>
                        <Stack alignItems = "center" gap={2}>
                            <Typography>Creation de  departement...</Typography>
                            <CircularProgress/>
                        </Stack>
                    </>
                ):(
                    
                        isSuccess?(
                            <>
                            <Stack alignItems = "center" gap={2}>
                                <Typography>Departement cree</Typography>
                                <Fab
                                aria-label="save"
                                color="secondary"
                                size="small"
                                sx={{boxShadow:"none"}}
                                >
                                <CheckIcon sx={{ color:"white"}}/> 
                                 </Fab>
                             </Stack>
                            </>
                        ):(
                            <Stack className={styles.formElementsWrapper}>
                            <Typography className={styles.title} variant='h4' sx={{fontWeight:'400'}}>Nouveau departement</Typography>
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
                <Button  
                    disabled={  
                    isLoading
                  }  
                  onClick={()=>handleCloseDepartementModal()}
                  >Fermer</Button>
            </Stack>
        </form>
    </div>
  )
}

export default CreateDepartement