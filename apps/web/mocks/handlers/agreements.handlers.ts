import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { db } from '../db';
import { AgreementView, AgreementStatus, AgreementType } from '@contracts/types';

export const agreementsHandlers = [
  http.get(`${API_BASE}/agreements`, ({ request }) => {
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const agreementType = url.searchParams.get('agreementType');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('searchQuery')?.toLowerCase();
    const directionId = url.searchParams.get('directionId');
    const vendorId = url.searchParams.get('vendorId');

    let filtered = db.agreements;

    if (agreementType === 'contract') {
      filtered = filtered.filter((a) => a.type === AgreementType.CONTRACT);
    } else if (agreementType === 'convension') {
      filtered = filtered.filter((a) => a.type === AgreementType.CONVENSION);
    }
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (directionId) {
      filtered = filtered.filter((a) => a.directionId === directionId);
    }
    if (vendorId) {
      filtered = filtered.filter((a) => a.vendor?.id === vendorId);
    }
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.object.toLowerCase().includes(search) ||
          a.number.toLowerCase().includes(search),
      );
    }

    return HttpResponse.json({ data: filtered.slice(offset, offset + limit), total: filtered.length });
  }),

  http.get(`${API_BASE}/Agreements/:id`, ({ params }) => {
    const agreement = db.agreements.find((a) => a.id === params.id);
    if (!agreement) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(agreement);
  }),

  http.post(`${API_BASE}/Agreements`, async ({ request }) => {
    const body = await request.json() as Partial<AgreementView> & { type: string };
    const agrType = body.type === 'contract' ? AgreementType.CONTRACT : AgreementType.CONVENSION;
    const existingOfType = db.agreements.filter((a) => a.type === agrType).length;
    const prefix = agrType === AgreementType.CONTRACT ? 'CTR' : 'CNV';
    const year = new Date().getFullYear();

    const newAgreement: AgreementView = {
      id: `agr-${Date.now()}`,
      number: `${prefix}-${year}-${String(existingOfType + 1).padStart(3, '0')}`,
      type: agrType,
      object: (body as any).object ?? '',
      amount: Number((body as any).amount ?? 0),
      signature_date: new Date((body as any).signature_date ?? Date.now()),
      expiration_date: new Date((body as any).expiration_date ?? Date.now()),
      execution_start_date: new Date((body as any).execution_start_date ?? Date.now()),
      execution_end_date: new Date((body as any).execution_end_date ?? Date.now()),
      createdAt: new Date(),
      status: AgreementStatus.NOT_EXECUTED,
      url: 'mock-doc.pdf',
      directionId: (body as any).directionId,
      departementId: (body as any).departementId,
      observation: (body as any).observation,
    };
    db.agreements.unshift(newAgreement);
    return HttpResponse.json(newAgreement, { status: 201 });
  }),

  http.patch(`${API_BASE}/Agreements/exec`, async ({ request }) => {
    const body = await request.json() as { id: string; status: AgreementStatus };
    const idx = db.agreements.findIndex((a) => a.id === body.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    db.agreements[idx] = { ...db.agreements[idx], status: body.status };
    return HttpResponse.json(db.agreements[idx]);
  }),

  http.post(`${API_BASE}/agreements/files/upload`, () =>
    HttpResponse.json({ filename: 'mock-document.pdf' }),
  ),
];
