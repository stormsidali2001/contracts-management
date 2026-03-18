'use client';
import { Button, CircularProgress, TextField } from '@mui/material';
import useInput from '@/hooks/input/use-input';
import { validateDepartementAbriviationLength, validateDepartementTitleLength } from '@/shared/utils/validation/length';
import styles from './CreateDepartement.module.css';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Departement } from '@/features/direction/models/departement.interface';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import { useState } from 'react';
import { useCreateDepartement } from '@/features/direction/queries/direction.queries';

const CreateDepartement = ({
  selectedDirectionId,
  handleCloseDepartementModal,
  pushDepartementToDirection,
  linkToDirectionAsync = true,
}: {
  selectedDirectionId?: string | null;
  handleCloseDepartementModal: () => void;
  pushDepartementToDirection: (departement: Departement, selectedDirectionId?: string) => void;
  linkToDirectionAsync?: boolean;
}) => {
  const {
    text: title,
    inputBlurHandler: titleBlurHandler,
    textChangeHandler: titleChangeHandler,
    shouldDisplayError: titleShouldDisplayError,
  } = useInput(validateDepartementTitleLength);

  const {
    text: abriviation,
    inputBlurHandler: abriviationBlurHandler,
    textChangeHandler: abriviationChangeHandler,
    shouldDisplayError: abriviationShouldDisplayError,
  } = useInput(validateDepartementAbriviationLength);

  const [isSuccess, setIsSuccess] = useState(false);
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { mutate: createDepartement, isPending: isLoading } = useCreateDepartement();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!title || !abriviation) return;

    if (linkToDirectionAsync && selectedDirectionId) {
      createDepartement(
        { directionId: selectedDirectionId, title, abriviation },
        {
          onSuccess: (res: any) => {
            pushDepartementToDirection({ id: res.id, title, abriviation, users: 0 }, selectedDirectionId);
            showSnackbar({ message: 'le département a été créé avec succès', severty: 'success' });
            setIsSuccess(true);
            setTimeout(() => handleCloseDepartementModal(), 2000);
          },
          onError: (err: any) => {
            showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' });
          },
        },
      );
    } else {
      pushDepartementToDirection({ title, abriviation, users: 0 });
      handleCloseDepartementModal();
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerIcon}>
          <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
        </div>
        <div className={styles.headerText}>
          <div className={styles.title}>Nouveau département</div>
          <div className={styles.subtitle}>Remplir les informations</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {isLoading ? (
          <div className={styles.stateContainer}>
            <CircularProgress size={36} thickness={4} sx={{ color: 'var(--navy-mid, #17498E)' }} />
            <span className={styles.stateText}>Création en cours…</span>
          </div>
        ) : isSuccess ? (
          <div className={styles.stateContainer}>
            <div className={styles.successIcon}>
              <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
            </div>
            <span className={styles.stateText}>Département créé avec succès</span>
          </div>
        ) : (
          <div className={styles.modalBody}>
            <TextField
              value={title}
              onChange={titleChangeHandler}
              onBlur={titleBlurHandler}
              size="small"
              label="Titre"
              fullWidth
              color="primary"
              error={titleShouldDisplayError}
              helperText={titleShouldDisplayError && 'Entre 5 et 15 caractères'}
            />
            <TextField
              value={abriviation}
              onChange={abriviationChangeHandler}
              onBlur={abriviationBlurHandler}
              size="small"
              label="Mnémonique"
              fullWidth
              color="primary"
              error={abriviationShouldDisplayError}
              helperText={abriviationShouldDisplayError && 'Entre 2 et 5 caractères'}
            />
          </div>
        )}

        <div className={styles.actionButtonsContainer}>
          <Button
            className={styles.cancelBtn}
            disabled={isLoading}
            onClick={handleCloseDepartementModal}
          >
            Fermer
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={styles.submitBtn}
            disabled={title.length === 0 || abriviation.length === 0 || titleShouldDisplayError || abriviationShouldDisplayError || isSuccess || isLoading}
          >
            Créer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateDepartement;
