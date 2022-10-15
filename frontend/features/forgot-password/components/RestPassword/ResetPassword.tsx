import { Button, CircularProgress, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useInput from '../../../../hooks/input/use-input';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux/hooks';
import { validateEmail } from '../../../../shared/utils/validation/email';
import { validatePasswordLength } from '../../../../shared/utils/validation/length';
import { BMT_LOGO_URL } from '../../../dashboard/data';
import styles from './ResetPassword.module.css'
import { resetPassword } from '../../../auth/authSlice';
import { showSnackbar } from '../../../ui/UiSlice';

const ResetPassword = () => {
  const router  = useRouter();
  const {query} = router;
  const {userId,token} = router.query;

 
  const {isSuccess , isError , isLoading} = useAppSelector(state=>state.auth)
  const {
    text:newPassword,
    textChangeHandler:newPasswordChangeHandler,
    shouldDisplayError:newPasswordShouldDisplayError,
    inputBlurHandler:newPasswordBlurHandler,
    inputClearHandler:newPasswordClearHandler
} = useInput(validatePasswordLength);

  const {
    text:confirmation,
    textChangeHandler:confirmationChangeHandler,
    shouldDisplayError:confirmationShouldDisplayError,
    inputBlurHandler:confirmationBlurHandler,
    inputClearHandler:confirmationClearHandler
} = useInput(validatePasswordLength);


  const dispatch = useAppDispatch();

  const handleSubmit = ()=>{
    dispatch(resetPassword({password:newPassword,token:token as string,userId:userId as string}));

  }

  useEffect(()=>{
    if(!isError) return;
    dispatch(showSnackbar({message:"erreur"}))
},[isError])

useEffect(()=>{
  if(!isSuccess) return;
    dispatch(showSnackbar({message:"votre mot de passe a etee re-intializee",severty:"success"}))
},[isSuccess])
  return (
    <div className={styles.container}>
    <div className={styles.leftWrapper}>
      <div className={styles.logo}>
        <img src={BMT_LOGO_URL}/>
      </div>
      <div className={styles.formWrapper}>
       { !isLoading? 

      ( <form onSubmit={handleSubmit}>
          <h1>Re-initialisation</h1>
          <div className={styles.content}>
            <p>inserez votre nouveau mot de passe.</p>
          </div>
          <TextField 
            onBlur={newPasswordBlurHandler} 
            helperText={newPasswordShouldDisplayError && "min caracteres: 6"} 
            error={newPasswordShouldDisplayError} 
            value={newPassword} 
            onChange={newPasswordChangeHandler} 
            autoComplete="new-password"  
            sx={{boxShadow:'none'}} size='small'
             className={styles.textField} 
             inputProps={{className:styles.input}} 
             label="nouveau mot de passe" 
             type='password'
            />
          <TextField 
            onBlur={confirmationBlurHandler} 
            helperText={confirmationShouldDisplayError && "min caracteres: 6"} 
            error={confirmationShouldDisplayError} 
            value={confirmation} 
            onChange={confirmationChangeHandler} 
            autoComplete="new-confirmation"  
            sx={{boxShadow:'none'}} size='small'
             className={styles.textField} 
             inputProps={{className:styles.input}} 
             label="nouveau mot de passe" 
             type='password'
            />
            
         
          
          <Button type='submit' disabled={confirmationShouldDisplayError || newPasswordShouldDisplayError || newPassword.length === 0 || confirmation.length ===0 || confirmation !== newPassword    } variant='contained' color='secondary'>Changer</Button>
        </form>
      ):(
        <CircularProgress sx={{margin:'auto'}} />
      )

        
      }

       </div>
    </div>
    
    {/**left wrapper */}
    <div className={styles.rightWrapper}>
        <img src="boat1v1.jpg" />
    </div>
</div>
  )
}

export default ResetPassword;