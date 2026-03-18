import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import authService from '@/features/auth/services/auth.service';
import { LoginUser } from '@/features/auth/models/login-user.interface';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';

export const useLogin = () => {
  const setCredentials = useAuthStore((s) => s.setCredentials);
  return useMutation({
    mutationFn: (user: LoginUser) => authService.login(user),
    onSuccess: (data) => {
      if (data.user && data.jwt) setCredentials(data.user, data.jwt);
    },
  });
};

export const useLogout = () => {
  const clearCredentials = useAuthStore((s) => s.clearCredentials);
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: () => authService.logout({ axios_instance: axios }),
    onSuccess: () => clearCredentials(),
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: { password: string; token: string; userId: string }) =>
      authService.resetPassword(payload),
  });

export const useToggleNotifications = () => {
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const user = useAuthStore((s) => s.user);
  const jwt = useAuthStore((s) => s.jwt);
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: () => authService.selectRecieveNotification({ axios_instance: axios }),
    onSuccess: () => {
      if (user && jwt) {
        setCredentials(
          { ...user, recieve_notifications: !user.recieve_notifications },
          jwt,
        );
      }
    },
  });
};

export const useChangePassword = () => {
  const axios = useAxiosPrivate({});
  return useMutation({
    mutationFn: (payload: { actualPassword: string; password: string }) =>
      axios.post('/auth/connected-user/reset-password', payload).then((r) => r.data),
  });
};
