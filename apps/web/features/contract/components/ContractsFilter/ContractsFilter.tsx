'use client';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { UserRole } from '@/features/auth/models/user-role.enum';
import styles from './ContractsFilter.module.css';
import { useDirections } from '@/features/direction/queries/direction.queries';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/Close';

enum AgreementStatus {
  executed = 'executed',
  executed_with_delay = 'executed_with_delay',
  in_execution = 'in_execution',
  in_execution_with_delay = 'in_execution_with_delay',
  not_executed = 'not_executed',
}

const STATUS_OPTIONS: { value: string; label: string; bg: string; color: string; border: string }[] = [
  { value: 'not_executed',            label: 'Non exécuté',       bg: 'rgba(220,38,38,0.08)',  color: '#B91C1C', border: 'rgba(220,38,38,0.28)'  },
  { value: 'executed',                label: 'Exécuté',           bg: 'rgba(22,163,74,0.08)',  color: '#15803D', border: 'rgba(22,163,74,0.28)'   },
  { value: 'in_execution',            label: 'En cours',          bg: 'rgba(23,73,142,0.08)',  color: '#17498E', border: 'rgba(23,73,142,0.28)'   },
  { value: 'executed_with_delay',     label: 'Exécuté (retard)',  bg: 'rgba(217,119,6,0.08)',  color: '#B45309', border: 'rgba(217,119,6,0.28)'   },
  { value: 'in_execution_with_delay', label: 'En cours (retard)', bg: 'rgba(245,158,11,0.08)', color: '#92400E', border: 'rgba(245,158,11,0.28)'  },
];

interface Filters {
  directionId?: string;
  departementId?: string;
  start_date?: string;
  end_date?: string;
  amount_min?: number;
  amount_max?: number;
  status?: AgreementStatus;
}

interface PropType {
  handleClose: Function;
  handleSetFilters: (filters: Filters) => void;
  initialFilters: Filters;
}

const ContractsFilter = ({ handleSetFilters, handleClose, initialFilters }: PropType) => {
  const { data: directionsData = [] } = useDirections();
  const directions = directionsData;

  const [isByAmount,    setIsByAmount]    = useState(false);
  const [minAmount,     setMinAmount]     = useState(0);
  const [maxAmount,     setMaxAmount]     = useState(0);
  const [selectedStatus, setSelectedStatus] = useState({ label: 'not_executed', value: 'not_executed' });
  const [isByStatus,    setIsByStatus]    = useState(false);
  const [startDate,     setStartDate]     = useState<Dayjs>(dayjs(new Date()));
  const [endDate,       setEndDate]       = useState<Dayjs>(dayjs(new Date()));
  const user                              = useAuthStore((s) => s.user);
  const shouldDisplayFilter = () => user?.role === UserRole.ADMIN || user?.role === UserRole.JURIDICAL;
  const [isByDate,      setIsByDate]      = useState(false);
  const [isByDirection, setIsByDirection] = useState(false);
  const [selectedDirection,   setSelectedDirection]   = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [selectedDepartement, setSelectedDepartement] = useState<{ label: string; value: string }>({ label: '', value: '' });

  const handleDirectionChange = (event: SelectChangeEvent) => {
    const directionId = event.target.value;
    const directionIndex = directions.findIndex((d) => d.id === directionId);
    if (directionIndex < 0) return;
    const direction = directions[directionIndex];
    setSelectedDirection({ label: direction?.title, value: directionId });
    if (direction.departements.length === 0) return;
    const departement = direction.departements[Math.floor(Math.random() * direction.departements.length)];
    setSelectedDepartement({ label: departement?.title, value: departement.id as string });
  };

  const handleChangeDepartement = (event: SelectChangeEvent) => {
    const departementId = event.target.value;
    const departements = getDepartementsFromDirections();
    const directionIndex = departements.findIndex((d) => d.id === departementId);
    const departement = departements[directionIndex];
    if (directionIndex < 0) return;
    setSelectedDepartement({ label: departement.title, value: departementId });
  };

  function getDepartementsFromDirections() {
    if (directions.length === 0) return [];
    const directionId = selectedDirection?.value;
    const directionIndex = directions.findIndex((d) => d.id === directionId);
    if (directionIndex < 0) return [];
    return directions[directionIndex].departements;
  }

  const handleSubmitFilters = () => {
    const format = (d: Date) => new Date(d).toISOString().replace(/T[0-9:.Z]*/g, '');
    const filters: Filters = {};
    if (isByDirection) { filters.directionId = selectedDirection.value; filters.departementId = selectedDepartement.value; }
    if (isByDate)      { filters.start_date = format(startDate.toDate()); filters.end_date = format(endDate.toDate()); }
    if (isByStatus)    { filters.status = selectedStatus.value as unknown as AgreementStatus; }
    if (isByAmount)    { filters.amount_min = minAmount; filters.amount_max = maxAmount; }
    handleSetFilters(filters);
    handleClose();
  };

  const handleReset = () => {
    setIsByDirection(false); setIsByDate(false); setIsByStatus(false); setIsByAmount(false);
    handleSetFilters({});
    handleClose();
  };

  useEffect(() => {
    if (initialFilters.directionId && initialFilters.departementId) {
      setIsByDirection(true);
      const selDir = directions.find((d) => d.id === initialFilters.directionId);
      setSelectedDirection({ label: selDir?.abriviation ?? '', value: initialFilters.directionId });
      const selDep = selDir?.departements.find((dp) => dp.id === initialFilters.departementId);
      setSelectedDepartement({ value: initialFilters.departementId, label: selDep?.abriviation ?? '' });
    }
    if (initialFilters.amount_min !== undefined && initialFilters.amount_max !== undefined) {
      setIsByAmount(true); setMinAmount(initialFilters.amount_min); setMaxAmount(initialFilters.amount_max);
    }
    if (initialFilters.start_date && initialFilters.end_date) {
      setIsByDate(true); setStartDate(dayjs(initialFilters.start_date)); setEndDate(dayjs(initialFilters.end_date));
    }
    if (initialFilters.status) {
      setIsByStatus(true); setSelectedStatus({ label: initialFilters.status, value: initialFilters.status });
    }
  }, []);

  const activeCount = [isByDirection, isByDate, isByStatus, isByAmount].filter(Boolean).length;

  return (
    <div className={styles.container}>

      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FilterListOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Filtres avancés</span>
            <span className={styles.headerSubtitle}>Affiner les résultats</span>
          </div>
        </div>
        {activeCount > 0 && (
          <div className={styles.headerBadge}>{activeCount} actif{activeCount > 1 ? 's' : ''}</div>
        )}
      </div>

      {/* ── Filter sections ── */}
      <div className={styles.sectionsBody}>

        {/* Direction */}
        {shouldDisplayFilter() && (
          <div className={`${styles.filterSection} ${isByDirection ? styles.filterSectionActive : ''}`}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <div className={styles.sectionIcon}><AccountTreeOutlinedIcon sx={{ fontSize: 15 }} /></div>
                <span className={styles.sectionTitle}>Direction et département</span>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" checked={isByDirection} onChange={() => setIsByDirection((v) => !v)} />
                <div className={styles.toggleTrack} />
                <div className={styles.toggleThumb} />
              </label>
            </div>
            <div className={`${styles.sectionBody} ${isByDirection ? styles.sectionBodyVisible : ''}`}>
              <FormControl fullWidth size="small" disabled={!isByDirection}>
                <InputLabel>Direction</InputLabel>
                <Select value={selectedDirection?.value ?? ''} label="Direction" onChange={handleDirectionChange}>
                  {directions.map((dr, i) => <MenuItem value={dr?.id ?? ''} key={i}>{dr.abriviation ?? ''}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!isByDirection}>
                <InputLabel>Département</InputLabel>
                <Select value={selectedDepartement?.value} label="Département" onChange={handleChangeDepartement}>
                  {getDepartementsFromDirections().map((dp: any, i: any) => <MenuItem value={dp?.id} key={i}>{dp?.abriviation}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
        )}

        {/* Date */}
        <div className={`${styles.filterSection} ${isByDate ? styles.filterSectionActive : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.sectionIcon}><CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} /></div>
              <span className={styles.sectionTitle}>Période</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={isByDate} onChange={() => setIsByDate((v) => !v)} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.sectionBody} ${isByDate ? styles.sectionBodyVisible : ''}`}>
            <div className={styles.dateRow}>
              <MobileDatePicker
                label="Date de début"
                value={startDate}
                disabled={!isByDate}
                onChange={(v) => setStartDate(v ?? dayjs(''))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <div className={styles.dateArrow}>→</div>
              <MobileDatePicker
                label="Date de fin"
                value={endDate}
                disabled={!isByDate}
                onChange={(v) => setEndDate(v ?? dayjs(''))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className={`${styles.filterSection} ${isByStatus ? styles.filterSectionActive : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.sectionIcon}><FlagOutlinedIcon sx={{ fontSize: 15 }} /></div>
              <span className={styles.sectionTitle}>Statut d'exécution</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={isByStatus} onChange={() => setIsByStatus((v) => !v)} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.sectionBody} ${isByStatus ? styles.sectionBodyVisible : ''}`}>
            <div className={styles.statusChips}>
              {STATUS_OPTIONS.map((opt) => {
                const isActive = isByStatus && selectedStatus.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    className={`${styles.statusChip} ${isActive ? styles.statusChipActive : ''}`}
                    style={isActive ? { background: opt.bg, color: opt.color, borderColor: opt.border } : {}}
                    disabled={!isByStatus}
                    onClick={() => setSelectedStatus({ value: opt.value, label: opt.value })}
                  >
                    {isActive && <CheckOutlinedIcon sx={{ fontSize: 11 }} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className={`${styles.filterSection} ${isByAmount ? styles.filterSectionActive : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.sectionIcon}><PaymentsOutlinedIcon sx={{ fontSize: 15 }} /></div>
              <span className={styles.sectionTitle}>Montant (DA)</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={isByAmount} onChange={() => setIsByAmount((v) => !v)} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.sectionBody} ${isByAmount ? styles.sectionBodyVisible : ''}`}>
            <div className={styles.amountRow}>
              <div className={styles.amountField}>
                <span className={styles.amountLabel}>Min</span>
                <input
                  className={styles.amountInput}
                  type="number"
                  value={minAmount}
                  min={0}
                  max={maxAmount || undefined}
                  disabled={!isByAmount}
                  onChange={(e) => setMinAmount(parseInt(e.target.value) || 0)}
                />
                <span className={styles.amountSuffix}>DA</span>
              </div>
              <div className={styles.amountSep}>—</div>
              <div className={styles.amountField}>
                <span className={styles.amountLabel}>Max</span>
                <input
                  className={styles.amountInput}
                  type="number"
                  value={maxAmount}
                  min={minAmount}
                  disabled={!isByAmount}
                  onChange={(e) => setMaxAmount(parseInt(e.target.value) || 0)}
                />
                <span className={styles.amountSuffix}>DA</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Action row ── */}
      <div className={styles.actionRow}>
        <button className={styles.resetBtn} onClick={handleReset}>
          <CloseIcon sx={{ fontSize: 13 }} />
          Réinitialiser
        </button>
        <div className={styles.actionRight}>
          <button className={styles.cancelBtn} onClick={() => handleClose()}>Fermer</button>
          <button className={styles.applyBtn} onClick={handleSubmitFilters}>
            <CheckOutlinedIcon sx={{ fontSize: 14 }} />
            Appliquer
          </button>
        </div>
      </div>

    </div>
  );
};

export default ContractsFilter;
