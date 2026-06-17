import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { db } from '../db';

export const usersHandlers = [
  http.get(`${API_BASE}/users`, ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const search = url.searchParams.get('searchQuery')?.toLowerCase();

    let filtered = db.users;
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search),
      );
    }
    return HttpResponse.json({
      data: filtered.slice(offset, offset + limit),
      total: filtered.length,
    });
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const user = db.users.find((u) => u.id === params.id);
    if (!user) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const idx = db.users.findIndex((u) => u.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    db.users[idx] = { ...db.users[idx], ...body } as (typeof db.users)[0];
    return HttpResponse.json(db.users[idx]);
  }),

  http.delete(`${API_BASE}/users/:id`, ({ params }) => {
    const idx = db.users.findIndex((u) => u.id === params.id);
    if (idx !== -1) db.users.splice(idx, 1);
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(`${API_BASE}/users/image/upload`, () =>
    HttpResponse.json({ filename: 'default-admin.png' }),
  ),

  http.patch(`${API_BASE}/users/recieve-notifications`, () =>
    HttpResponse.json({ recieve_notifications: true }),
  ),
];
