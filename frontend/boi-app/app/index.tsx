import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { SplashLoading } from '@/components/SplashLoading';

export default function Index() {
  const { user, loading, onboarded } = useAuth();

  if (loading) return <SplashLoading />;

  if (!user) return <Redirect href="/auth/login" />;
  if (!onboarded) return <Redirect href="/auth/signup" />;
  return <Redirect href="/(tabs)/feed" />;
}
