import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: check auth state — if logged in, redirect to /(tabs)/feed instead
  return <Redirect href="/auth/login" />;
}
