import { create } from 'zustand';
import { AlertColor } from '@mui/material';

interface SnackbarStore {
  message: string;
  open: boolean;
  severty: AlertColor;
  showSnackbar: (payload: { message: string; severty?: AlertColor }) => void;
  clear: () => void;
}

export const useSnackbarStore = create<SnackbarStore>((set) => ({
  message: '',
  open: false,
  severty: 'error',

  showSnackbar: ({ message, severty }) =>
    set({ open: true, message, severty: severty ?? 'error' }),

  clear: () => set({ open: false, message: '', severty: 'error' }),
}));
