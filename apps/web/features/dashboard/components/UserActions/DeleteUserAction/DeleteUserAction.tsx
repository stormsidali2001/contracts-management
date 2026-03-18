'use client';
import styles from './DeleteUserAction.module.css';
import { Box, CircularProgress, Button } from '@mui/material';
import { useState } from 'react';
import Check from '@mui/icons-material/Check';
import { DeleteForever } from '@mui/icons-material';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';
import { useDeleteUser } from '@/features/user/queries/user.queries';

const DeleteUserAction = ({ params }: any) => {
  const [success, setSuccess] = useState(false);
  const showSnackbar = useSnackbarStore((s) => s.showSnackbar);
  const { mutate: deleteUser, isPending: loading } = useDeleteUser();

  const handleSubmit = () => {
    const { id } = params.row;
    deleteUser(id, {
      onSuccess: () => {
        setSuccess(true);
        showSnackbar({ message: "l'utilisateur a eté supprimé avec success", severty: 'success' });
      },
      onError: (err: any) => {
        showSnackbar({ message: err?.response?.data?.error ?? 'erreur inconnu', severty: 'error' });
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

export default DeleteUserAction;
