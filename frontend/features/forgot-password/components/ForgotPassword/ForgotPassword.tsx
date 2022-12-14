import { Button, CircularProgress, TextField } from '@mui/material';
import useInput from '../../../../hooks/input/use-input';
import { useAppSelector , useAppDispatch } from '../../../../hooks/redux/hooks';
import { validateEmail } from '../../../../shared/utils/validation/email';
import { BMT_LOGO_URL } from '../../../dashboard/data';
import styles from './ForgotPassword.module.css'
import {forgotPassword} from '../../../auth/authSlice'
import { useEffect } from 'react';
import { showSnackbar } from '../../../ui/UiSlice';

const ForgotPassword = () => {
  const {text:email,textChangeHandler:emailChangeHandler,shouldDisplayError,inputBlurHandler:emailBlurHandler,inputClearHandler:emailClearHandler} = useInput(validateEmail);
  const dispatch = useAppDispatch()
  const {isLoading,isSuccess,isError} = useAppSelector(state=>state.auth);

  const handleSubmit = (e:any)=>{
    e.preventDefault();
    dispatch(forgotPassword(email))
  }

  useEffect(()=>{
      if(!isError) return;
      dispatch(showSnackbar({message:"pas de compte relier a cette addresse email"}))
  },[isError])

  useEffect(()=>{
    if(!isSuccess) return;
      dispatch(showSnackbar({message:"demande de re-intialization est envoyee",severty:"success"}))
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
          <h1>Mot de passe oublié</h1>
          <div className={styles.content}>
            <p>utlilisez votre address email pour re-initializer votre mot de passe.</p>
          </div>
          <TextField onBlur={emailBlurHandler} helperText={shouldDisplayError && "address email non valide"} error={shouldDisplayError} value={email} onChange={emailChangeHandler} autoComplete="new-email-username"  sx={{boxShadow:'none'}} size='small' className={styles.textField} inputProps={{className:styles.input}} label="email" type='text'/>
          
          <Button type='submit' disabled={shouldDisplayError || email.length === 0  } variant='contained' color='secondary'>Envoyer</Button>
        </form>
      ):(
        <CircularProgress sx={{margin:'auto'}} />
      )

        
      }

       </div>
    </div>
    
    {/**left wrapper */}
    <div className={styles.rightWrapper}>
        <img src="boat2v1.jpg" />
    </div>
</div>
  )
}

export default ForgotPassword;