import { useMutation } from '@tanstack/react-query';
import useAxiosPrivate from '@/hooks/auth/useAxiosPrivate';
import { useNotificationStore } from '@/features/notification/store/notification.store';

export const useMarkAsRead = () => {
  const axios = useAxiosPrivate({});
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  return useMutation({
    mutationFn: (notificationId: string) =>
      axios.patch(`/notifications/${notificationId}/read`),
    onMutate: (notificationId) => markAsRead(notificationId),
  });
};

export const useMarkAllAsRead = () => {
  const axios = useAxiosPrivate({});
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return useMutation({
    mutationFn: () => axios.patch('/notifications/read-all'),
    onMutate: () => markAllAsRead(),
  });
};
