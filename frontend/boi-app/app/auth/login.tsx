import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/auth/login.styles';
import { FieldError } from '@/components/FieldError';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-email':        'E-mail inválido.',
  'auth/user-not-found':       'Nenhuma conta encontrada com este e-mail.',
  'auth/wrong-password':       'Senha incorreta.',
  'auth/invalid-credential':   'E-mail ou senha incorretos.',
  'auth/too-many-requests':    'Muitas tentativas. Tente novamente mais tarde.',
};

export default function LoginScreen() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim())    e.email    = 'E-mail é obrigatório.';
    else if (!email.includes('@')) e.email = 'E-mail inválido.';
    if (!password)        e.password = 'Senha é obrigatória.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    setFormError('');
    if (!validate()) return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      const code = e?.code ?? '';
      setFormError(FIREBASE_ERRORS[code] ?? 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          <Text style={styles.headerBrand}>Agregis</Text>
          <Text style={styles.cattleEmoji}>🐄</Text>
        </View>

        {/* ── Card ── */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcome}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>

          {/* Banner de erro do servidor */}
          {formError ? (
            <View style={{ backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Text style={{ color: '#C53030', fontSize: 13 }}>{formError}</Text>
            </View>
          ) : null}

          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={[styles.inputRow, errors.email ? { borderColor: '#E53E3E', borderWidth: 1, borderRadius: 10 } : null]}>
              <Ionicons name="mail-outline" size={20} color={errors.email ? '#E53E3E' : AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={AgreGreen.placeholder}
                value={email}
                onChangeText={v => { setEmail(v); clearError('email'); setFormError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <FieldError message={errors.email} />
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={[styles.inputRow, errors.password ? { borderColor: '#E53E3E', borderWidth: 1, borderRadius: 10 } : null]}>
              <Ionicons name="lock-closed-outline" size={20} color={errors.password ? '#E53E3E' : AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Sua senha"
                placeholderTextColor={AgreGreen.placeholder}
                value={password}
                onChangeText={v => { setPassword(v); clearError('password'); setFormError(''); }}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={AgreGreen.muted}
                />
              </Pressable>
            </View>
            <FieldError message={errors.password} />
          </View>

          {/* Lembrar-me + Esqueceu a senha */}
          <View style={styles.rowBetween}>
            <Pressable style={styles.checkRow} onPress={() => setRememberMe(v => !v)}>
              <View style={[styles.checkbox, rememberMe ? styles.checkboxOn : null]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.checkLabel}>Lembrar-me</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </Pressable>
          </View>

          {/* Entrar */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>

          {/* Link cadastro */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Não tem uma conta? </Text>
            <Pressable onPress={() => router.replace('/auth/signup')}>
              <Text style={styles.bottomLink}>Criar Conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
