import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { db } from '../db';

export const notificationsHandlers = [
  http.patch(`${API_BASE}/notifications/:id/read`, ({ params }) => {
    const notification = db.notifications.find((n) => n.id === params.id);
    if (notification) notification.isRead = true;
    return new HttpResponse(null, { status: 200 });
  }),

  http.patch(`${API_BASE}/notifications/read-all`, () => {
    db.notifications.forEach((n) => { n.isRead = true; });
    return new HttpResponse(null, { status: 200 });
  }),
];
