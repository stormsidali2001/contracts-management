'use client';
import styles from './UserActions.module.css';
import { Box, CircularProgress, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import Check from '@mui/icons-material/Check';
import { Save } from '@mui/icons-material';
import { useUpdateUser } from '@/features/user/queries/user.queries';

const UserActions = ({ params, rowId, setRowId }: any) => {
  const [success, setSuccess] = useState(false);
  const { mutate: updateUser, isPending: loading } = useUpdateUser();

  const handleSubmit = () => {
    const { id, role, active, email, firstName, lastName, username } = params.row;
    updateUser(
      { id, role, active, email, firstName, lastName, username },
      {
        onSuccess: () => {
          setSuccess(true);
          setRowId(null);
        },
      },
    );
  };

  useEffect(() => {
    if (params.id === rowId && success) {
      setSuccess(false);
    }
  }, [rowId]);

  return (
    <Box className={styles.container} sx={{ m: 1, position: 'relative' }}>
      {success ? (
        <Check color="secondary" sx={{ width: 25, height: 25 }} />
      ) : (
        <Button color="primary" sx={{ width: 30, height: 30, boxShadow: 'none' }} disabled={params.id !== rowId || loading} onClick={() => handleSubmit()}>
          <Save sx={{ boxShadow: 'none' }} />
        </Button>
      )}
      {loading && <CircularProgress size={30} sx={{ position: 'absolute', top: '0', left: '15px', transform: 'translate(-50%,-50%)', zIndex: 1 }} />}
    </Box>
  );
};

export default UserActions;
