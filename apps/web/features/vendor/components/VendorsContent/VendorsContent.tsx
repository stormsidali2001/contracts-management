'use client';
import { Button, IconButton, Modal } from '@mui/material';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TextField from '@mui/material/TextField';
import styles from './VendorsContent.module.css';
import CreateVendor from '@/features/vendor/components/CreateVendor/CreateVendor';
import { useDebounce } from '@/hooks/useDebounce.hook';
import VendorActions from '@/features/dashboard/VendorActions/VendorActions';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { UserRole } from '@/features/auth/models/user-role.enum';
import DeleteVendorAction from '@/features/dashboard/components/UserActions/DeleteVendorAction/DeleteVendorAction';
import { useVendors } from '@/features/vendor/queries/vendor.queries';
import { useStatistics } from '@/features/statistics/queries/statistics.queries';
import { tokens } from '@/lib/tokens';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';

const VendorsContent = () => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [rowId, setRowId] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [queryOptions, setQueryOptions] = useState<{ sortModel: GridSortItem[] | null }>({ sortModel: null });
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { debounce } = useDebounce();

  const { data: statsData } = useStatistics({});
  const agreementTypes = statsData?.agreementsStats?.types ?? null;

  const { data, isFetching } = useVendors({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    orderBy: queryOptions.sortModel?.[0]?.field,
    searchQuery: searchQuery || undefined,
  });

  function showDisplayAddVendor() {
    return Boolean(user?.role === UserRole.JURIDICAL);
  }

  const columns: GridColumns<any> = useMemo(
    () => {
      const editable = showDisplayAddVendor();
      const original: GridColumns<any> = [
        { field: 'num',                 headerName: 'Numéro',         width: 130, editable },
        { field: 'company_name',        headerName: 'Raison sociale', flex: 1, minWidth: 180, editable },
        { field: 'nif',                 headerName: 'NIF',            width: 130, editable },
        { field: 'address',             headerName: 'Adresse',        flex: 1, minWidth: 160, editable },
        { field: 'mobile_phone_number', headerName: 'Mobile',         width: 130, editable },
        { field: 'home_phone_number',   headerName: 'Fixe',           width: 120, editable },
        {
          field: 'details',
          headerName: '',
          type: 'actions',
          width: 56,
          renderCell: (params: any) => (
            <Link href={`/vendors/${params.id}`} style={{ textDecoration: 'none' }}>
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
          renderCell: (params: any) => <VendorActions {...{ params, rowId, setRowId }} />,
        },
        {
          field: 'actions1',
          headerName: 'Supprimer',
          type: 'actions',
          renderCell: (params) => <DeleteVendorAction {...{ params }} />,
        },
      ];
      return editable ? extra : original;
    },
    [showDisplayAddVendor(), rowId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSortModelChange = (sortModel: GridSortModel) => {
    if (sortModel) setQueryOptions({ sortModel: [...sortModel] });
  };

  const handleSearch = (e: any) => {
    const { value } = e.target;
    debounce(() => setSearchQuery(value), 1000);
  };

  return (
    <div className={styles.container}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Gestion des fournisseurs</h1>
          <span className={styles.pageSubtitle}>Consultez et gérez les fournisseurs ainsi que leurs accords associés</span>
        </div>
        {showDisplayAddVendor() && (
          <Button
            aria-label="Créer un fournisseur"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpen(true)}
            className={styles.pageAddButton}
            variant="contained"
            color="primary"
            size="small"
          >
            Nouveau fournisseur
          </Button>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><StorefrontOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{data?.total ?? '—'}</span>
            <span className={styles.statLabel}>Total fournisseurs</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><DescriptionOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{agreementTypes?.contract ?? '—'}</span>
            <span className={styles.statLabel}>Contrats associés</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><HandshakeOutlinedIcon sx={{ fontSize: 18 }} /></div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{agreementTypes?.convension ?? '—'}</span>
            <span className={styles.statLabel}>Conventions associées</span>
          </div>
        </div>
      </div>

      <div className={styles.wrapperBox}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <span className={styles.cardTitle}>Fournisseurs</span>
            {data?.total != null && (
              <span className={styles.cardCount}>{data.total} au total</span>
            )}
          </div>
        </div>
        <div className={styles.searchContainer}>
          <TextField placeholder="Rechercher un fournisseur..." color="primary" size="small" fullWidth type="search" onChange={handleSearch} InputProps={{ className: styles.input }} />
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
        <CreateVendor handleClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};

export default VendorsContent;
