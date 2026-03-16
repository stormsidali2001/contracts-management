import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from '@/hooks/redux/hooks';
import {
  login,
  logout,
  forgotPassword,
  resetPassword,
  selectRecieveNotifications,
} from '@/features/auth/authSlice';
import { LoginUser } from '@/features/auth/models/login-user.interface';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';

// ---------------------------------------------------------------------------
// Auth mutations wrap Redux thunks so components stay decoupled from dispatch.
// The JWT and user state live in Redux; React Query only manages the async
// lifecycle (isPending, isError, etc.) of each call.
// ---------------------------------------------------------------------------

export const useLogin = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (user: LoginUser) => dispatch(login(user)).unwrap(),
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: () => dispatch(logout({ axios_instance: axios })).unwrap(),
  });
};

export const useForgotPassword = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (email: string) => dispatch(forgotPassword(email)).unwrap(),
  });
};

export const useResetPassword = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (payload: { password: string; token: string; userId: string }) =>
      dispatch(resetPassword(payload)).unwrap(),
  });
};

export const useToggleNotifications = () => {
  const dispatch = useAppDispatch();
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: () =>
      dispatch(selectRecieveNotifications({ axios_instance: axios })).unwrap(),
  });
};

export const useChangePassword = () => {
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: (payload: { actualPassword: string; password: string }) =>
      axios.post('/auth/connected-user/reset-password', payload).then((r) => r.data),
  });
};
