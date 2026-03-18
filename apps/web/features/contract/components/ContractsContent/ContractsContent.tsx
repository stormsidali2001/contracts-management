'use client';
import { Badge, Button, Chip, IconButton, Modal } from '@mui/material';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import TextField from '@mui/material/TextField';
import { useMemo, useState } from 'react';
import styles from './ContractsContent.module.css';
import FilterIcon from '@/icons/FilterIcon';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateContract from '@/features/contract/components/CreateContract/CreateContract';
import { useDebounce } from '@/hooks/useDebounce.hook';
import Link from 'next/link';
import ContractsFilter from '@/features/contract/components/ContractsFilter/ContractsFilter';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { UserRole } from '@/features/auth/models/user-role.enum';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useContracts } from '@/features/contract/queries/contract.queries';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';
import { tokens } from '@/lib/tokens';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';

enum AgreementStatus {
  executed = 'executed',
  executed_with_delay = 'executed_with_delay',
  in_execution = 'in_execution',
  in_execution_with_delay = 'in_execution_with_delay',
  not_executed = 'not_executed',
}

interface Filters {
  directionId?: string;
  departementId?: string;
  start_date?: string;
  end_date?: string;
  amount_min?: number;
  amount_max?: number;
  status?: AgreementStatus;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  not_executed:            { label: 'Non exécuté',       bg: 'rgba(220,38,38,0.10)',  color: tokens.color.errorDark },
  executed:                { label: 'Exécuté',           bg: 'rgba(22,163,74,0.10)',  color: tokens.color.successDark },
  executed_with_delay:     { label: 'Exécuté (retard)',  bg: 'rgba(217,119,6,0.10)',  color: tokens.color.warningDark },
  in_execution:            { label: 'En cours',          bg: 'rgba(23,73,142,0.10)',  color: tokens.color.navyMid },
  in_execution_with_delay: { label: 'En cours (retard)', bg: 'rgba(245,158,11,0.10)', color: tokens.color.warningDark },
};

const chipSx = {
  height: 22,
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  border: 'none',
  '& .MuiChip-label': { px: '8px' },
};

const formatDate = (raw: string | null | undefined) => {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatAmount = (v: number | null | undefined) =>
  v == null ? '—' : new Intl.NumberFormat('fr-DZ').format(v) + ' DA';

const ContractsContent = () => {
  const [filterModalOpen, setFilterModalOPen] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const { debounce } = useDebounce();
  const [queryOptions, setQueryOptions] = useState<{ sortModel: GridSortItem[] | null }>({ sortModel: null });
  const [open, setOpen] = useState(false);

  const { data: statsData } = useStatistics({});
  const agreementTypes = statsData?.agreementsStats?.types ?? null;
  const totalAccords = agreementTypes ? (agreementTypes.contract ?? 0) + (agreementTypes.convension ?? 0) : null;

  const { data, isFetching } = useContracts({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    orderBy: queryOptions.sortModel?.[0]?.field,
    searchQuery: searchQuery || undefined,
    directionId: filters?.directionId,
    departementId: filters?.departementId,
    status: filters?.status,
  });

  const handleSortModelChange = (sortModel: GridSortModel) => {
    setQueryOptions({ sortModel: [...sortModel] });
  };

  const handleSearch = (e: any) => {
    const { value } = e.target;
    debounce(() => setSearchQuery(value), 1000);
  };

  const countFilters = () => {
    if (filters == null) return 0;
    let count = 0;
    Object.keys(filters).forEach((f) => { if (!['departementId', 'amount_min', 'start_date'].includes(f)) count++; });
    return count;
  };

  const canCreateAgreement = () => user?.role === UserRole.JURIDICAL;

  const columns: GridColumns<any> = useMemo(() => [
    { field: 'number',  headerName: 'Numéro',    width: 130 },
    { field: 'object',  headerName: 'Objet',     flex: 1, minWidth: 180 },
    {
      field: 'amount',
      headerName: 'Montant',
      width: 150,
      valueFormatter: (value: number) => formatAmount(value),
    },
    {
      field: 'expiration_date',
      headerName: 'Expiration',
      width: 110,
      valueFormatter: (value: string) => formatDate(value),
    },
    {
      field: 'signature_date',
      headerName: 'Signature',
      width: 110,
      valueFormatter: (value: string) => formatDate(value),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 185,
      renderCell: (params: any) => {
        const cfg = STATUS_CONFIG[params.value as string] ?? { label: String(params.value), bg: tokens.color.surfaceSubtle, color: tokens.color.textSecondary };
        return <Chip label={cfg.label} size="small" sx={{ ...chipSx, background: cfg.bg, color: cfg.color }} />;
      },
    },
    {
      field: 'createdAt',
      headerName: 'Créé le',
      width: 110,
      valueFormatter: (value: string) => formatDate(value),
    },
    {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 56,
      renderCell: (params: any) => (
        <Link href={`/contracts/${params.id}`} style={{ textDecoration: 'none' }}>
          <IconButton size="small" sx={{ color: tokens.color.navyMid }}>
            <ChevronRightIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        </Link>
      ),
    },
  ], []);

  return (
    <div className={styles.container}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Gestion des contrats</h1>
          <span className={styles.pageSubtitle}>Suivez l'état d'avancement et gérez vos contrats d'accords</span>
        </div>
        {canCreateAgreement() && (
          <Button
            aria-label="Créer un contrat"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpen(true)}
            className={styles.pageAddButton}
            variant="contained"
            color="primary"
            size="small"
          >
            Nouveau contrat
          </Button>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><DescriptionOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{data?.total ?? '—'}</span>
            <span className={styles.statLabel}>Total contrats</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><HandshakeOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{agreementTypes?.convension ?? '—'}</span>
            <span className={styles.statLabel}>Conventions</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FolderOpenOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalAccords ?? '—'}</span>
            <span className={styles.statLabel}>Total accords</span>
          </div>
        </div>
      </div>

      <div className={styles.wrapperBox}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <span className={styles.cardTitle}>Contrats</span>
            {data?.total != null && <span className={styles.cardCount}>{data.total} au total</span>}
          </div>
        </div>
        <div className={styles.searchContainer}>
          <Badge badgeContent={countFilters()} sx={{ padding: 0 }} className={styles.searchBadge}>
            <Button startIcon={<FilterIcon />} size="small" color="primary" variant="contained" onClick={() => setFilterModalOPen(true)} className={styles.advancedButton}>
              Filtrer
            </Button>
          </Badge>
          <TextField placeholder="Rechercher un contrat..." color="primary" size="small" fullWidth type="search" onChange={handleSearch} InputProps={{ className: styles.input }} />
        </div>
        <div className={styles.tableContainer}>
          <DataGrid
            autoHeight
            rowHeight={52}
            rows={data?.data ?? []}
            rowCount={data?.total ?? 0}
            loading={isFetching}
            pageSizeOptions={[5]}
            pagination
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            columns={columns}
            disableColumnFilter
            disableColumnMenu
            onSortModelChange={handleSortModelChange}
          />
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <CreateContract handleClose={() => setOpen(false)} />
      </Modal>
      <Modal open={filterModalOpen} onClose={() => setFilterModalOPen(false)} aria-labelledby="modal-filter-modal-title" aria-describedby="modal-filter-modal-description">
        <ContractsFilter initialFilters={filters ?? ({} as any)} handleClose={() => setFilterModalOPen(false)} handleSetFilters={(f: any) => setFilters(f)} />
      </Modal>
    </div>
  );
};

export default ContractsContent;
