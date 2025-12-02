import LoginForm from './LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Đang tải form đăng nhập...</div>}>
      <LoginForm />
    </Suspense>
  );
}

