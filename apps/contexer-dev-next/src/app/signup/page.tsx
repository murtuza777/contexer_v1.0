"use client"

import { useRouter } from 'next/navigation';
import SignupPage from '@/components/SignupPage';

export default function Signup() {
  const router = useRouter();

  return (
    <SignupPage 
      onBack={() => router.push('/')} 
      onLogin={() => router.push('/login')}
    />
  );
}
