import { Button, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import useAxiosPrivate from '../../../hooks/auth/useAxiosPrivate';
import useInput from '../../../hooks/input/use-input'
import { validatePasswordLength } from '../../../shared/utils/validation/length';
import styles from './ChangePassword.module.css'


interface PropType{
    handleClose:()=>void
}
const ChangePassword = ({handleClose}:PropType) => {
    const {
        text:actualPassword,
        textChangeHandler:actualPasswordChangeHandler,
        hasBeenTouched:actualPasswordHasBeenTouched,
        inputBlurHandler:actualPasswordBlurHandler,
        shouldDisplayError:actualPasswordError,
        inputClearHandler:actualPasswordClearHandler
} = useInput(validatePasswordLength);
    const {
            text:password,
            textChangeHandler:passwordChangeHandler,
            hasBeenTouched:passwordHasBeenTouched,
            inputBlurHandler:passwordBlurHandler,
            shouldDisplayError:passwordError,
            inputClearHandler:passwordClearHandler
    } = useInput(validatePasswordLength);
    const {
            text:confirm,
            textChangeHandler:confirmChangeHandler,
            hasBeenTouched:confirmHasBeenTouched,
            inputBlurHandler:confirmBlurHandler,
            shouldDisplayError:confirmError,
            inputClearHandler:confirmClearHandler
    } = useInput(validatePasswordLength);
    const axiosPrivate = useAxiosPrivate();
    const handleChangePassword = async ()=>{
        // axiosPrivate.post('/users/')
    }
  return (
    <div className={styles.container}>
        <Stack className={styles.formWrapper} gap={1} alignItems="center">
          <h1>Re-initialisation</h1>
          <div className={styles.content}>
            <p>inserez votre nouveau mot de passe.</p>
          </div>
          <TextField 
            onBlur={actualPasswordBlurHandler} 
            helperText={actualPasswordError && "min caracteres: 6"} 
            error={actualPasswordError} 
            value={actualPassword} 
            onChange={actualPasswordChangeHandler} 
            autoComplete="new-password"  
            sx={{boxShadow:'none'}} size='small'
             className={styles.textField} 
             inputProps={{className:styles.input}} 
             label="mot de passe actuel" 
             type='password'
            />
          <TextField 
            onBlur={passwordBlurHandler} 
            helperText={passwordError && "min caracteres: 6"} 
            error={passwordError} 
            value={password} 
            onChange={passwordChangeHandler} 
            autoComplete="new-password"  
            sx={{boxShadow:'none'}} size='small'
             className={styles.textField} 
             inputProps={{className:styles.input}} 
             label="nouveau mot de passe" 
             type='password'
            />
          <TextField 
            onBlur={confirmBlurHandler} 
            helperText={confirmError && "min caracteres: 6"} 
            error={confirmError} 
            value={confirm} 
            onChange={confirmChangeHandler} 
            autoComplete="new-confirmation"  
            sx={{boxShadow:'none'}} size='small'
             className={styles.textField} 
             inputProps={{className:styles.input}} 
             label="confirmation" 
             type='password'
            />
        </Stack>  
       <Stack direction="row" className={styles.actionButtons}>
          <Button disabled={confirmError || passwordError || confirm.length === 0 || password.length === 0}  onClick={()=>0}>Appliquer</Button>
          
            <Button onClick={()=>handleClose()}>Fermer</Button>
        </Stack>
    </div>
  )
}

export default ChangePassword