import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/auth/login.styles';
import { FieldError } from '@/components/FieldError';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-email':       'E-mail inválido.',
  'auth/user-not-found':      'Nenhuma conta encontrada com este e-mail.',
  'auth/wrong-password':      'Senha incorreta.',
  'auth/invalid-credential':  'E-mail ou senha incorretos.',
  'auth/too-many-requests':   'Muitas tentativas. Tente novamente mais tarde.',
};

export default function LoginScreen() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim())             e.email    = 'E-mail é obrigatório.';
    else if (!email.includes('@')) e.email    = 'E-mail inválido.';
    if (!password)                 e.password = 'Senha é obrigatória.';
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

  const inputBorder = (field: string) => {
    if (errors[field])          return { borderColor: '#E53E3E', borderWidth: 1.5 };
    if (focusedField === field) return { borderColor: AgreGreen.brand, borderWidth: 2 };
    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Glow: gradiente linear diagonal do canto superior esquerdo */}
      <LinearGradient
        colors={['rgba(82, 183, 136, 0.30)', 'rgba(82, 183, 136, 0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 0.75 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1, justifyContent: 'center' }}>

            {/* ── Card ── */}
            <View style={styles.card}>

              {/* Logo */}
              <View style={styles.logoRow}>
                <View style={styles.logoBox}>
                  <Ionicons name="storefront" size={22} color="#fff" />
                </View>
                <Text style={styles.logoText}>BoiMarket</Text>
              </View>

              <Text style={styles.welcome}>Bem-vindo de volta</Text>
              <Text style={styles.subtitle}>Entre com suas credenciais para acessar sua conta</Text>

              {/* Banner de erro */}
              {formError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{formError}</Text>
                </View>
              ) : null}

              {/* E-mail */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputRow, inputBorder('email')]}>
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color={errors.email ? '#E53E3E' : focusedField === 'email' ? AgreGreen.brand : '#BBBBBB'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#AAAAAA"
                    value={email}
                    onChangeText={v => { setEmail(v); clearError('email'); setFormError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    submitBehavior="submit"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                <FieldError message={errors.email} />
              </View>

              {/* Senha */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={[styles.inputRow, inputBorder('password')]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={errors.password ? '#E53E3E' : focusedField === 'password' ? AgreGreen.brand : '#BBBBBB'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#AAAAAA"
                    value={password}
                    onChangeText={v => { setPassword(v); clearError('password'); setFormError(''); }}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={12}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={19}
                      color="#BBBBBB"
                    />
                  </Pressable>
                </View>
                <FieldError message={errors.password} />
              </View>

              {/* Lembrar-me + Esqueceu a senha */}
              <View style={styles.rowBetween}>
                <Pressable style={styles.checkRow} onPress={() => setRememberMe(v => !v)} hitSlop={8}>
                  <View style={[styles.checkbox, rememberMe ? styles.checkboxOn : null]}>
                    {rememberMe && <Ionicons name="checkmark" size={11} color="#fff" />}
                  </View>
                  <Text style={styles.checkLabel}>Lembrar-me</Text>
                </Pressable>
                <Pressable hitSlop={8}>
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </Pressable>
              </View>

              {/* Entrar */}
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
              </Pressable>

              {/* Link cadastro */}
              <View style={styles.bottomRow}>
                <Text style={styles.bottomText}>Não tem uma conta? </Text>
                <Pressable onPress={() => router.replace('/auth/signup')} hitSlop={8}>
                  <Text style={styles.bottomLink}>Criar conta</Text>
                </Pressable>
              </View>

            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
