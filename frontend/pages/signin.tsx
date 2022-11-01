import { Button, CircularProgress, TextField } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useEffect } from 'react';
import { login ,reset} from '../features/auth/authSlice';
import { LoginUser } from '../features/auth/models/login-user.interface';
import { BMT_LOGO_URL } from '../features/dashboard/data';
import { showSnackbar } from '../features/ui/UiSlice';
import useInput from '../hooks/input/use-input';
import { useAppDispatch, useAppSelector } from '../hooks/redux/hooks';
import { validateEmail } from '../shared/utils/validation/email';
import { validateEmailOrUsername } from '../shared/utils/validation/emailOrUsername';
import styles from '../styles/Signin.module.css';

const signin = () => {
  const {text:email,textChangeHandler:emailChangeHandler,shouldDisplayError,inputBlurHandler:emailBlurHandler,inputClearHandler:emailClearHandler} = useInput(validateEmailOrUsername);
  const {text:password,textChangeHandler:passwordChangeHandler,inputClearHandler:passwordClearHandler} = useInput();
  const dispatch = useAppDispatch();
  const router = useRouter()
  const {isLoading , isAuthenticated , isSuccess,error,isError} = useAppSelector(state=>state.auth)
 const handleSubmit =  (e:FormEvent)=>{
    e.preventDefault();
     const isEmail = validateEmail(email);
     const loginUser:LoginUser  = {password}
     if(isEmail ){
      loginUser.email = email;
     }else{
      loginUser.username = email;
     }
     try{

       dispatch(login(loginUser))
     }catch(err){
      alert(err)
     }
 }
 const clearForm = ()=>{
  emailClearHandler();
  passwordClearHandler();
 }
 useEffect(()=>{
  if(isSuccess){
    dispatch(reset());
    clearForm();

  }
 },[isSuccess,dispatch])
 useEffect(()=>{
  if(!isAuthenticated) return;
  
  router.push('/')
 },[isAuthenticated])

 useEffect(()=>{
  //@ts-ignore
  if(isError  && error?.length >0){
    dispatch(showSnackbar({message:error}))
  }
 },[isError,error])
  return (
    <div className={styles.container}>
        <div className={styles.leftWrapper}>
          <div className={styles.logo}>
            <img src={BMT_LOGO_URL}/>
          </div>
          <div className={styles.formWrapper}>
           { !isLoading? 

          ( <form onSubmit={handleSubmit}>
              <h1>Connexion</h1>
              <TextField onBlur={emailBlurHandler} helperText={shouldDisplayError && "address email ou nom d'utilisateur non valide"} error={shouldDisplayError} value={email} onChange={emailChangeHandler} autoComplete="new-email-username"  sx={{boxShadow:'none'}} size='small' className={styles.textField} inputProps={{className:styles.input}} label="identifiant" type='text'/>
              <TextField value={password} onChange={passwordChangeHandler} autoComplete="new-password"  size='small' className={styles.textField} inputProps={{className:styles.input,}} label="mot de passe" type='password'/>
              <div className={styles.forgotPassword}>
                <Link  href="/forgot-password">Mot de passe oublié ?
                </Link>
              </div>
              <Button type='submit' disabled={shouldDisplayError || email.length === 0 || password.length ===0 } variant='contained' color='secondary'>Connexion</Button>
            </form>
          ):(
            <CircularProgress sx={{margin:'auto'}} />
          )

            
          }

           </div>
        </div>
        
        {/**left wrapper */}
        <div className={styles.rightWrapper}>
            <img src="sign-in-contract-bg.jpg" />
        </div>
    </div>
  )
}

export default signin;


