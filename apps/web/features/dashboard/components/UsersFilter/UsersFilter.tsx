'use client';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { UserRole } from '@/features/auth/models/user-role.enum';
import styles from './UsersFilter.module.css';
import { useDirections } from '@/features/direction/queries/direction.queries';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface Filters {
  directionId?: string;
  departementId?: string;
  active?: 'active' | 'not_active';
  role?: UserRole;
}

interface PropType {
  handleClose: Function;
  handleSetFilters: (filters: Filters) => void;
  initialFilters: Filters;
}

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE',  label: 'Employé',   Icon: BadgeOutlinedIcon                },
  { value: 'ADMIN',     label: 'Admin',      Icon: AdminPanelSettingsOutlinedIcon   },
  { value: 'JURIDICAL', label: 'Juridique',  Icon: GavelOutlinedIcon                },
];

const UsersFilter = ({ handleSetFilters, handleClose, initialFilters }: PropType) => {
  const { data: directionsData = [] } = useDirections();
  const directions = directionsData;

  const [isByRole,      setIsByRole]      = useState(false);
  const [isByDirection, setIsByDirection] = useState(false);
  const [accountState,  setAccountState]  = useState(false);
  const [isActive,      setIsActive]      = useState(false);
  const [role,          setRole]          = useState('EMPLOYEE');
  const [selectedDirection,   setSelectedDirection]   = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [selectedDepartement, setSelectedDepartement] = useState<{ label: string; value: string }>({ label: '', value: '' });

  const directionLockedByRole = isByRole && (role === 'ADMIN' || role === 'JURIDICAL');

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

  const handleRoleSelect = (value: string) => {
    if (value === 'ADMIN' || value === 'JURIDICAL') setIsByDirection(false);
    setRole(value);
  };

  const handleByDirectionChange = () => {
    if (directionLockedByRole) { setIsByDirection(false); return; }
    setIsByDirection((d) => !d);
  };

  const handleSubmitFilters = () => {
    const filters: any = {};
    if (isByRole)      filters.role = role;
    if (isByDirection) { filters.directionId = selectedDirection.value; filters.departementId = selectedDepartement.value; }
    if (accountState)  filters.active = isActive ? 'active' : 'not_active';
    handleSetFilters({ ...filters });
    handleClose();
  };

  const handleReset = () => {
    setIsByRole(false); setIsByDirection(false); setAccountState(false);
    handleSetFilters({});
    handleClose();
  };

  useEffect(() => {
    if (initialFilters.role)   { setIsByRole(true); setRole(initialFilters.role); }
    if (initialFilters.active) { setAccountState(true); setIsActive(true); }
    if (initialFilters.directionId && initialFilters.departementId) {
      setIsByDirection(true);
      const selDir = directions.find((d) => d.id === initialFilters.directionId);
      setSelectedDirection({ label: selDir?.abriviation ?? '', value: initialFilters.directionId });
      const selDep = selDir?.departements.find((dp) => dp.id === initialFilters.departementId);
      setSelectedDepartement({ value: initialFilters.departementId, label: selDep?.abriviation ?? '' });
    }
  }, []);

  const activeCount = [isByDirection, isByRole, accountState].filter(Boolean).length;

  return (
    <div className={styles.container}>

      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FilterListOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>Filtres utilisateurs</span>
            <span className={styles.headerSubtitle}>Affiner les résultats</span>
          </div>
        </div>
        {activeCount > 0 && (
          <div className={styles.headerBadge}>{activeCount} actif{activeCount > 1 ? 's' : ''}</div>
        )}
      </div>

      {/* ── Filter sections ── */}
      <div className={styles.sectionsBody}>

        {/* Role */}
        <div className={`${styles.filterSection} ${isByRole ? styles.filterSectionActive : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.sectionIcon}><PersonOutlinedIcon sx={{ fontSize: 15 }} /></div>
              <span className={styles.sectionTitle}>Rôle</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={isByRole} onChange={() => setIsByRole((r) => !r)} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.sectionBody} ${isByRole ? styles.sectionBodyVisible : ''}`}>
            <div className={styles.roleChips}>
              {ROLE_OPTIONS.map(({ value, label, Icon }) => {
                const isSelected = role === value;
                return (
                  <button
                    key={value}
                    className={`${styles.roleChip} ${isSelected && isByRole ? styles.roleChipActive : ''}`}
                    disabled={!isByRole}
                    onClick={() => handleRoleSelect(value)}
                  >
                    <div className={styles.roleChipIcon}><Icon sx={{ fontSize: 16 }} /></div>
                    <span>{label}</span>
                    {isSelected && isByRole && <CheckOutlinedIcon sx={{ fontSize: 11 }} className={styles.roleChipCheck} />}
                  </button>
                );
              })}
            </div>
            {isByRole && (role === 'ADMIN' || role === 'JURIDICAL') && (
              <div className={styles.roleNote}>
                Les administrateurs et juridiques ne sont pas rattachés à une direction.
              </div>
            )}
          </div>
        </div>

        {/* Direction */}
        <div className={`${styles.filterSection} ${isByDirection ? styles.filterSectionActive : ''} ${directionLockedByRole ? styles.filterSectionLocked : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.sectionIcon}><AccountTreeOutlinedIcon sx={{ fontSize: 15 }} /></div>
              <span className={styles.sectionTitle}>Direction et département</span>
              {directionLockedByRole && <span className={styles.lockedPill}>N/A</span>}
            </div>
            <label className={`${styles.toggle} ${directionLockedByRole ? styles.toggleDisabled : ''}`}>
              <input type="checkbox" checked={isByDirection} disabled={directionLockedByRole} onChange={handleByDirectionChange} />
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
                {getDepartementsFromDirections().map((dp, i) => <MenuItem value={dp?.id} key={i}>{dp?.abriviation}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* État compte */}
        <div className={`${styles.filterSection} ${accountState ? styles.filterSectionActive : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <div className={styles.sectionIcon}><ToggleOnOutlinedIcon sx={{ fontSize: 15 }} /></div>
              <span className={styles.sectionTitle}>État du compte</span>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" checked={accountState} onChange={() => setAccountState((a) => !a)} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
          <div className={`${styles.sectionBody} ${accountState ? styles.sectionBodyVisible : ''}`}>
            <div className={styles.stateChips}>
              <button
                className={`${styles.stateChip} ${styles.stateChipActive_} ${accountState && isActive ? styles.stateChipActiveGreen : ''}`}
                disabled={!accountState}
                onClick={() => setIsActive(true)}
              >
                {accountState && isActive && <CheckOutlinedIcon sx={{ fontSize: 11 }} />}
                Actif
              </button>
              <button
                className={`${styles.stateChip} ${accountState && !isActive ? styles.stateChipActiveRed : ''}`}
                disabled={!accountState}
                onClick={() => setIsActive(false)}
              >
                {accountState && !isActive && <CheckOutlinedIcon sx={{ fontSize: 11 }} />}
                Inactif
              </button>
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

export default UsersFilter;
