import { Button, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import useInput from '../../../../hooks/input/use-input';
import { validateDepartementAbriviationLength, validateDepartementTitleLength } from '../../../../shared/utils/validation/length';
import styles from './CreateDepartement.module.css';
import axios from 'axios';
import { Departement } from '../../models/departement.interface';
const CreateDepartement = ({
    selectedDirectionId,
    handleCloseDepartementModal,
    pushDepartementToDirection,
    linkToDirectionAsync = true}:{
    selectedDirectionId?:string | null,
    handleCloseDepartementModal:()=>void,
    pushDepartementToDirection:(departement:Departement,selectedDirectionId?:string,)=>void,
    linkToDirectionAsync?:boolean 
}) => {
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

    const handleSubmit = (e:any)=>{
        e.preventDefault();
        if(!title || !abriviation || !selectedDirectionId) return;
        const departement = {
            directionId:selectedDirectionId,
            title,
            abriviation
        }
        if(linkToDirectionAsync){

            axios.post('http://localhost:8080/api/departements',{
               ...departement
            })
            .then(res=>{    
                console.log("create departement response",res)
                pushDepartementToDirection({ 
                    title,
                    abriviation,
                    users:0
                },selectedDirectionId)
                handleCloseDepartementModal();
    
            })
            .catch(err=>{
                console.error(err);
            })
        }else{

        }
    }
  return (
    <div className={styles.container}>
        <form onSubmit={handleSubmit}>
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
            <Stack direction="row" className={styles.actionButtonsContainer}>
                <Button 
                    type="submit" 
                    variant="contained" 
                    color="secondary"
                        disabled = {
                        title.length === 0 
                        || abriviation.length === 0 
                        || titleShouldDisplayError 
                        || abriviationShouldDisplayError}
                >Creer</Button>
                <Button onClick={()=>handleCloseDepartementModal()}>Annuler</Button>
            </Stack>
        </form>
    </div>
  )
}

export default CreateDepartement