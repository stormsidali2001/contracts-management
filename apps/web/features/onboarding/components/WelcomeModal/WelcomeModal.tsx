'use client';

import styles from './WelcomeModal.module.css';
import { Button } from '@mui/material';

interface Props {
  role: string;
  onStart: () => void;
  onSkip: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'administrateur',
  JURIDICAL: 'juriste',
  EMPLOYEE: 'employé',
};

export default function WelcomeModal({ role, onStart, onSkip }: Props) {
  const roleLabel = ROLE_LABELS[role] ?? 'utilisateur';

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <span className={styles.emoji}>👋</span>
        <h2 className={styles.title}>Bienvenue sur ContractFlow !</h2>
        <p className={styles.description}>
          En tant que <strong>{roleLabel}</strong>, vous avez accès à des fonctionnalités
          adaptées à votre rôle. Ce guide interactif vous présentera les sections
          principales de la plateforme en quelques étapes.
        </p>
        <div className={styles.divider} />
        <div className={styles.actions}>
          <Button className={styles.btnSkip} onClick={onSkip}>
            Passer
          </Button>
          <Button className={styles.btnStart} onClick={onStart}>
            Commencer le tour →
          </Button>
        </div>
      </div>
    </div>
  );
}
