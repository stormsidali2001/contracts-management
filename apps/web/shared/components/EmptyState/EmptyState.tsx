import Image from 'next/image';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message?: string;
  subtext?: string;
}

export default function EmptyState({
  message = 'Aucune donnée',
  subtext = 'Les éléments ajoutés apparaîtront ici.',
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <Image
        src="/illustrations/empty-state.png"
        alt=""
        width={120}
        height={120}
        className={styles.illustration}
      />
      <p className={styles.message}>{message}</p>
      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  );
}
