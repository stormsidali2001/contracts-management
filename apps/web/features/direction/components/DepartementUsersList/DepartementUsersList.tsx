'use client';
import { Avatar, Chip, IconButton, TextField } from '@mui/material';
import { DataGrid, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce.hook';
import styles from './DepartementUsersList.module.css';
import { useUsers } from '@/features/user/queries/user.queries';
import { BASE_URL } from '@/api/axios';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from '@/lib/tokens';

interface PropType {
  handleClose: () => void;
  departementId: string;
  departementName?: string;
}

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  ADMIN:     { label: 'Admin',     bg: tokens.color.navy,            color: tokens.color.textOnDark },
  JURIDICAL: { label: 'Juridique', bg: tokens.color.navyLight,       color: tokens.color.navyMid },
  EMPLOYEE:  { label: 'Employé',   bg: 'rgba(22,163,74,0.12)',       color: tokens.color.successDark },
};

const chipSx = {
  height: 20,
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

const DepartementUsersList = ({ handleClose, departementId, departementName }: PropType) => {
  const { debounce } = useDebounce();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);

  const { data, isFetching } = useUsers({ page: paginationModel.page, pageSize: paginationModel.pageSize, orderBy, searchQuery, departementId });

  const handleSortModelChange = (sortModel: GridSortModel) => {
    setOrderBy(sortModel.length > 0 ? sortModel[0].field : undefined);
  };

  const handleSearch = (e: any) => {
    const { value } = e.target;
    debounce(() => setSearchQuery(value), 1000);
  };

  const columns: any[] = useMemo(() => [
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
    { field: 'firstName', headerName: 'Prénom', width: 110 },
    { field: 'lastName',  headerName: 'Nom',    width: 110 },
    {
      field: 'role',
      headerName: 'Rôle',
      width: 115,
      renderCell: (params: GridRenderCellParams) => {
        const cfg = ROLE_CONFIG[params.value as string] ?? { label: String(params.value), bg: tokens.color.surfaceSubtle, color: tokens.color.textSecondary };
        return <Chip label={cfg.label} size="small" sx={{ ...chipSx, background: cfg.bg, color: cfg.color }} />;
      },
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'active',
      headerName: 'Statut',
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <span style={{
          display: 'inline-flex',
          padding: '2px 9px',
          borderRadius: 99,
          background: params.value ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.10)',
          color: params.value ? tokens.color.successDark : tokens.color.errorDark,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.6,
        }}>
          {params.value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Créé le',
      width: 105,
      valueFormatter: (value: string) => formatDate(value),
    },
  ], []);

  return (
    <div className={styles.container}>
      {/* ── Navy header ── */}
      <div className={styles.modalHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div className={styles.headerText}>
            <div className={styles.headerTitle}>
              {departementName ? `Membres — ${departementName}` : 'Membres du département'}
            </div>
            <div className={styles.headerSubtitle}>Liste des utilisateurs</div>
          </div>
        </div>
        <IconButton className={styles.closeBtn} onClick={handleClose} aria-label="Fermer">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </div>

      {/* ── Search toolbar ── */}
      <div className={styles.searchContainer}>
        <TextField
          placeholder="Rechercher un membre..."
          color="primary"
          size="small"
          fullWidth
          type="search"
          onChange={handleSearch}
          InputProps={{ className: styles.input }}
        />
        {data?.total != null && (
          <span className={styles.totalPill}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
            {data.total} membre{data.total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── DataGrid ── */}
      <div className={styles.tableContainer}>
        <DataGrid
          autoHeight
          rowHeight={52}
          rows={data?.data ?? []}
          rowCount={data?.total ?? 0}
          loading={isFetching}
          pageSizeOptions={[5, 10, 20]}
          pagination
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          columns={columns}
          disableColumnFilter
          disableColumnMenu
          onSortModelChange={handleSortModelChange}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
};

export default DepartementUsersList;
