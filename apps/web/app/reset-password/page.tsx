'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ResetPassword from '@/features/forgot-password/components/RestPassword/ResetPassword';
import WithSnackbar from '@/global/withSnackbar';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!token || !userId) {
      router.push('/signin');
    }
  }, [token, userId, router]);

  if (!token || !userId) {
    return null;
  }

  return (
    <WithSnackbar>
      <ResetPassword />
    </WithSnackbar>
  );
}
