import { Button, CircularProgress, TextField } from '@mui/material';
import useInput from '../../../../hooks/input/use-input';
import { useAppSelector } from '../../../../hooks/redux/hooks';
import { validateEmail } from '../../../../shared/utils/validation/email';
import { BMT_LOGO_URL } from '../../../dashboard/data';
import styles from './ForgotPassword.module.css'

const ForgotPassword = () => {
  const {text:email,textChangeHandler:emailChangeHandler,shouldDisplayError,inputBlurHandler:emailBlurHandler,inputClearHandler:emailClearHandler} = useInput(validateEmail);

  const {isLoading,isSuccess} = useAppSelector(state=>state.auth);

  const handleSubmit = ()=>{

  }
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