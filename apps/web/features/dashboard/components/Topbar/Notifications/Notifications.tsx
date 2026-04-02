'use client';
import { useState, useRef, useEffect } from 'react';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNotificationStore } from '@/features/notification/store/notification.store';
import { useMarkAsRead, useMarkAllAsRead } from '@/features/notification/queries/notification.queries';
import styles from './Notifications.module.css';

type ActionLabel = 'Tous' | 'Création' | 'Mise à jour' | 'Suppression' | 'Activité';

const FILTERS: ActionLabel[] = ['Tous', 'Création', 'Mise à jour', 'Suppression', 'Activité'];

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
function getAction(message: string): { label: ActionLabel; cls: string } {
  const m = message.toLowerCase();
  if (m.includes('supprim'))  return { label: 'Suppression', cls: styles.chipDelete };
  if (m.includes('ajout') || m.includes('créé') || m.includes('cree'))
                               return { label: 'Création',    cls: styles.chipInsert };
  if (m.includes('mis a jour') || m.includes('mis à jour') || m.includes('mise à jour'))
                               return { label: 'Mise à jour', cls: styles.chipUpdate };
  return                              { label: 'Activité',    cls: styles.chipActivity };
}

const Notifications = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const [activeFilter, setActiveFilter] = useState<ActionLabel>('Tous');
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const listRef = useRef<HTMLUListElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = activeFilter === 'Tous'
    ? notifications
    : notifications.filter((n) => getAction(n.message).label === activeFilter);

  // Automatically mark visible unread notifications as read via IntersectionObserver.
  // A 600 ms dwell timer ensures the user actually sees the unread highlight before
  // it clears. The timer resets if the item scrolls out of view before the delay.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const timers = new Map<Element, ReturnType<typeof setTimeout>>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.notifId;
          if (!id) return;

          if (entry.isIntersecting) {
            timers.set(
              entry.target,
              setTimeout(() => {
                markAsRead(id);
                observer.unobserve(entry.target);
                timers.delete(entry.target);
              }, 600),
            );
          } else {
            const t = timers.get(entry.target);
            if (t !== undefined) {
              clearTimeout(t);
              timers.delete(entry.target);
            }
          }
        });
      },
      { root: list, threshold: 0.1 },
    );

    list.querySelectorAll<HTMLElement>('[data-notif-id]').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [filtered]);

  return (
    <div className={styles.container}>

      {/* ── Navy header ── */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 17 }} />
        </div>
        <span className={styles.headerTitle}>Notifications</span>
        {unreadCount > 0 && (
          <span className={styles.headerCount}>{unreadCount}</span>
        )}
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={() => markAllAsRead()}>
            Tout lire
          </button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className={styles.filterBar}>
        {FILTERS.map((f) => {
          const count = f === 'Tous'
            ? notifications.length
            : notifications.filter((n) => getAction(n.message).label === f).length;
          return (
            <button
              key={f}
              className={`${styles.filterBtn} ${activeFilter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
              {count > 0 && (
                <span className={`${styles.filterCount} ${activeFilter === f ? styles.filterCountActive : ''}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
          </div>
          <span className={styles.emptyTitle}>Aucune notification</span>
          <span className={styles.emptyDesc}>
            {activeFilter === 'Tous' ? 'Vous êtes à jour !' : `Aucune notification de type « ${activeFilter} »`}
          </span>
        </div>
      ) : (
        <ul ref={listRef} className={styles.list}>
          {filtered.map((n) => {
            const action = getAction(n.message);
            return (
              <li
                key={n.id}
                {...(!n.isRead ? { 'data-notif-id': n.id } : {})}
                className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
              >
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
