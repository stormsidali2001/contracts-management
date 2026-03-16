'use client';
import { useState } from 'react';
import { Button, TextField } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import styles from './DeleteDirectionModal.module.css';
import { Direction } from '@/features/direction/models/direction.interface';

/** Returns the 1–2 letter abbreviation for the direction icon */
const dirAbbr = (title: string) => {
  const words = title.trim().split(/\s+/).filter(w => !['de', 'du', 'des', 'la', 'le', 'les', "d'"].includes(w.toLowerCase()));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return title.slice(0, 2).toUpperCase();
};

interface Props {
  direction: Direction;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteDirectionModal = ({ direction, onConfirm, onCancel }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const confirmed = inputValue === direction.abriviation;

  return (
    <div className={styles.container}>
      {/* ── Danger header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerIcon}>
          <DeleteForeverIcon sx={{ fontSize: 20 }} />
        </div>
        <div className={styles.headerText}>
          <div className={styles.headerTitle}>Supprimer la direction</div>
          <div className={styles.headerSubtitle}>Action irréversible</div>
        </div>
      </div>

      <div className={styles.body}>
        {/* Warning */}
        <div className={styles.warningBanner}>
          <WarningAmberRoundedIcon className={styles.warningIcon} sx={{ fontSize: 18 }} />
          <span className={styles.warningText}>
            Cette action est <strong>permanente</strong> et supprimera la direction ainsi que tous ses départements associés.
          </span>
        </div>

        {/* Direction info */}
        <div className={styles.directionInfo}>
          <div className={styles.directionIconBadge}>{dirAbbr(direction.title ?? '')}</div>
          <div className={styles.directionDetails}>
            <span className={styles.directionName}>{direction.title}</span>
            <span className={styles.directionAbbr}>{direction.abriviation}</span>
          </div>
        </div>

        {/* Confirmation input */}
        <p className={styles.confirmLabel}>
          Pour confirmer, tapez le mnémonique&nbsp;<code>{direction.abriviation}</code>&nbsp;ci-dessous&nbsp;:
        </p>
        <TextField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          size="small"
          fullWidth
          placeholder={direction.abriviation}
          autoFocus
          color="error"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
              fontSize: '13px',
              letterSpacing: '0.06em',
            },
          }}
        />
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <Button className={styles.cancelBtn} onClick={onCancel}>
          Annuler
        </Button>
        <Button
          className={styles.deleteBtn}
          disabled={!confirmed}
          onClick={onConfirm}
          startIcon={<DeleteForeverIcon sx={{ fontSize: 16 }} />}
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default DeleteDirectionModal;
