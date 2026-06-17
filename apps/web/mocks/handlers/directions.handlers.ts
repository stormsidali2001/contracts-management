import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { db } from '../db';
import { DirectionView, DepartementView } from '@contracts/types';

export const directionsHandlers = [
  http.get(`${API_BASE}/directions`, () => HttpResponse.json(db.directions)),

  http.post(`${API_BASE}/directions`, async ({ request }) => {
    const body = (await request.json()) as Partial<DirectionView>;
    const newDirection: DirectionView = {
      id: `dir-${Date.now()}`,
      title: body.title ?? '',
      abriviation: body.abriviation ?? '',
      departements: [],
    };
    db.directions.push(newDirection);
    return HttpResponse.json(newDirection, { status: 201 });
  }),

  http.delete(`${API_BASE}/directions/:id`, ({ params }) => {
    const idx = db.directions.findIndex((d) => d.id === params.id);
    if (idx !== -1) db.directions.splice(idx, 1);
    return new HttpResponse(null, { status: 200 });
  }),

  http.post(`${API_BASE}/departements`, async ({ request }) => {
    const body = (await request.json()) as {
      directionId: string;
      title: string;
      abriviation: string;
    };
    const direction = db.directions.find((d) => d.id === body.directionId);
    if (!direction) return new HttpResponse(null, { status: 404 });

    const newDep: DepartementView = {
      id: `dep-${Date.now()}`,
      title: body.title ?? '',
      abriviation: body.abriviation ?? '',
    };
    direction.departements = direction.departements ?? [];
    direction.departements.push(newDep);
    return HttpResponse.json(newDep, { status: 201 });
  }),

  http.delete(`${API_BASE}/departements/:id`, ({ params }) => {
    for (const direction of db.directions) {
      const idx =
        direction.departements?.findIndex((dep) => dep.id === params.id) ?? -1;
      if (idx !== -1) {
        direction.departements!.splice(idx, 1);
        break;
      }
    }
    return new HttpResponse(null, { status: 200 });
  }),
];
