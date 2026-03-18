'use client';
import { AnimateSharedLayout, motion } from 'framer-motion';
import { useState, useId } from 'react';
import AdminIcon from '@/icons/AdminIcon';
import EmployeeIcon from '@/icons/EmployeeIcon';
import JuridicalIcon from '@/icons/JuridicalIcon';
import styles from './UsersCard.module.css';
import { tokens } from '@/lib/tokens';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { useDateRangeStore } from '@/features/statistics/store/date-range.store';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';

ChartJS.register(ArcElement);

const formatDate = (d: any) => (d ? d.toDate().toISOString().replace(/T[0-9:.Z]*/g, '') : undefined);

const UsersCard = () => {
  const [expanded, setExpanded] = useState(false);
  const cardId = useId();
  const { start_date, end_date } = useDateRangeStore();
  const { data } = useStatistics({ startDate: formatDate(start_date), endDate: formatDate(end_date) });
  const stats = data?.userTypes ?? null;

  if (!stats) return <div className={styles.container}>Loading...</div>;

  return (
    <AnimateSharedLayout>
      {!expanded ? <CompactCard stats={stats} cardId={cardId} setExpanded={setExpanded} /> : <ExpandedCard stats={stats} cardId={cardId} setExpanded={setExpanded} />}
    </AnimateSharedLayout>
  );
};

export default UsersCard;

function CompactCard({ stats, setExpanded, cardId }: any) {
  const getEntityPercentage = (entity: string) => {
    if (stats.total === 0) return 0;
    switch (entity) {
      case 'admin': return Math.round((100 * stats.admin) / stats.total);
      case 'juridical': return Math.round((100 * stats.juridical) / stats.total);
      case 'employee': return Math.round((100 * stats.employee) / stats.total);
    }
    return 0;
  };
  const percentages = [
    { percentage: getEntityPercentage('juridical'), icon: JuridicalIcon, name: 'juridique' },
    { percentage: getEntityPercentage('employee'), icon: EmployeeIcon, name: 'employé' },
    { percentage: getEntityPercentage('admin'), icon: AdminIcon, name: 'admin' },
  ];
  return (
    <motion.div onClick={() => setExpanded(true)} layoutId={cardId} className={styles.container}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.title}>Utilisateurs</span>
          <span className={styles.totalCount}>{stats.total} au total</span>
        </div>
        <button className={styles.expandButton} aria-label="Agrandir">
          <ZoomOutMapIcon sx={{ fontSize: 13 }} />
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.percentages}>
          {percentages.map((percentage, index) => (
            <div className={styles.percentage} key={index}>
              <percentage.icon />
              <span>{`${percentage.percentage}%`}</span>
              <span className={styles.roleLabel}>{percentage.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ExpandedCard({ stats, cardId, setExpanded }: any) {
  const getEntityValue = (entity: string) => {
    if (stats.total === 0) return 0;
    switch (entity) {
      case 'admin': return stats.admin;
      case 'juridical': return stats.juridical;
      case 'employee': return stats.employee;
    }
    return 0;
  };
  const percentages = [
    { percentage: getEntityValue('juridical'), name: 'juridique' },
    { percentage: getEntityValue('employee'), name: 'employé' },
    { percentage: getEntityValue('admin'), name: 'admin' },
  ];
  const data = {
    labels: percentages.map((p) => p.name),
    datasets: [{ label: "les types d'utilisateur", data: percentages.map((p) => p.percentage), backgroundColor: [tokens.color.navyMid, tokens.color.success, tokens.color.navy], hoverOffset: 2 }],
  };
  return (
    <motion.div layoutId={cardId} className={styles.expandedCard}>
      <div role="button" tabIndex={0} aria-label="Fermer" onClick={() => setExpanded(false)} className={styles.closeButton}><CloseOutlinedIcon /></div>
      <div className={styles.title}>Utilisateurs</div>
      <div className={styles.chartContainer}>
        <Doughnut data={data} options={{ maintainAspectRatio: false, layout: { padding: 10 } }} />
      </div>
    </motion.div>
  );
}
