import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useNotificationStore } from '@/features/notification/store/notification.store';
import { useDateRangeStore } from '@/features/statistics/store/date-range.store';
import { queryClient } from '@/lib/query-client';
import { statisticsKeys } from '@/lib/query-keys';
import { SERVER_URL } from '@/api/axios';
import authService from '@/features/auth/services/auth.service';
import { Notification } from '@/features/notification/models/Notification.interface';
import { NotificationEvents } from '@/features/notification/models/NotificationEvents';
import { UserEvent } from '@/features/notification/models/UserEvent.interface';
import { UserEventsTypes } from '@/features/notification/models/UserEventTypes.enum';
import { Entity } from '@/features/notification/models/Entity.enum';
import { Operation } from '@/features/notification/models/Operation.enum';

export function useNotificationSocket() {
  const jwt = useAuthStore((s) => s.jwt);
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const {
    setConnecting,
    setConnected,
    receiveNotification,
    receiveNotifications,
    receiveUserEvent,
    receiveUserEvents,
    isConnected,
  } = useNotificationStore();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!jwt || isConnected || socketRef.current) return;

    setConnecting();
    const socket = io(`${SERVER_URL}/notifications`, {
      auth: { token: jwt },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected();
      socket.emit(NotificationEvents.RequestAllNotifications);
      socket.emit(UserEventsTypes.REQUEST_ALL_EVENTS);
    });

    socket.on('connect_error', async (err) => {
      if (err?.message?.includes('unauthorized')) {
        socket.close();
        socket.removeAllListeners();
        setTimeout(async () => {
          try {
            const data = await authService.refresh();
            setCredentials(data.user!, data.jwt!);
            socket.auth = { token: data.jwt };
            socket.connect();
          } catch {
            // refresh failed — user will be redirected by withPrivate
          }
        }, 2000);
      }
    });

    socket.on(NotificationEvents.SendAllNotifications, (notifications: Notification[]) => {
      receiveNotifications(notifications);
    });

    socket.on(NotificationEvents.sendNotification, (notification: string) => {
      receiveNotification({ id: Date.now().toString(), message: notification });
    });

    socket.on(UserEventsTypes.SEND_EVENTS, (events: UserEvent[]) => {
      receiveUserEvents(events);
    });

    socket.on(UserEventsTypes.SEND_EVENT, (event: UserEvent) => {
      receiveUserEvent(event);
    });

    socket.on('INCR_USER', (_: { type: Entity; operation: Operation }) => {
      const { start_date, end_date } = useDateRangeStore.getState();
      if (start_date || end_date) return;
      queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
    });

    socket.on('INC_AGR', (_: { type: Entity; operation: Operation }) => {
      const { start_date, end_date } = useDateRangeStore.getState();
      if (start_date || end_date) return;
      queryClient.invalidateQueries({ queryKey: statisticsKeys.all });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [jwt]);
}
