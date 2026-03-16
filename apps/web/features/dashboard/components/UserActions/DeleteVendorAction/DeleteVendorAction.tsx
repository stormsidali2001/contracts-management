'use client';
import styles from './DeleteVendorAction.module.css';
import { Box, CircularProgress, Button } from '@mui/material';
import { useState } from 'react';
import Check from '@mui/icons-material/Check';
import { DeleteForever } from '@mui/icons-material';
import { useAppDispatch } from '@/hooks/redux/hooks';
import { showSnackbar } from '@/features/ui/UiSlice';
import { useDeleteVendor } from '@/features/vendor/queries/vendor.queries';

const DeleteVendorAction = ({ params }: any) => {
  const [success, setSuccess] = useState(false);
  const dispatch = useAppDispatch();
  const { mutate: deleteVendor, isPending: loading } = useDeleteVendor();

  const handleSubmit = () => {
    const { id } = params.row;
    deleteVendor(id, {
      onSuccess: () => {
        setSuccess(true);
        dispatch(showSnackbar({ message: 'le vendor a eté supprimé avec success', severty: 'success' }));
      },
      onError: (err: any) => {
        dispatch(showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnu', severty: 'error' }));
      },
    });
  };

  return (
    <Box className={styles.container} sx={{ m: 1, position: 'relative' }}>
      {success ? (
        <Check color="secondary" sx={{ width: 25, height: 25 }} />
      ) : (
        <Button color="primary" sx={{ width: 30, height: 30, boxShadow: 'none' }} onClick={() => handleSubmit()}>
          <DeleteForever sx={{ boxShadow: 'none', width: '36px' }} />
        </Button>
      )}
      {loading && <CircularProgress size={30} sx={{ position: 'absolute', top: '0', left: '15px', transform: 'translate(-50%,-50%)', zIndex: 1 }} />}
    </Box>
  );
};

export default DeleteVendorAction;
