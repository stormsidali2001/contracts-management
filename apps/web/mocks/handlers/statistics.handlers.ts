import { http, HttpResponse } from 'msw';
import { API_BASE } from '../config';
import { mockStatistics } from '../fixtures/statistics';

export const statisticsHandlers = [
  http.get(`${API_BASE}/statistics`, () => HttpResponse.json(mockStatistics)),
];
