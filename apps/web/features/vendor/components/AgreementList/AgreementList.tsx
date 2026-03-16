'use client';
import { Button, TextField } from '@mui/material';
import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import Link from 'next/link';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce.hook';
import styles from './AgreementList.module.css';
import { useAgreements } from '@/features/contract/queries/contract.queries';

interface PropType {
  handleClose: () => void;
  type: 'contract' | 'convension';
  vendorId: string;
}

const AgreementList = ({ handleClose, type = 'contract', vendorId }: PropType) => {
  const columns: any[] = [
    { field: 'number', headerName: 'numero', width: 200 },
    { field: 'object', headerName: 'objet', width: 200 },
    { field: 'amount', headerName: 'montant', width: 200 },
    { field: 'expiration_date', headerName: 'expiration', width: 200 },
    { field: 'signature_date', headerName: 'signature', width: 200 },
    { field: 'status', headerName: 'status', width: 200 },
    { field: 'createdAt', headerName: 'date de creation', width: 200 },
    {
      field: 'actions',
      headerName: 'Details',
      type: 'actions',
      renderCell: (params: any) => (
        <Button><Link href={`/${type}s/${params.id}`}>Details</Link></Button>
      ),
    },
  ];

  const { debounce } = useDebounce();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);

  const { data, isFetching } = useAgreements({ page, pageSize, agreementType: type, orderBy, searchQuery, vendorId });

  const handleSortModelChange = (sortModel: GridSortModel) => {
    setOrderBy(sortModel.length > 0 ? sortModel[0].field : undefined);
  };

  const handleSearch = (e: any) => {
    const { value } = e.target;
    debounce(() => setSearchQuery(value), 1000);
  };

  return (
    <div className={styles.container}>
      <span className={styles.title}>{type}</span>
      <div className={styles.searchContainer}>
        <TextField
          placeholder="mot clé..."
          color="secondary"
          size="small"
          fullWidth
          type="search"
          onChange={handleSearch}
          InputProps={{ className: styles.input }}
        />
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
          onPageSizeChange={(newPageSize: number) => setPageSize(newPageSize)}
          columns={columns}
          disableColumnFilter
          disableColumnMenu
          onSortModelChange={handleSortModelChange}
        />
      </div>
    </div>
  );
};

export default AgreementList;
