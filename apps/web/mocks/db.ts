import { mockUsers } from './fixtures/users';
import { mockVendors } from './fixtures/vendors';
import { mockDirections } from './fixtures/directions';
import { mockAgreements } from './fixtures/agreements';
import { DirectionView } from '@contracts/types';

export interface MockNotification {
  id: string;
  message: string;
  isRead: boolean;
}

export const db = {
  users: mockUsers.map((u) => ({ ...u })),
  vendors: mockVendors.map((v) => ({ ...v })),
  directions: mockDirections.map((d) => ({ ...d, departements: d.departements?.map((dep) => ({ ...dep })) ?? [] })) as DirectionView[],
  agreements: mockAgreements.map((a) => ({ ...a })),
  notifications: [] as MockNotification[],
};
