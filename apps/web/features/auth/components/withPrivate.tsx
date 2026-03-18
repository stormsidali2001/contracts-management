'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';

function WithPrivate({ children }: any) {
  const { isAuthenticated, jwt, refresh } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  const exceptionPaths = ['/signin', '/forgot-password', '/reset-password'];

  useEffect(() => {
    if (jwt || isAuthenticated) {
      setInitialized(true);
      return;
    }
    refresh()
      .catch(() => {})
      .finally(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated && !exceptionPaths.includes(pathname)) {
      router.replace('/signin');
    }
  }, [isAuthenticated, initialized, pathname]);

  if (!initialized && !exceptionPaths.includes(pathname)) return null;
  return isAuthenticated || exceptionPaths.includes(pathname) ? children : null;
}

export default WithPrivate;
