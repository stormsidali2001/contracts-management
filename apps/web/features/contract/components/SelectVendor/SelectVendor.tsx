'use client';
import styles from './SelectVendor.module.css';
import { Button, TextField, Typography, Stack } from '@mui/material';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce.hook';
import { DataGrid, GridColumns, GridSortItem, GridSortModel } from '@mui/x-data-grid';
import { useVendors } from '@/features/vendor/queries/vendor.queries';

const columns: GridColumns<any> = [
  { field: 'num', headerName: 'numero', width: 150 },
  { field: 'company_name', headerName: 'raison sociale', width: 125 },
  { field: 'nif', headerName: 'nif', width: 150 },
  { field: 'address', headerName: 'adresse', width: 150 },
  { field: 'mobile_phone_number', headerName: 'mobile', width: 130 },
  { field: 'home_phone_number', headerName: 'fixe', width: 130 },
];

interface PropType {
  handleClose: () => void;
  selectVendor: (vendor: any) => void;
}

const SelectVendor = ({ handleClose, selectVendor }: PropType) => {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [searchQuery, setSearchQuery] = useState('');
  const { debounce } = useDebounce();
  const [queryOptions, setQueryOptions] = useState<{ sortModel: GridSortItem[] | null }>({ sortModel: null });
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const { data, isFetching } = useVendors({
    page,
    pageSize,
    orderBy: queryOptions.sortModel?.[0]?.field,
    searchQuery: searchQuery || undefined,
  });

  const handleSearch = (e: any) => {
    const { value } = e.target;
    debounce(() => setSearchQuery(value), 1000);
  };

  const handleSortModelChange = (sortModel: GridSortModel) => {
    if (sortModel) setQueryOptions({ sortModel: [...sortModel] });
  };

  const handleConfirm = (e: any) => {
    e.preventDefault();
    selectVendor(selectedVendor);
    handleClose();
  };

  return (
    <div className={styles.container}>
      <Typography sx={{ margin: '-5px 0 10px 0', fontSize: '14px', color: 'text.secondary' }}>Selectioner un fournisseur</Typography>
      <div className={styles.searchContainer}>
        <TextField placeholder="mot clé..." color="secondary" size="small" fullWidth type="search" onChange={handleSearch} InputProps={{ className: styles.input }} />
      </div>
      <div className={styles.tableContainer}>
        <DataGrid
          autoHeight
          rows={data?.data ?? []}
          rowCount={data?.total ?? 0}
          loading={isFetching}
          rowsPerPageOptions={[5, 10, 20]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          onPageChange={(newPage: number) => setPage(newPage)}
          columns={columns}
          disableColumnFilter
          disableColumnMenu
          onSortModelChange={handleSortModelChange}
          onSelectionModelChange={(itm) => {
            const id = itm[0];
            const row = data?.data?.find((row: any) => row.id === id);
            setSelectedVendor(row);
          }}
        />
      </div>
      <Stack direction="row" justifyContent="center" gap={3} className={styles.actionButtons}>
        <Button onClick={() => handleClose()}>Fermer</Button>
        <Button disabled={selectedVendor == null} onClick={handleConfirm}>
          Confirmer
        </Button>
      </Stack>
    </div>
  );
};

export default SelectVendor;
