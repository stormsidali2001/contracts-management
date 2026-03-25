'use client';

import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import styles from './Sidebar.module.css';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainDashboardIcon from '@/icons/MainDashboardIcon';
import DirectionsIcon from '@/icons/DirectionsIcon';
import UsersIcon from '@/icons/UsersIcon';
import VendorsIcon from '@/icons/VendorsIcon';
import ConvensionIcon from '@/icons/ConvensionIcon';
import ContractsIcon from '@/icons/ContractsIcon';
import { APP_NAME } from '../../data';

const sidebarLinks = [
   { text: 'Accueil',      icon: () => <MainDashboardIcon />, link: '/' },
   { text: 'Directions',   icon: () => <DirectionsIcon />,   link: '/directions' },
   { text: 'Utilisateurs', icon: () => <UsersIcon />,        link: '/users' },
   { text: 'Fournisseurs', icon: () => <VendorsIcon />,      link: '/vendors' },
   { text: 'Convensions',  icon: () => <ConvensionIcon />,   link: '/convensions' },
   { text: 'Contrats',     icon: () => <ContractsIcon />,    link: '/contracts' },
];

const Sidebar = () => {
    const pathname = usePathname();
    const index = sidebarLinks.findIndex(l => pathname === l.link);
    const [activeIndex, setActiveIndex] = useState(index);

    const getStyle = (i: number) =>
        i === activeIndex ? `${styles.link} ${styles.active}` : styles.link;

    if (!pathname) return <div />;

    return (
        <div className={styles.container}>
            {/* Branding */}
            <div className={styles.logo}>
                <div className={styles.logoIconWrap}>
                    <GavelOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div className={styles.logoText}>
                    <span className={styles.logoName}>{APP_NAME}</span>
                    <span className={styles.logoBadge}>Gestion des contrats</span>
                </div>
            </div>

            {/* Nav */}
            <ul className={styles.links}>
                {sidebarLinks.map((link, i) => (
                    <Link href={link.link} key={i}>
                        <li className={getStyle(i)} onClick={() => setActiveIndex(i)}>
                            <span className={styles.icon}><link.icon /></span>
                            <span>{link.text}</span>
                            <span className={styles.tooltip}>{link.text}</span>
                        </li>
                    </Link>
                ))}
            </ul>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerAvatar}>AD</div>
                    <div className={styles.footerText}>
                        <span className={styles.footerName}>Administrateur</span>
                        <span className={styles.footerRole}>Super admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
