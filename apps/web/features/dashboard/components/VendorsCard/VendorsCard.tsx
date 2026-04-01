'use client';
import styles from './VendorsCard.module.css';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { tokens } from '@/lib/tokens';
import { useId, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@mui/material';
import { AnimateSharedLayout, motion } from 'framer-motion';
import { useDateRangeStore } from '@/features/statistics/store/date-range.store';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const formatDate = (d: any) => (d ? d.toDate().toISOString().replace(/T[0-9:.Z]*/g, '') : undefined);

const VendorsCard = () => {
  const [expanded, setExpanded] = useState(false);
  const cardId = useId();
  const { start_date, end_date } = useDateRangeStore();
  const { data } = useStatistics({ startDate: formatDate(start_date), endDate: formatDate(end_date) });
  const stats = data?.vendorsStats ?? null;

  return (
    <AnimateSharedLayout>
      {!expanded ? <CompactCard stats={stats} cardId={cardId} setExpanded={setExpanded} /> : <ExpandedCard stats={stats} cardId={cardId} setExpanded={setExpanded} />}
    </AnimateSharedLayout>
  );
};

export default VendorsCard;

export function CompactCard({ stats, cardId, setExpanded }: any) {
  const latestCount = stats?.slice(-1)?.[0]?.nb_vendors ?? null;

  if (!stats) {
    return (
      <motion.div layoutId={`expandableCard-${cardId}`} className={styles.container}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <Skeleton variant="text" animation="wave" width={95} height={18} />
          </div>
          <Skeleton variant="circular" animation="wave" width={24} height={24} />
        </div>
        <div className={styles.chartContainer}>
          <Skeleton variant="rounded" animation="wave" width="100%" height="100%" sx={{ borderRadius: 8 }} />
        </div>
      </motion.div>
    );
  }

  const data = {
    labels: stats?.slice(-7)?.map((el: any) => el.date) ?? [],
    datasets: [{ label: 'nombre de fournisseurs', backgroundColor: tokens.color.navyMid, borderColor: tokens.color.navyMid, borderWidth: 1.5, hoverBackgroundColor: tokens.color.navyLight, hoverBorderColor: tokens.color.navyMid, data: stats?.slice(-7)?.map((el: any) => el.nb_vendors) ?? [] }],
  };
  return (
    <motion.div layoutId={`expandableCard-${cardId}`} className={styles.container} onClick={() => setExpanded(true)}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.title}>Fournisseurs</span>
          {latestCount !== null && <span className={styles.latestCount}>{latestCount} actifs</span>}
        </div>
        <button className={styles.expandButton} aria-label="Agrandir">
          <ZoomOutMapIcon sx={{ fontSize: 13 }} />
        </button>
      </div>
      <div className={styles.chartContainer}>
        <Line data={data} width={100} height={50} options={{ maintainAspectRatio: false, scales: { x: { type: 'time', time: { parser: 'yyyy-MM-dd', unit: 'month' }, title: { display: true, text: 'Date' }, adapters: { date: { locale: fr } } } } }} />
      </div>
    </motion.div>
  );
}

export function ExpandedCard({ stats, cardId, setExpanded }: any) {
  const data = {
    labels: stats?.map((el: any) => el.date) ?? [],
    datasets: [{ label: 'nombre de fournisseurs', backgroundColor: tokens.color.navyMid, borderColor: tokens.color.navyMid, borderWidth: 1.5, hoverBackgroundColor: tokens.color.navyLight, hoverBorderColor: tokens.color.navyMid, data: stats?.map((el: any) => el.nb_vendors) ?? [] }],
  };
  return (
    <motion.div layoutId={`expandableCard-${cardId}`} className={styles.expandedCard}>
      <div className={styles.expandedHeader}>
        <div className={styles.title}>Fournisseurs</div>
        <div role="button" tabIndex={0} aria-label="Fermer" onClick={() => setExpanded(false)} className={styles.closeButton}><CloseOutlinedIcon /></div>
      </div>
      <div className={styles.expandedChartContainer}>
        <Line data={data} options={{ maintainAspectRatio: false, scales: { x: { type: 'time', time: { parser: 'yyyy-MM-dd', unit: 'month' }, title: { display: true, text: 'Date' }, adapters: { date: { locale: fr } } } } }} />
      </div>
    </motion.div>
  );
}
