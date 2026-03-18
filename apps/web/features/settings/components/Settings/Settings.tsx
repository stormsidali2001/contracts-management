'use client';
import { CircularProgress, Modal } from '@mui/material';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import ChangePassword from '@/features/settings/ChangePassword/ChangePassword';
import styles from './Settings.module.css';
import { useToggleNotifications } from '@/features/auth/queries/auth.queries';
import { BASE_URL } from '@/api/axios';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Settings = () => {
  const [changePasswordModal, setChangePasswordModal] = useState(false);

  const user = useAuthStore((s) => s.user);
  const { mutate: toggleNotifications, isPending: isLoading } = useToggleNotifications();

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrateur',
    JURIDICAL: 'Juridique',
    EMPLOYEE: 'Employé',
  };

  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Paramètres</h1>
          <span className={styles.pageSubtitle}>Configurez votre compte et vos préférences</span>
        </div>
      </div>

      <div className={styles.content}>

        {/* ── Profile strip ── */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>
            {user?.imageUrl
              ? <img src={`${BASE_URL}/users/image/${user.imageUrl}`} alt="Profil" />
              : <span className={styles.profileAvatarFallback}>{user?.firstName?.[0]?.toUpperCase() ?? '?'}</span>
            }
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.profileEmail}>{user?.email}</span>
          </div>
          <div className={styles.profileBadge}>
            {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
          </div>
        </div>

        {/* ── Settings card ── */}
        <div className={styles.settingsCard}>

          {/* Section: Préférences */}
          <div className={styles.sectionHeader}>
            <span>Préférences</span>
          </div>

          {/* Notification row */}
          <div className={styles.settingRow}>
            <div className={styles.settingIconWrap}>
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <div className={styles.settingBody}>
              <span className={styles.settingTitle}>Notifications par email</span>
              <span className={styles.settingDesc}>
                Recevez des alertes par email lorsque des événements importants surviennent dans l'application.
              </span>
            </div>
            <div className={styles.settingControl}>
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: 'var(--navy-mid)' }} />
              ) : (
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={!!user?.recieve_notifications}
                    onChange={() => toggleNotifications()}
                  />
                  <div className={styles.toggleTrack} />
                  <div className={styles.toggleThumb} />
                </label>
              )}
            </div>
          </div>

          <div className={styles.rowDivider} />

          {/* Section: Sécurité */}
          <div className={styles.sectionHeader}>
            <span>Sécurité</span>
          </div>

          {/* Password row */}
          <div className={styles.settingRow}>
            <div className={styles.settingIconWrap}>
              <LockOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <div className={styles.settingBody}>
              <span className={styles.settingTitle}>Mot de passe</span>
              <span className={styles.settingDesc}>
                Modifiez votre mot de passe de connexion. Choisissez un mot de passe fort d'au moins 6 caractères.
              </span>
            </div>
            <div className={styles.settingControl}>
              <button
                className={styles.changeBtn}
                onClick={() => setChangePasswordModal(true)}
              >
                Changer
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <Modal open={changePasswordModal} onClose={() => setChangePasswordModal(false)}>
        <ChangePassword handleClose={() => setChangePasswordModal(false)} />
      </Modal>
    </div>
  );
};

export default Settings;
