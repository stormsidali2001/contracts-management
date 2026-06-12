'use client';

import { useState, useEffect } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useInput from '@/hooks/input/use-input';
import { validateEmail } from '@/shared/utils/validation/email';
import styles from './ForgotPassword.module.css';
import { useForgotPassword } from '@/features/auth/queries/auth.queries';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';

const ForgotPassword = () => {
  const [panelError, setPanelError] = useState(false);
  const { text: email, textChangeHandler: emailChangeHandler, shouldDisplayError, inputBlurHandler: emailBlurHandler } = useInput(validateEmail);
  const { mutate: forgotPassword, isPending, isSuccess, isError } = useForgotPassword();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    forgotPassword(email);
  };

  useEffect(() => {
    if (!isError) return;
    showSnackbar({ message: 'Aucun compte associé à cette adresse email.' });
  }, [isError, showSnackbar]);

  useEffect(() => {
    if (!isSuccess) return;
    showSnackbar({ message: 'Lien de réinitialisation envoyé avec succès.', severty: 'success' });
  }, [isSuccess, showSnackbar]);

  return (
    <div className={styles.container}>
      {/* ── Left: form ── */}
      <div className={styles.leftWrapper}>
        <div className={styles.formCard}>
          <Link href="/" className={styles.logo}>
            <GavelOutlinedIcon sx={{ fontSize: 22 }} />
          </Link>

          <div className={styles.formHeading}>
            <h1>Mot de passe oublié</h1>
            <p>Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
          </div>

          {!isPending ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <TextField
                onBlur={emailBlurHandler}
                helperText={shouldDisplayError && 'Adresse email non valide'}
                error={shouldDisplayError}
                value={email}
                onChange={emailChangeHandler}
                autoComplete="email"
                size="small"
                className={styles.textField}
                label="Adresse email"
                type="email"
                fullWidth
              />
              <Button
                type="submit"
                disabled={shouldDisplayError || email.length === 0}
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
                sx={{ py: 1.25, fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600 }}
              >
                Envoyer le lien
              </Button>
            </form>
          ) : (
            <CircularProgress sx={{ margin: '32px auto', display: 'block' }} />
          )}

          <Link href="/signin" className={styles.backLink}>
            <ArrowBackIcon sx={{ fontSize: 15 }} />
            Retour à la connexion
          </Link>
        </div>
      </div>

      {/* ── Right: illustration ── */}
      <div className={styles.rightWrapper}>
        {!panelError ? (
          <Image
            src="/illustrations/auth-panel.png"
            alt=""
            fill
            style={{ objectFit: 'cover' }}
            onError={() => setPanelError(true)}
          />
        ) : (
          <div className={styles.rightWrapperFallback} />
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
