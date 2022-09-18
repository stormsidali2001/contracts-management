import { Button, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import useInput from '../../../../hooks/input/use-input';
import { validateDepartementAbriviationLength, validateDepartementTitleLength } from '../../../../shared/utils/validation/length';
import styles from './CreateDirection.module.css';

const CreateDirection = () => {
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
                <Button >Annuler</Button>
            </Stack>
        </form>
    </div>
  )
}

export default CreateDirection