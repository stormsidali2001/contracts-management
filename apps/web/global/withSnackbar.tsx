import { Alert, Snackbar } from '@mui/material';
import { useSnackbarStore } from '@/features/ui/store/snackbar.store';

const WithSnackbar = ({ children }: any) => {
  const { message, open, severty, clear } = useSnackbarStore();

  return (
    <>
      {children}
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        open={open}
        autoHideDuration={3000}
        onClose={clear}
      >
        <Alert onClose={clear} severity={severty} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WithSnackbar;
