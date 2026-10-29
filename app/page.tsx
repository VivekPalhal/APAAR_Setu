'use client';
import { useApp } from '@/lib/context';
import Shell from '@/components/Shell';
import AICTEHome from '@/components/pages/AICTEHome';
import InstitutionHome from '@/components/pages/InstitutionHome';
import StudentRecord from '@/components/pages/StudentRecord';

export default function HomePage() {
  const { role } = useApp();

  if (role === 'institution' || role === 'operator') {
    return <Shell><InstitutionHome /></Shell>;
  }
  if (role === 'student') {
    return <Shell><StudentRecord /></Shell>;
  }
  if (role === 'verifier') {
    // Redirect verifiers to the demo verify page
    if (typeof window !== 'undefined') window.location.href = '/verify/demo-verified';
    return null;
  }
  return <Shell><AICTEHome /></Shell>;
}
