'use client';

import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Fil d'Ariane">
      <Link href="/" className={styles.home} aria-label="Accueil">
        <HomeOutlinedIcon sx={{ fontSize: 13 }} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className={styles.item}>
          <ChevronRightIcon className={styles.sep} />
          {item.href ? (
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
