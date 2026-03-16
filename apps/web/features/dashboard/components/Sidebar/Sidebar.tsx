'use client';

import { Button } from '@mui/material';
import { BMT_LOGO_URL } from '@/features/dashboard/data';
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

const sidebarLinks = [
   {text:"Accueil" , icon:()=><MainDashboardIcon/>,link:"/"},
   {text:"Directions" , icon:()=><DirectionsIcon/>,link:"/directions"},
   {text:"Utilisateurs" , icon:()=><UsersIcon/>,link:"/users"},
   {text:"Fournisseurs" , icon:()=><VendorsIcon/>,link:"/vendors"},
   {text:"Convensions" , icon:()=><ConvensionIcon/>,link:"/convensions"},
   {text:"Contrats" , icon:()=><ContractsIcon/>,link:"/contracts"},
];

const Sidebar = () => {
    const pathname = usePathname();
    const index = sidebarLinks.findIndex(l => pathname === l.link);
    const [activeIndex, setAcitveIndex] = useState(index);

    const getStyle = (index: number) => {
        if (index === activeIndex) {
            return `${styles.link} ${styles.active}`;
        }
        return `${styles.link}`;
    }

    if (!pathname) return <div></div>

    return (
        <div className={styles.container}>
            <Button className={styles.logo}>
                <img src={BMT_LOGO_URL} alt="BMT Logo" />
            </Button>
            <ul className={styles.links}>
                {
                    sidebarLinks.map((link, index) => (
                        <Link href={link.link} key={index}>
                            <li className={getStyle(index)} onClick={() => setAcitveIndex(index)}>
                                <link.icon/>
                                <span>{link.text}</span>
                            </li>
                        </Link>
                    ))
                }
            </ul>
        </div>
    )
}

export default Sidebar
