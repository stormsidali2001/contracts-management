'use client';
import styles from './PopoverContent.module.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import TourIcon from '@mui/icons-material/Explore';
import { Divider } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMemo } from 'react';
import { useLogout } from '@/features/auth/queries/auth.queries';
import { getAvatarSrc, getRoleAvatar } from '@/lib/avatar';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import { useOnborda } from 'onborda';
import { useRouter } from 'next/navigation';

const tourNameByRole: Record<string, string> = {
  ADMIN: 'admin-tour',
  JURIDICAL: 'juridical-tour',
  EMPLOYEE: 'employee-tour',
};

const PopoverContent = () => {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { startOnborda } = useOnborda();
  const router = useRouter();

  function handleRestartTour() {
    if (!user?.sub || !user?.role) return;
    localStorage.removeItem(`onboarding_done_${user.sub}`);
    const tourName = tourNameByRole[user.role];
    if (!tourName) return;
    router.push('/dashboard');
    setTimeout(() => startOnborda(tourName), 600);
  }

  const links = useMemo(
    () => [
      {
        text: 'Profile',
        link: `/users/${user?.sub ?? ''}`,
        icon: AccountCircleIcon,
      },
      { text: 'Parametres', link: '/settings', icon: SettingsIcon },
    ],
    [user?.sub],
  );

  function handleLogout(e: any) {
    e.preventDefault();
    logout(undefined, {
      onError: () => showSnackbar({ message: 'Erreur lors de la déconnexion' }),
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profilImgContainer}>
          <Image
            src={getAvatarSrc(user?.imageUrl, user?.role)}
            alt="Photo de profil"
            width={36}
            height={36}
            unoptimized
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getRoleAvatar(
                user?.role,
              );
            }}
          />
        </div>
        <div className={styles.userInfos}>
          <span>{`${user?.firstName}  ${user?.lastName}`}</span>
          <span>{user?.role ?? ''}</span>
          <span>{user?.email ?? ''}</span>
        </div>
      </div>
      <Divider sx={{ margin: '6px 0' }} />
      <ul className={styles.links}>
        {links.map((link, index) => (
          <Link href={link.link} key={index}>
            <li className={styles.link}>
              <link.icon className={styles.iconStyle} />
              <span>{link.text}</span>
            </li>
          </Link>
        ))}
        <li onClick={handleRestartTour} className={styles.link}>
          <TourIcon className={styles.iconStyle} />
          <span>Reprendre le tour</span>
        </li>
        <li onClick={handleLogout} className={styles.link}>
          <LogoutIcon className={styles.iconStyle} />
          <span>Deconnexion</span>
        </li>
      </ul>
    </div>
  );
};

export default PopoverContent;
