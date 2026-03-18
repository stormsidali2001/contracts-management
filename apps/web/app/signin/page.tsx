'use client';

import { Button, CircularProgress, TextField } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginUser } from '@/features/auth/models/login-user.interface';
import { BMT_LOGO_URL } from '@/features/dashboard/data';
import { useLogin } from '@/features/auth/queries/auth.queries';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import useInput from '@/hooks/input/use-input';
import { validateEmail } from '@/shared/utils/validation/email';
import { validateEmailOrUsername } from '@/shared/utils/validation/emailOrUsername';
import styles from '@/styles/Signin.module.css';

export default function SignIn() {
  const { text: email, textChangeHandler: emailChangeHandler, shouldDisplayError, inputBlurHandler: emailBlurHandler, inputClearHandler: emailClearHandler } = useInput(validateEmailOrUsername);
  const { text: password, textChangeHandler: passwordChangeHandler, inputClearHandler: passwordClearHandler } = useInput();
  const router = useRouter();
  const { mutate: login, isPending, isError, error } = useLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const isEmail = validateEmail(email);
    const loginUser: LoginUser = { password };
    if (isEmail) {
      loginUser.email = email;
    } else {
      loginUser.username = email;
    }
    login(loginUser, {
      onSuccess: () => {
        emailClearHandler();
        passwordClearHandler();
      },
    });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    router.push('/');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isError && error) {
      showSnackbar({ message: (error as any)?.response?.data?.error ?? 'Erreur de connexion' });
    }
  }, [isError, error]);

  return (
    <div className={styles.container}>
      {/* ── Left brand panel ── */}
      <div className={styles.leftPanel}>
        <div className={styles.brandTop}>
          <img src={BMT_LOGO_URL} alt="BMT Logo" />
          <span className={styles.brandName}>BMT</span>
        </div>
        <div className={styles.brandTagline}>
          <h2>Gestion des<br /><em>contrats</em><br />simplifiée.</h2>
          <p>Suivez, analysez et gérez l'ensemble de vos accords commerciaux en un seul endroit.</p>
        </div>
        <span className={styles.brandFooter}>© 2026 BMT — Tous droits réservés</span>
      </div>

      {/* ── Right form panel ── */}
      <div className={styles.rightWrapper}>
        <div className={styles.formCard}>
          <div className={styles.formHeading}>
            <h1>Connexion</h1>
            <p>Entrez vos identifiants pour accéder au tableau de bord</p>
          </div>
          <div className={styles.formWrapper}>
            {!isPending ? (
              <form onSubmit={handleSubmit}>
                <TextField
                  onBlur={emailBlurHandler}
                  helperText={shouldDisplayError && "adresse email ou nom d'utilisateur non valide"}
                  error={shouldDisplayError}
                  value={email}
                  onChange={emailChangeHandler}
                  autoComplete="username"
                  size="small"
                  className={styles.textField}
                  label="Identifiant"
                  type="text"
                  fullWidth
                />
                <TextField
                  value={password}
                  onChange={passwordChangeHandler}
                  autoComplete="current-password"
                  size="small"
                  className={styles.textField}
                  label="Mot de passe"
                  type="password"
                  fullWidth
                />
                <div className={styles.forgotPassword}>
                  <Link href="/forgot-password">Mot de passe oublié ?</Link>
                </div>
                <Button
                  type="submit"
                  disabled={shouldDisplayError || email.length === 0 || password.length === 0}
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="medium"
                  sx={{ mt: 1, py: 1.25, fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 600 }}
                >
                  Se connecter
                </Button>
              </form>
            ) : (
              <CircularProgress sx={{ margin: '40px auto', display: 'block' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
