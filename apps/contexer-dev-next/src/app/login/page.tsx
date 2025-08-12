"use client"

import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';

export default function Login() {
  const router = useRouter();

  return (
    <LoginPage 
      onBack={() => router.push('/')} 
      onSignup={() => router.push('/signup')}
    />
  );
}
