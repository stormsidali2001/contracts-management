'use client';
import { useState } from 'react';
import { useMediaQuery, Modal } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AgreementStatsCard from '@/features/dashboard/components/AgreementStatsCard/AgreementStatsCard';
import LastEventsCard from '@/features/dashboard/components/lastEventsCard/LastEventsCard';
import UsersCard from '@/features/dashboard/components/UsersCard/UsersCard';
import VendorsCard from '@/features/dashboard/components/VendorsCard/VendorsCard';
import ChangeDate from '@/features/dashboard/components/VendorsCard/ChangeDate/ChangeDate';
import { useDateRangeStore } from '@/features/statistics/store/date-range.store';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';

import styles from './MainDashboard.module.css';

const fmtDate = (d: any) => (d ? d.toDate().toISOString().replace(/T[0-9:.Z]*/g, '') : undefined);

const MainDashboard = () => {
  const isMedium = useMediaQuery('(max-width: 900px)');
  const [openDateModal, setOpenDateModal] = useState(false);
  const { start_date, end_date, setDateRange } = useDateRangeStore();

  const { data } = useStatistics({ startDate: fmtDate(start_date), endDate: fmtDate(end_date) });

  const startLabel = fmtDate(start_date);
  const endLabel   = fmtDate(end_date);
  const hasFilter  = !!(startLabel || endLabel);

  // KPI values
  const totalAccords  = (data?.agreementsStats?.types?.contract ?? 0) + (data?.agreementsStats?.types?.convension ?? 0);
  const notExecuted   = data?.agreementsStats?.status?.not_executed ?? null;
  const latestVendors = data?.vendorsStats?.slice(-1)?.[0]?.nb_vendors ?? null;
  const totalUsers    = data?.userTypes?.total ?? null;

  const clearFilter = () => setDateRange({ startDate: null, endDate: null });

  return (
    <div className={styles.container}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Tableau de bord</h1>
          <span className={styles.pageSubtitle}>Vue d'ensemble des accords et activités</span>
        </div>
        <div className={styles.pageHeaderRight}>
          {hasFilter && (
            <div className={styles.activePeriod}>
              <CalendarMonthOutlinedIcon sx={{ fontSize: 13, color: 'var(--navy-mid)' }} />
              <span className={styles.periodValue}>{startLabel}</span>
              <span className={styles.periodSep}>→</span>
              <span className={styles.periodValue}>{endLabel}</span>
              <button className={styles.clearBtn} onClick={clearFilter} aria-label="Effacer le filtre">
                <CloseOutlinedIcon sx={{ fontSize: 11 }} />
              </button>
            </div>
          )}
          <button className={styles.filterBtn} onClick={() => setOpenDateModal(true)}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />
            <span>{hasFilter ? 'Modifier la période' : 'Filtrer par période'}</span>
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiValue}>{totalAccords || '—'}</span>
            <span className={styles.kpiLabel}>Total accords</span>
            <span className={styles.kpiSub}>contrats & conventions</span>
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardError}`}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconError}`}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.kpiContent}>
            <span className={`${styles.kpiValue} ${notExecuted && notExecuted > 0 ? styles.kpiValueError : ''}`}>{notExecuted ?? '—'}</span>
            <span className={styles.kpiLabel}>Non exécutés</span>
            <span className={styles.kpiSub}>en attente d'exécution</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <StorefrontOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiValue}>{latestVendors ?? '—'}</span>
            <span className={styles.kpiLabel}>Fournisseurs</span>
            <span className={styles.kpiSub}>actifs actuellement</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiValue}>{totalUsers ?? '—'}</span>
            <span className={styles.kpiLabel}>Utilisateurs</span>
            <span className={styles.kpiSub}>comptes enregistrés</span>
          </div>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className={styles.contentWrapper}>
        {isMedium ? (
          <>
            <div className={styles.middleCard}>
              <VendorsCard />
              <UsersCard />
            </div>
            <div className={styles.flexy}>
              <AgreementStatsCard />
              <LastEventsCard />
            </div>
          </>
        ) : (
          <>
            <AgreementStatsCard />
            <div className={styles.middleCard}>
              <VendorsCard />
              <UsersCard />
            </div>
            <LastEventsCard />
          </>
        )}
      </div>

      <Modal open={openDateModal} onClose={() => setOpenDateModal(false)}>
        <ChangeDate handleClose={() => setOpenDateModal(false)} start_date={start_date} end_date={end_date} />
      </Modal>
    </div>
  );
};

export default MainDashboard;
