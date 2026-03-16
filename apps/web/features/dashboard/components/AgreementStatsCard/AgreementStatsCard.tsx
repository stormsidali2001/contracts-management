'use client';
import ContractFilledIcon from '@/icons/ContractFilledIcon';
import ConvensionFilledIcon from '@/icons/ConvensionFilledIcon';
import styles from './AgreementStatsCard.module.css';
import { useState } from 'react';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';
import { useAppSelector } from '@/hooks/redux/hooks';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';
import { tokens } from '@/lib/tokens';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const formatDate = (d: any) => (d ? d.toDate().toISOString().replace(/T[0-9:.Z]*/g, '') : undefined);

const AgreementStatsCard = () => {
  const { start_date, end_date } = useAppSelector((state) => state.StatisticsSlice);
  const { data } = useStatistics({ startDate: formatDate(start_date), endDate: formatDate(end_date) });
  const stats = data?.agreementsStats ?? null;

  if (!stats) return <div className={styles.container}><div className={styles.loading}>Chargement…</div></div>;

  return (
    <div className={styles.container}>
      <StatusCard stats={stats} />
      <TypeCard stats={stats} />
      <DirectionsCard stats={stats} />
    </div>
  );
};

export default AgreementStatsCard;

// ── Shared expanded overlay ──────────────────────────────
function ExpandedOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.expandedCard}>
      <button onClick={onClose} className={styles.closeButton} aria-label="Fermer">
        <CloseOutlinedIcon />
      </button>
      <div className={styles.expandedTitle}>{title}</div>
      <div className={styles.AgreementChart}>{children}</div>
    </div>
  );
}

// ── Status card ──────────────────────────────────────────
function StatusCard({ stats }: any) {
  const [expanded, setExpanded] = useState(false);
  const total = (stats?.types?.contract ?? 0) + (stats?.types?.convension ?? 0);

  const chartData = {
    labels: ["Non exécuté", "En cours", "En cours (retard)", "Exécuté", "Exécuté (retard)"],
    datasets: [{
      label: 'Statut',
      data: [
        stats.status.not_executed,
        stats.status.in_execution,
        stats.status.in_execution_with_delay,
        stats.status.executed,
        stats.status.executed_with_delay,
      ],
      backgroundColor: [
        tokens.color.error,
        tokens.color.warning,
        tokens.color.navyMid,
        tokens.color.success,
        tokens.color.successDark,
      ],
      hoverOffset: 4,
    }],
  };

  if (expanded) {
    return (
      <ExpandedOverlay title="Statuts des accords" onClose={() => setExpanded(false)}>
        <Doughnut data={chartData} options={{ maintainAspectRatio: false, layout: { padding: 10 } }} />
      </ExpandedOverlay>
    );
  }

  return (
    <div className={styles.miniCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.title}>Statuts</span>
          <span className={styles.totalBadge}>{total} accords</span>
        </div>
        <button onClick={() => setExpanded(true)} className={styles.zoomButton} aria-label="Agrandir">
          <ZoomOutMapIcon sx={{ fontSize: 14 }} />
        </button>
      </div>
      <div className={styles.statusBody}>
        <div className={styles.statusTiles}>
          {/* Non exécuté */}
          <div className={styles.statusTile}>
            <span className={styles.statusTileLabel}>Non exécuté</span>
            <span className={`${styles.statusTileCount} ${(stats?.status?.not_executed ?? 0) > 0 ? styles.countError : ''}`}>
              {stats?.status?.not_executed ?? 0}
            </span>
          </div>
          {/* Exécuté */}
          <div className={styles.statusTile}>
            <span className={styles.statusTileLabel}>Exécuté</span>
            <span className={styles.statusTileCount}>
              {(stats?.status?.executed ?? 0) + (stats?.status?.executed_with_delay ?? 0)}
            </span>
            {(stats?.status?.executed_with_delay ?? 0) > 0 && (
              <span className={styles.statusTileDelay}>
                {stats.status.executed_with_delay} avec retard
              </span>
            )}
          </div>
          {/* En cours */}
          <div className={styles.statusTile}>
            <span className={styles.statusTileLabel}>En cours</span>
            <span className={styles.statusTileCount}>
              {(stats?.status?.in_execution ?? 0) + (stats?.status?.in_execution_with_delay ?? 0)}
            </span>
            {(stats?.status?.in_execution_with_delay ?? 0) > 0 && (
              <span className={styles.statusTileDelay}>
                {stats.status.in_execution_with_delay} avec retard
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Type card ────────────────────────────────────────────
function TypeCard({ stats }: any) {
  const [expanded, setExpanded] = useState(false);
  const total = (stats?.types?.contract ?? 0) + (stats?.types?.convension ?? 0);
  const contractPct  = total === 0 ? 0 : Math.round((stats.types.contract  / total) * 100);
  const convensionPct = total === 0 ? 0 : Math.round((stats.types.convension / total) * 100);

  const chartData = {
    labels: ['Contrat', 'Convention'],
    datasets: [{
      label: 'Type',
      data: [stats.types.contract, stats.types.convension],
      backgroundColor: [tokens.color.navyMid, tokens.color.success],
      hoverOffset: 4,
    }],
  };

  if (expanded) {
    return (
      <ExpandedOverlay title="Répartition par type" onClose={() => setExpanded(false)}>
        <Pie data={chartData} options={{ maintainAspectRatio: false, layout: { padding: 10 } }} />
      </ExpandedOverlay>
    );
  }

  return (
    <div className={styles.miniCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.title}>Répartition par type</span>
          <span className={styles.totalBadge}>{total} accords</span>
        </div>
        <button onClick={() => setExpanded(true)} className={styles.zoomButton} aria-label="Agrandir">
          <ZoomOutMapIcon sx={{ fontSize: 14 }} />
        </button>
      </div>
      <div className={styles.typeBody}>
        <div className={`${styles.typeCard} ${styles.contractTile}`}>
          <div className={styles.typeTopRow}>
            <div className={`${styles.typeIconWrap} ${styles.contractIconWrap}`}>
              <ContractFilledIcon />
            </div>
            <span className={styles.typeLabel}>Contrat</span>
          </div>
          <span className={styles.typePct}>{contractPct}%</span>
          <span className={styles.typeCount}>{stats?.types?.contract ?? 0} accords</span>
          <div className={styles.typeBar}><div className={styles.typeBarFill} style={{ width: `${contractPct}%` }} /></div>
        </div>
        <div className={`${styles.typeCard} ${styles.convensionTile}`}>
          <div className={styles.typeTopRow}>
            <div className={`${styles.typeIconWrap} ${styles.convensionIconWrap}`}>
              <ConvensionFilledIcon />
            </div>
            <span className={styles.typeLabel}>Convention</span>
          </div>
          <span className={`${styles.typePct} ${styles.typePctGreen}`}>{convensionPct}%</span>
          <span className={styles.typeCount}>{stats?.types?.convension ?? 0} accords</span>
          <div className={styles.typeBar}><div className={`${styles.typeBarFill} ${styles.typeBarFillAlt}`} style={{ width: `${convensionPct}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

// ── Directions card ──────────────────────────────────────
function DirectionsCard({ stats }: any) {
  const [expanded, setExpanded] = useState(false);
  const maxCount = Math.max(...(stats?.topDirections?.map((d: any) => d.agreementCount) ?? [1]));

  const chartData = {
    labels: stats.topDirections.map((el: any) => el.abriviation),
    datasets: [{
      label: 'Accords',
      data: stats.topDirections.map((el: any) => el.agreementCount),
      backgroundColor: tokens.color.navyMid,
      borderRadius: 6,
    }],
  };

  if (expanded) {
    return (
      <ExpandedOverlay title="Top directions" onClose={() => setExpanded(false)}>
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            layout: { padding: 10 },
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } },
          }}
        />
      </ExpandedOverlay>
    );
  }

  return (
    <div className={styles.miniCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.title}>Top directions</span>
        </div>
        <button onClick={() => setExpanded(true)} className={styles.zoomButton} aria-label="Agrandir">
          <ZoomOutMapIcon sx={{ fontSize: 14 }} />
        </button>
      </div>
      <div className={styles.directionBody}>
        {stats?.topDirections?.map((dr: any, index: number) => (
          <div
            key={index}
            className={styles.directionItem}
            style={{ '--bar-width': `${Math.round((dr.agreementCount / maxCount) * 100)}%` } as React.CSSProperties}
          >
            <div className={`${styles.directionRank} ${index === 0 ? styles.rank1 : index === 1 ? styles.rank2 : index === 2 ? styles.rank3 : styles.rankOther}`}>
              <span>{index + 1}</span>
            </div>
            <div className={styles.directionRow}>
              <span className={styles.directionName}>{dr.abriviation ?? 'DIR'}</span>
              <span className={styles.directionBadge}>{dr.agreementCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
