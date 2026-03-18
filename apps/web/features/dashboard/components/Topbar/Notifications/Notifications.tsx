'use client';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNotificationStore } from '@/features/notification/store/notification.store';
import styles from './Notifications.module.css';

/** Bold the email address inside the message string */
function renderMessage(message: string) {
  const parts = message.split(/([\w.+-]+@[\w.-]+\.[a-zA-Z]+)/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className={styles.emailHighlight}>{part}</strong>
      : part,
  );
}

/** Detect action type from message text */
function getAction(message: string): { label: string; cls: string } {
  const m = message.toLowerCase();
  if (m.includes('supprim'))  return { label: 'Suppression', cls: styles.chipDelete };
  if (m.includes('ajout') || m.includes('créé') || m.includes('cree'))
                               return { label: 'Création',    cls: styles.chipInsert };
  if (m.includes('mis a jour') || m.includes('mis à jour') || m.includes('mise à jour'))
                               return { label: 'Mise à jour', cls: styles.chipUpdate };
  return                              { label: 'Activité',    cls: styles.chipUpdate };
}

const Notifications = () => {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <div className={styles.container}>

      {/* ── Navy header ── */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 17 }} />
        </div>
        <span className={styles.headerTitle}>Notifications</span>
        {notifications.length > 0 && (
          <span className={styles.headerCount}>{notifications.length}</span>
        )}
      </div>

      {/* ── Empty state ── */}
      {notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
          </div>
          <span className={styles.emptyTitle}>Aucune notification</span>
          <span className={styles.emptyDesc}>Vous êtes à jour !</span>
        </div>
      ) : (
        <ul className={styles.list}>
          {notifications.map((n) => {
            const action = getAction(n.message);
            return (
              <li key={n.id} className={styles.item}>
                <div className={styles.itemMeta}>
                  <span className={`${styles.chip} ${action.cls}`}>{action.label}</span>
                </div>
                <p className={styles.itemText}>{renderMessage(n.message)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
