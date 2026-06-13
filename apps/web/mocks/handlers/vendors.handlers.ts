import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { db } from '../db';
import { VendorView } from '@contracts/types';

let nextVendorNum = 16;

export const vendorsHandlers = [
  http.get(`${API_BASE}/vendors`, ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const search = url.searchParams.get('searchQuery')?.toLowerCase();

    let filtered = db.vendors;
    if (search) {
      filtered = filtered.filter((v) =>
        v.company_name.toLowerCase().includes(search) ||
        v.nif.includes(search) ||
        v.nrc.toLowerCase().includes(search),
      );
    }
    return HttpResponse.json({ data: filtered.slice(offset, offset + limit), total: filtered.length });
  }),

  http.get(`${API_BASE}/vendors/:id`, ({ params }) => {
    const vendor = db.vendors.find((v) => v.id === params.id);
    if (!vendor) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(vendor);
  }),

  http.post(`${API_BASE}/vendors`, async ({ request }) => {
    const body = await request.json() as Partial<VendorView>;
    const newVendor: VendorView = {
      id: `ven-${Date.now()}`,
      num: `F-0${String(nextVendorNum++).padStart(2, '0')}`,
      createdAt: new Date(),
      contractCount: 0,
      convensionCount: 0,
      company_name: body.company_name ?? '',
      nif: body.nif ?? '',
      nrc: body.nrc ?? '',
      address: body.address ?? '',
      mobile_phone_number: body.mobile_phone_number ?? '',
      home_phone_number: body.home_phone_number ?? '',
    };
    db.vendors.unshift(newVendor);
    return HttpResponse.json(newVendor, { status: 201 });
  }),

  http.patch(`${API_BASE}/vendors/:id`, async ({ params, request }) => {
    const idx = db.vendors.findIndex((v) => v.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const body = await request.json() as Partial<VendorView>;
    db.vendors[idx] = { ...db.vendors[idx], ...body };
    return HttpResponse.json(db.vendors[idx]);
  }),

  http.delete(`${API_BASE}/vendors/:id`, ({ params }) => {
    const idx = db.vendors.findIndex((v) => v.id === params.id);
    if (idx !== -1) db.vendors.splice(idx, 1);
    return new HttpResponse(null, { status: 200 });
  }),
];
