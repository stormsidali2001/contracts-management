'use client';
import { CircularProgress, TextField } from '@mui/material';
import useInput from '@/hooks/input/use-input';
import { validatePasswordLength } from '@/shared/utils/validation/length';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import styles from './ChangePassword.module.css';
import { useChangePassword } from '@/features/auth/queries/auth.queries';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

interface PropType {
  handleClose: () => void;
}

const ChangePassword = ({ handleClose }: PropType) => {
  const { text: actualPassword, textChangeHandler: actualPasswordChangeHandler, inputBlurHandler: actualPasswordBlurHandler, shouldDisplayError: actualPasswordError } = useInput(validatePasswordLength);
  const { text: password,       textChangeHandler: passwordChangeHandler,       inputBlurHandler: passwordBlurHandler,       shouldDisplayError: passwordError       } = useInput(validatePasswordLength);
  const { text: confirm,        textChangeHandler: confirmChangeHandler,        inputBlurHandler: confirmBlurHandler,        shouldDisplayError: confirmError        } = useInput(validatePasswordLength);

  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { mutate: changePassword, isPending: isLoading } = useChangePassword();

  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = !actualPasswordError && !passwordError && !confirmError && !passwordMismatch
    && actualPassword.length > 0 && password.length > 0 && confirm.length > 0;

  const handleChangePassword = () => {
    changePassword(
      { actualPassword, password },
      {
        onSuccess: () => {
          showSnackbar({ message: 'votre mot de passe a eté re-initialiser', severty: 'success' });
          handleClose();
        },
        onError: (err: any) => {
          showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnu' });
        },
      },
    );
  };

  return (
    <div className={styles.container}>

      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <LockResetOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Changer le mot de passe</span>
            <span className={styles.headerSubtitle}>Sécurisez votre compte</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.loadingWrap}>
            <CircularProgress size={40} thickness={3} sx={{ color: 'var(--navy-mid)' }} />
            <span className={styles.loadingLabel}>Modification en cours…</span>
          </div>
        ) : (
          <div className={styles.fieldGroup}>
            <p className={styles.hint}>Saisissez votre mot de passe actuel puis choisissez un nouveau mot de passe d'au moins 6 caractères.</p>
            <TextField
              onBlur={actualPasswordBlurHandler}
              helperText={actualPasswordError && 'Minimum 6 caractères'}
              error={actualPasswordError}
              value={actualPassword}
              onChange={actualPasswordChangeHandler}
              autoComplete="current-password"
              size="small"
              fullWidth
              label="Mot de passe actuel"
              type="password"
            />
            <TextField
              onBlur={passwordBlurHandler}
              helperText={passwordError && 'Minimum 6 caractères'}
              error={passwordError}
              value={password}
              onChange={passwordChangeHandler}
              autoComplete="new-password"
              size="small"
              fullWidth
              label="Nouveau mot de passe"
              type="password"
            />
            <TextField
              onBlur={confirmBlurHandler}
              helperText={confirmError ? 'Minimum 6 caractères' : passwordMismatch ? 'Les mots de passe ne correspondent pas' : undefined}
              error={confirmError || passwordMismatch}
              value={confirm}
              onChange={confirmChangeHandler}
              autoComplete="new-password"
              size="small"
              fullWidth
              label="Confirmation"
              type="password"
            />
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className={styles.actionRow}>
        <button className={styles.cancelBtn} onClick={handleClose}>Annuler</button>
        <button
          className={styles.applyBtn}
          disabled={!canSubmit || isLoading}
          onClick={handleChangePassword}
        >
          <CheckOutlinedIcon sx={{ fontSize: 14 }} />
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
