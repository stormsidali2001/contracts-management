import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth.handlers';
import { usersHandlers } from './handlers/users.handlers';
import { vendorsHandlers } from './handlers/vendors.handlers';
import { directionsHandlers } from './handlers/directions.handlers';
import { agreementsHandlers } from './handlers/agreements.handlers';
import { notificationsHandlers } from './handlers/notifications.handlers';
import { statisticsHandlers } from './handlers/statistics.handlers';

export const worker = setupWorker(
  ...authHandlers,
  ...usersHandlers,
  ...vendorsHandlers,
  ...directionsHandlers,
  ...agreementsHandlers,
  ...notificationsHandlers,
  ...statisticsHandlers,
);
