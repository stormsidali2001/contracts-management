import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { makeMockJwt, MOCK_ADMIN_USER } from '../fixtures/auth';
import type { PermissionsView } from '@contracts/types';

const FULL_PERMISSIONS: PermissionsView = {
  agreements: { canCreate: true, canExecute: true },
  vendors: { canCreate: true, canEdit: true, canDelete: true },
  directions: { canCreate: true, canDelete: true, canManageDepartements: true },
  users: { canCreate: true, canDelete: true, canEditAny: true },
  filters: { canFilterByDirection: true },
};

export const authHandlers = [
  http.get(`${API_BASE}/auth/refresh_token`, () =>
    HttpResponse.json({ access_token: makeMockJwt(MOCK_ADMIN_USER) }),
  ),

  http.post(`${API_BASE}/auth/login`, () =>
    HttpResponse.json({ access_token: makeMockJwt(MOCK_ADMIN_USER) }),
  ),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const { db } = await import('../db');
    const { UserRole } = await import('@contracts/types');
    const role = (body.role as string) ?? UserRole.EMPLOYEE;
    const newUser = {
      id: `usr-${Date.now()}`,
      email: body.email as string ?? '',
      username: ((body.email as string ?? '').split('@')[0]),
      firstName: body.firstName as string ?? '',
      lastName: body.lastName as string ?? '',
      imageUrl: `default-${role.toLowerCase()}.png`,
      active: true,
      role: role as import('@contracts/types').UserRole,
      recieve_notifications: false,
      created_at: new Date(),
      departementId: body.departementId as string ?? null,
      directionId: body.directionId as string ?? null,
    };
    db.users.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.post(`${API_BASE}/auth/logout`, () => new HttpResponse(null, { status: 200 })),

  http.get(`${API_BASE}/auth/me/permissions`, () =>
    HttpResponse.json(FULL_PERMISSIONS),
  ),

  http.post(`${API_BASE}/auth/connected-user/reset-password`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.post(`${API_BASE}/auth/forgot-password`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.post(`${API_BASE}/auth/reset-password`, () =>
    new HttpResponse(null, { status: 200 }),
  ),
];
