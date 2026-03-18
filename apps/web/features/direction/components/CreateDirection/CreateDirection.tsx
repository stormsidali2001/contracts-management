'use client';
import { Button, CircularProgress, Modal, TextField } from '@mui/material';
import useInput from '@/hooks/input/use-input';
import { validateDepartementAbriviationLength, validateDepartementTitleLength } from '@/shared/utils/validation/length';
import styles from './CreateDirection.module.css';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from 'react';
import { Departement } from '@/features/direction/models/departement.interface';
import CreateDepartement from '@/features/direction/components/CreateDepartement/CreateDepartement';
import { Direction } from '@/features/direction/models/direction.interface';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import { useCreateDirection } from '@/features/direction/queries/direction.queries';

interface PropTypes {
  pushDirection?: (direction: Direction) => void;
  handleDirectionModalClose: () => void;
}

const CreateDirection = ({ handleDirectionModalClose }: PropTypes) => {
  const [openDepartementModal, setOpenDepartementModal] = useState(false);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { mutate: createDirection, isPending: isLoading, isSuccess } = useCreateDirection();

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

  const pushDepartementToDirection = (departement: Departement) => {
    setDepartements((dpts) => [...dpts, departement]);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!title || !abriviation || !departements) return;
    createDirection(
      { title, abriviation, departements },
      {
        onSuccess: () => {
          showSnackbar({ message: 'la direction a été creé avec success.', severty: 'success' });
          handleDirectionModalClose();
        },
        onError: (err: any) => {
          showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnue' });
        },
      },
    );
  };

  return (
    <div className={styles.container}>
      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerIcon}>
          <BusinessIcon sx={{ fontSize: 18 }} />
        </div>
        <div className={styles.headerText}>
          <div className={styles.title}>Nouvelle direction</div>
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
            <span className={styles.stateText}>Direction créée avec succès</span>
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

            {/* Departments sub-section */}
            <div className={styles.deptSection}>
              <div className={styles.deptSectionHeader}>
                <span className={styles.sectionLabel}>Départements ({departements.length})</span>
                <Button
                  className={styles.addDeptBtn}
                  startIcon={<AddCircleIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setOpenDepartementModal(true)}
                  size="small"
                  variant="outlined"
                >
                  Ajouter
                </Button>
              </div>
              <div className={styles.deptList}>
                {departements.length === 0 ? (
                  <span className={styles.emptyDept}>Aucun département ajouté</span>
                ) : (
                  departements.map((d, i) => (
                    <span key={i} className={styles.deptChip}>
                      {d.title}
                      <span className={styles.deptChipAbbr}>{d.abriviation}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.actionButtonsContainer}>
          <Button
            className={styles.cancelBtn}
            disabled={isSuccess || isLoading}
            onClick={handleDirectionModalClose}
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

      <Modal open={openDepartementModal} onClose={() => setOpenDepartementModal(false)}>
        <CreateDepartement
          pushDepartementToDirection={pushDepartementToDirection}
          linkToDirectionAsync={false}
          handleCloseDepartementModal={() => setOpenDepartementModal(false)}
        />
      </Modal>
    </div>
  );
};

export default CreateDirection;
