import { Button, TextField } from '@mui/material';
import Link from 'next/link';
import { BMT_LOGO_URL } from '../features/dashboard/data';
import styles from '../styles/Signin.module.css';

const signin = () => {
  return (
    <div className={styles.container}>
        <div className={styles.leftWrapper}>
          <div className={styles.logo}>
            <img src={BMT_LOGO_URL}/>
          </div>
          <div className={styles.formWrapper}>
            <form>
              <h1>Connexion</h1>
              <TextField autoComplete="new-password"  sx={{boxShadow:'none'}} size='small' className={styles.textField} inputProps={{className:styles.input}} label="identifiant" type='text'/>
              <TextField autoComplete="new-password"  size='small' className={styles.textField} inputProps={{className:styles.input,}} label="mot de passe" type='password'/>
              <div className={styles.forgotPassword}>
                <Link  href="/forgot-password">Mot de passe oublié ?
                </Link>
              </div>
              <Button variant='contained' color='secondary'>Connexion</Button>
            </form>

           </div>
        </div>
        
        {/**left wrapper */}
        <div className={styles.rightWrapper}>
            <img src="sign-in-contract-bg.jpg" />
        </div>
    </div>
  )
}

export default signin