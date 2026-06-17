'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { APP_NAME } from '@/features/dashboard/data';
import { tokens } from '@/lib/tokens';
import styles from '@/styles/Landing.module.css';

const FEATURES = [
  {
    icon: (
      <DashboardOutlinedIcon
        sx={{ fontSize: 22, color: tokens.color.navyMid }}
      />
    ),
    title: 'Tableau de bord en temps réel',
    description:
      "Les statistiques se mettent à jour instantanément dès qu'un accord est créé ou exécuté — sans rechargement de page.",
  },
  {
    icon: (
      <NotificationsActiveOutlinedIcon
        sx={{ fontSize: 22, color: tokens.color.navyMid }}
      />
    ),
    title: 'Alertes avant expiration',
    description:
      "Recevez des notifications automatiques 30, 7 et 1 jour avant l'expiration de chaque contrat.",
  },
  {
    icon: (
      <PeopleOutlinedIcon sx={{ fontSize: 22, color: tokens.color.navyMid }} />
    ),
    title: 'Accès basé sur les rôles',
    description:
      "Trois niveaux d'accès — Admin, Juridique et Employé — chacun avec une vue adaptée à ses responsabilités.",
  },
  {
    icon: (
      <FolderOpenOutlinedIcon
        sx={{ fontSize: 22, color: tokens.color.navyMid }}
      />
    ),
    title: 'Contrats & conventions',
    description:
      "Gérez les deux types d'accords dans une interface unifiée, avec filtres, recherche et pagination.",
  },
  {
    icon: (
      <StorefrontOutlinedIcon
        sx={{ fontSize: 22, color: tokens.color.navyMid }}
      />
    ),
    title: 'Gestion des fournisseurs',
    description:
      'Centralisez les informations de vos prestataires et suivez leurs contrats associés en un clic.',
  },
  {
    icon: (
      <BusinessOutlinedIcon
        sx={{ fontSize: 22, color: tokens.color.navyMid }}
      />
    ),
    title: 'Hiérarchie organisationnelle',
    description:
      'Structurez votre organisation en directions et départements pour un filtrage et un accès précis.',
  },
];

export default function LandingPage() {
  const [previewError, setPreviewError] = useState(false);

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          <GavelOutlinedIcon
            sx={{ fontSize: 24, color: tokens.color.navyMid }}
          />
          <span className={styles.navBrandName}>{APP_NAME}</span>
        </Link>
        <Button
          component={Link}
          href="/signin"
          variant="contained"
          color="primary"
          size="small"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: '13.5px',
          }}
        >
          Se connecter
        </Button>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            Gestion des accords commerciaux
          </span>
          <h1 className={styles.heroTitle}>
            Ne manquez plus jamais une <em>échéance</em> de contrat.
          </h1>
          <p className={styles.heroSubtext}>
            Suivez vos contrats et conventions, surveillez leur statut
            d&apos;exécution en temps réel, et recevez des alertes automatiques
            avant chaque expiration.
          </p>
          <div className={styles.heroCtas}>
            <Button
              component={Link}
              href="/signin"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                px: 3.5,
              }}
            >
              Commencer →
            </Button>
            <Button
              component="a"
              href="#features"
              variant="text"
              size="large"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                color: 'var(--text-secondary)',
                '&:hover': {
                  color: 'var(--text-primary)',
                  background: 'var(--navy-light)',
                },
              }}
            >
              En savoir plus
            </Button>
          </div>
        </div>

        <div className={styles.heroImage}>
          {!previewError ? (
            <div className={styles.heroImageInner}>
              <Image
                src="/illustrations/landing-preview.png"
                alt="Aperçu du tableau de bord ContractFlow"
                width={1040}
                height={700}
                style={{ width: '100%', height: 'auto' }}
                onError={() => setPreviewError(true)}
                priority
              />
            </div>
          ) : (
            <div className={styles.heroImagePlaceholder}>
              <span className={styles.heroImagePlaceholderText}>
                Aperçu de l&apos;application
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>
            Tout ce dont vous avez besoin
          </h2>
          <p className={styles.featuresSubtitle}>
            Une plateforme complète pour gérer le cycle de vie de vos accords
            commerciaux.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDescription}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>
          Prêt à simplifier la gestion de vos contrats ?
        </h2>
        <p className={styles.ctaSubtext}>
          Accédez à votre tableau de bord et prenez le contrôle de vos accords.
        </p>
        <div className={styles.ctaButton}>
          <Button
            component={Link}
            href="/signin"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              px: 4,
              py: 1.5,
            }}
          >
            Accéder à l&apos;application →
          </Button>
        </div>
        <p className={styles.ctaCopyright}>
          © 2026 {APP_NAME} — Tous droits réservés
        </p>
      </section>
    </>
  );
}
