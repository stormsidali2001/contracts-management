'use client';
import styles from './PopoverContent.module.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider } from '@mui/material';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMemo } from 'react';
import { useLogout } from '@/features/auth/queries/auth.queries';
import { BASE_URL } from '@/api/axios';

const PopoverContent = () => {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const links = useMemo(
    () => [
      { text: 'Profile', link: `/users/${user?.sub ?? ''}`, icon: AccountCircleIcon },
      { text: 'Parametres', link: '/settings', icon: SettingsIcon },
    ],
    [user?.sub],
  );

  function handleLogout(e: any) {
    e.preventDefault();
    logout();
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.profilImgContainer}>
          <img src={user?.imageUrl ? `${BASE_URL}/users/image/${user?.imageUrl}` : '/blank-profile-picture.png'} alt="Photo de profil" />
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
        <li onClick={handleLogout} className={styles.link}>
          <LogoutIcon className={styles.iconStyle} />
          <span>Deconnexion</span>
        </li>
      </ul>
    </div>
  );
};

export default PopoverContent;
