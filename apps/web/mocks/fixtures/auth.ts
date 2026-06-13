function toBase64Url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function makeMockJwt(user: object): string {
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = toBase64Url({ user, iat: 1000000000, exp: 9999999999 });
  return `${header}.${payload}.mock`;
}

export const MOCK_ADMIN_USER = {
  sub: 'mock-admin-id',
  username: 'admin.admin',
  email: 'admin@contractflow.dz',
  firstName: 'Admin',
  lastName: 'System',
  role: 'ADMIN',
  imageUrl: 'default-admin.png',
  recieve_notifications: false,
};
