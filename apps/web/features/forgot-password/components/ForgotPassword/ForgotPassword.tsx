import { Button, CircularProgress, TextField } from '@mui/material';
import useInput from '@/hooks/input/use-input';
import { validateEmail } from '@/shared/utils/validation/email';
import { BMT_LOGO_URL } from '@/features/dashboard/data';
import styles from './ForgotPassword.module.css';
import { useForgotPassword } from '@/features/auth/queries/auth.queries';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import { useEffect } from 'react';

const ForgotPassword = () => {
  const { text: email, textChangeHandler: emailChangeHandler, shouldDisplayError, inputBlurHandler: emailBlurHandler } = useInput(validateEmail);
  const { mutate: forgotPassword, isPending, isSuccess, isError } = useForgotPassword();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    forgotPassword(email);
  };

  useEffect(() => {
    if (!isError) return;
    showSnackbar({ message: 'pas de compte relier a cette addresse email' });
  }, [isError]);

  useEffect(() => {
    if (!isSuccess) return;
    showSnackbar({ message: 'demande de re-intialization est envoyee', severty: 'success' });
  }, [isSuccess]);

  return (
    <div className={styles.container}>
      <div className={styles.leftWrapper}>
        <div className={styles.logo}>
          <img src={BMT_LOGO_URL} alt="BMT Logo" />
        </div>
        <div className={styles.formWrapper}>
          {!isPending ? (
            <form onSubmit={handleSubmit}>
              <h1>Mot de passe oublié</h1>
              <div className={styles.content}>
                <p>utlilisez votre address email pour re-initializer votre mot de passe.</p>
              </div>
              <TextField onBlur={emailBlurHandler} helperText={shouldDisplayError && 'address email non valide'} error={shouldDisplayError} value={email} onChange={emailChangeHandler} autoComplete="new-email-username" sx={{ boxShadow: 'none' }} size="small" className={styles.textField} inputProps={{ className: styles.input }} label="email" type="text" />
              <Button type="submit" disabled={shouldDisplayError || email.length === 0} variant="contained" color="secondary">Envoyer</Button>
            </form>
          ) : (
            <CircularProgress sx={{ margin: 'auto' }} />
          )}
        </div>
      </div>
      <div className={styles.rightWrapper}>
        <img src="boat2v1.jpg" alt="" />
      </div>
    </div>
  );
};

export default ForgotPassword;
