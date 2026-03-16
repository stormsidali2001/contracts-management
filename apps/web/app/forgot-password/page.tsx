'use client';

import ForgotPassword from '@/features/forgot-password/components/ForgotPassword/ForgotPassword';
import WithSnackbar from '@/global/withSnackbar';

export default function ForgotPasswordPage() {
  return (
    <WithSnackbar>
      <ForgotPassword />
    </WithSnackbar>
  );
}
