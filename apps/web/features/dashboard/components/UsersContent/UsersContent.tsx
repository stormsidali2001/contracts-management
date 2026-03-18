'use client';
import styles from './UserContent.module.css';
import { Avatar, Badge, Button, Chip, IconButton, Modal } from '@mui/material';
import FilterIcon from '@/icons/FilterIcon';
import TextField from '@mui/material/TextField';
import { useMemo, useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateUser from '@/features/dashboard/components/CreateUser/CreateUser';
import { useDebounce } from '@/hooks/useDebounce.hook';
import UserActions from '@/features/dashboard/components/UserActions/UserActions';
import Link from 'next/link';
import UsersFilter from '@/features/dashboard/components/UsersFilter/UsersFilter';
import { UserRole } from '@/features/auth/models/user-role.enum';
import { useAuthStore } from '@/features/auth/store/auth.store';
import DeleteUserAction from '@/features/dashboard/components/UserActions/DeleteUserAction/DeleteUserAction';
import { DataGrid, GridColumns, GridRenderCellParams, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import { useUsers } from '@/features/user/queries/user.queries';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';
import { tokens } from '@/lib/tokens';
import { BASE_URL } from '@/api/axios';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

interface Filters {
  directionId?: string;
  departementId?: string;
  active?: 'active' | 'not_active';
  role?: UserRole;
}

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  ADMIN:     { label: 'Admin',     bg: tokens.color.navy,              color: tokens.color.textOnDark },
  JURIDICAL: { label: 'Juridique', bg: tokens.color.navyLight,         color: tokens.color.navyMid },
  EMPLOYEE:  { label: 'Employé',   bg: 'rgba(22,163,74,0.12)',         color: tokens.color.successDark },
};

const chipSx = {
  height: 22,
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  border: 'none',
  '& .MuiChip-label': { px: '8px' },
};

const pill = (bg: string, color: string, label: string) => (
  <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
    {label}
  </span>
);

const formatDate = (raw: string | null | undefined) => {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const UsersContent = () => {
  const [filterModalOpen, setFilterModalOPen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const user = useAuthStore((s) => s.user);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [rowId, setRowId] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { debounce } = useDebounce();
  const [queryOptions, setQueryOptions] = useState<{ sortModel: GridSortItem[] | null }>({ sortModel: null });
  const [open, setOpen] = useState(false);

  const { data: statsData } = useStatistics({});
  const userTypes = statsData?.userTypes ?? null;

  const { data, isFetching } = useUsers({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    orderBy: queryOptions.sortModel?.[0]?.field,
    searchQuery: searchQuery || undefined,
    directionId: filters?.directionId,
    departementId: filters?.departementId,
    role: filters?.role,
  });

  const handleSortModelChange = (sortModel: GridSortModel) => {
    if (sortModel) setQueryOptions({ sortModel: [...sortModel] });
  };

  const handleSearch = (e: any) => {
    const { value } = e.target;
    debounce(() => setSearchQuery(value), 1000);
  };

  const countFilters = () => {
    if (filters == null) return 0;
    let count = 0;
    Object.keys(filters).forEach((f) => { if (f !== 'departementId') count++; });
    return count;
  };

  function shouldDisplayAddUser() {
    return user?.role === UserRole.ADMIN;
  }

  const columns: GridColumns<any> = useMemo(
    () => {
      const editable = shouldDisplayAddUser();
      const original: GridColumns<any> = [
        {
          field: 'imageUrl',
          headerName: 'Photo',
          renderCell: (params: GridRenderCellParams) => (
            <Avatar
              src={params.row.imageUrl ? `${BASE_URL}/users/image/${params.row.imageUrl}` : '/blank-profile-picture.png'}
              sx={{ width: 32, height: 32 }}
            />
          ),
          align: 'center',
          headerAlign: 'center',
          sortable: false,
          width: 64,
        },
        { field: 'firstName', headerName: 'Prénom',        width: 110, editable },
        { field: 'lastName',  headerName: 'Nom',           width: 110, editable },
        {
          field: 'role',
          headerName: 'Rôle',
          width: 120,
          valueOptions: ['ADMIN', 'JURIDICAL', 'EMPLOYEE'],
          type: 'singleSelect',
          editable,
          renderCell: (params: GridRenderCellParams) => {
            const cfg = ROLE_CONFIG[params.value as string] ?? { label: String(params.value), bg: tokens.color.surfaceSubtle, color: tokens.color.textSecondary };
            return <Chip label={cfg.label} size="small" sx={{ ...chipSx, background: cfg.bg, color: cfg.color }} />;
          },
        },
        { field: 'email',    headerName: 'Email',          width: 200, editable },
        {
          field: 'active',
          headerName: 'Statut',
          width: 90,
          editable,
          renderCell: (params: GridRenderCellParams) =>
            params.value
              ? pill('rgba(22,163,74,0.12)', tokens.color.successDark, 'Actif')
              : pill('rgba(220,38,38,0.10)', tokens.color.errorDark,   'Inactif'),
        },
        {
          field: 'created_at',
          headerName: 'Créé le',
          editable,
          width: 110,
          valueFormatter: (value: string) => formatDate(value),
        },
        { field: 'username', headerName: "Nom d'util.", editable, width: 140 },
        {
          field: 'details',
          headerName: '',
          type: 'actions',
          width: 56,
          renderCell: (params: any) => (
            <Link href={`/users/${params.id}`} style={{ textDecoration: 'none' }}>
              <IconButton size="small" sx={{ color: tokens.color.navyMid }}>
                <ChevronRightIcon sx={{ fontSize: '20px' }} />
              </IconButton>
            </Link>
          ),
        },
      ];
      const extra: GridColumns<any> = [
        ...original,
        {
          field: 'actions',
          headerName: 'Mise à jour',
          type: 'actions',
          renderCell: (params: any) => <UserActions {...{ params, rowId, setRowId }} />,
        },
        {
          field: 'actions1',
          headerName: 'Supprimer',
          type: 'actions',
          renderCell: (params) => <DeleteUserAction {...{ params }} />,
        },
      ];
      return shouldDisplayAddUser() ? extra : original;
    },
    [rowId, shouldDisplayAddUser()], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className={styles.container}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Gestion des utilisateurs</h1>
          <span className={styles.pageSubtitle}>Consultez, créez et gérez les comptes de votre organisation</span>
        </div>
        {shouldDisplayAddUser() && (
          <Button
            aria-label="Créer un utilisateur"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpen(true)}
            className={styles.pageAddButton}
            variant="contained"
            color="primary"
            size="small"
          >
            Nouvel utilisateur
          </Button>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><PeopleAltOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{userTypes?.total ?? data?.total ?? '—'}</span>
            <span className={styles.statLabel}>Total utilisateurs</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{userTypes?.admin ?? '—'}</span>
            <span className={styles.statLabel}>Admins</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><GavelOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{userTypes?.juridical ?? '—'}</span>
            <span className={styles.statLabel}>Juridiques</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><BadgeOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{userTypes?.employee ?? '—'}</span>
            <span className={styles.statLabel}>Employés</span>
          </div>
        </div>
      </div>

      <div className={styles.wrapperBox}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <span className={styles.cardTitle}>Utilisateurs</span>
            {data?.total != null && <span className={styles.cardCount}>{data.total} au total</span>}
          </div>
        </div>
        <div className={styles.searchContainer}>
          <Badge badgeContent={countFilters()} sx={{ padding: 0 }} className={styles.searchBadge}>
            <Button startIcon={<FilterIcon />} size="small" color="primary" variant="contained" onClick={() => setFilterModalOPen(true)} className={styles.advancedButton}>
              Filtrer
            </Button>
          </Badge>
          <TextField placeholder="Rechercher un utilisateur..." color="primary" size="small" fullWidth type="search" onChange={handleSearch} InputProps={{ className: styles.input }} />
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
            experimentalFeatures={{ newEditingApi: true }}
            onCellEditStop={(params) => setRowId(params.id)}
            getRowId={(row) => row.id}
          />
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <CreateUser handleClose={() => setOpen(false)} />
      </Modal>
      <Modal open={filterModalOpen} onClose={() => setFilterModalOPen(false)} aria-labelledby="modal-filter-modal-title" aria-describedby="modal-filter-modal-description">
        <UsersFilter initialFilters={filters ?? ({} as Filters)} handleClose={() => setFilterModalOPen(false)} handleSetFilters={setFilters} />
      </Modal>
    </div>
  );
};

export default UsersContent;
