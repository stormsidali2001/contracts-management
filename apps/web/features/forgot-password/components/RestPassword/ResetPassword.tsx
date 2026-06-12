'use client';

import { useState, useEffect } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useInput from '@/hooks/input/use-input';
import { validatePasswordLength } from '@/shared/utils/validation/length';
import styles from './ResetPassword.module.css';
import { useResetPassword } from '@/features/auth/queries/auth.queries';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';

const ResetPassword = () => {
  const [panelError, setPanelError] = useState(false);
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const { mutate: resetPassword, isPending, isSuccess, isError } = useResetPassword();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const { text: newPassword, textChangeHandler: newPasswordChangeHandler, shouldDisplayError: newPasswordShouldDisplayError, inputBlurHandler: newPasswordBlurHandler } = useInput(validatePasswordLength);
  const { text: confirmation, textChangeHandler: confirmationChangeHandler, shouldDisplayError: confirmationShouldDisplayError, inputBlurHandler: confirmationBlurHandler } = useInput(validatePasswordLength);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    resetPassword({ password: newPassword, token: token as string, userId: userId as string });
  };

  useEffect(() => {
    if (!isError) return;
    showSnackbar({ message: 'Le lien de réinitialisation est invalide ou expiré.' });
  }, [isError, showSnackbar]);

  useEffect(() => {
    if (!isSuccess) return;
    showSnackbar({ message: 'Mot de passe mis à jour avec succès.', severty: 'success' });
  }, [isSuccess, showSnackbar]);

  const passwordsMatch = newPassword === confirmation;
  const canSubmit = !newPasswordShouldDisplayError && !confirmationShouldDisplayError
    && newPassword.length > 0 && confirmation.length > 0 && passwordsMatch;

  return (
    <div className={styles.container}>
      {/* ── Left: form ── */}
      <div className={styles.leftWrapper}>
        <div className={styles.formCard}>
          <Link href="/" className={styles.logo}>
            <GavelOutlinedIcon sx={{ fontSize: 22 }} />
          </Link>

          <div className={styles.formHeading}>
            <h1>Nouveau mot de passe</h1>
            <p>Choisissez un mot de passe sécurisé d&apos;au moins 6 caractères.</p>
          </div>

          {!isPending ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <TextField
                onBlur={newPasswordBlurHandler}
                helperText={newPasswordShouldDisplayError && 'Minimum 6 caractères'}
                error={newPasswordShouldDisplayError}
                value={newPassword}
                onChange={newPasswordChangeHandler}
                autoComplete="new-password"
                size="small"
                className={styles.textField}
                label="Nouveau mot de passe"
                type="password"
                fullWidth
              />
              <TextField
                onBlur={confirmationBlurHandler}
                helperText={
                  confirmationShouldDisplayError
                    ? 'Minimum 6 caractères'
                    : confirmation.length > 0 && !passwordsMatch
                    ? 'Les mots de passe ne correspondent pas'
                    : undefined
                }
                error={confirmationShouldDisplayError || (confirmation.length > 0 && !passwordsMatch)}
                value={confirmation}
                onChange={confirmationChangeHandler}
                autoComplete="new-password"
                size="small"
                className={styles.textField}
                label="Confirmer le mot de passe"
                type="password"
                fullWidth
              />
              <Button
                type="submit"
                disabled={!canSubmit}
                variant="contained"
                color="primary"
                fullWidth
                size="medium"
                sx={{ py: 1.25, fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600 }}
              >
                Mettre à jour le mot de passe
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

export default ResetPassword;
