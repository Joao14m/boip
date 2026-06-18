import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/auth/signup.styles';
import { FieldError } from '@/components/FieldError';

const REGIONS = [
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'MG', name: 'Minas Gerais' },
];

const isValidCpf = (doc: string): boolean => {
  if (!/^\d{11}$/.test(doc)) return false;
  if (/^(\d)\1{10}$/.test(doc)) return false;
  const d = doc.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += d[i] * (10 - i);
  let r = sum % 11;
  if ((r < 2 ? 0 : 11 - r) !== d[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += d[i] * (11 - i);
  r = sum % 11;
  return (r < 2 ? 0 : 11 - r) === d[10];
};

const isValidCnpj = (doc: string): boolean => {
  if (!/^\d{14}$/.test(doc)) return false;
  if (/^(\d)\1{13}$/.test(doc)) return false;
  const d = doc.split('').map(Number);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += d[i] * w1[i];
  let r = sum % 11;
  if ((r < 2 ? 0 : 11 - r) !== d[12]) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += d[i] * w2[i];
  r = sum % 11;
  return (r < 2 ? 0 : 11 - r) === d[13];
};

export default function SignupScreen() {
  const [firstName, setFirstName]                   = useState('');
  const [lastName, setLastName]                     = useState('');
  const [email, setEmail]                           = useState('');
  const [password, setPassword]                     = useState('');
  const [confirmPassword, setConfirmPassword]       = useState('');
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone]                           = useState('');
  const [personDoc, setPersonDoc]                   = useState('');
  const [docType, setDocType]                       = useState<'CPF' | 'CNPJ'>('CPF');
  const [hasCar, setHasCar]                         = useState(false);
  const [carNumber, setCarNumber]                   = useState('');
  const [selectedUf, setSelectedUf]                 = useState('');
  const [regionOpen, setRegionOpen]                 = useState(false);
  const [loading, setLoading]                       = useState(false);

  const lastNameRef        = useRef<TextInput>(null);
  const emailRef           = useRef<TextInput>(null);
  const passwordRef        = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const phoneRef           = useRef<TextInput>(null);
  const personDocRef       = useRef<TextInput>(null);

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const handleSelectRegion = (uf: string) => {
    setSelectedUf(uf);
    setRegionOpen(false);
    clearError('selectedUf');
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = 'Nome é obrigatório.';
    if (!lastName.trim())  e.lastName  = 'Sobrenome é obrigatório.';

    if (!email.trim())           e.email = 'E-mail é obrigatório.';
    else if (!email.includes('@')) e.email = 'E-mail inválido.';

    if (!password)                e.password = 'Senha é obrigatória.';
    else if (password.length < 6) e.password = 'Senha deve ter pelo menos 6 caracteres.';

    if (!confirmPassword)               e.confirmPassword = 'Confirme a senha.';
    else if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem.';

    if (!phone.trim()) e.phone = 'Telefone é obrigatório.';

    if (!personDoc.trim()) {
      e.personDoc = `${docType} é obrigatório.`;
    } else {
      const digits = personDoc.replace(/\D/g, '');
      if (docType === 'CPF' && digits.length !== 11)        e.personDoc = 'CPF deve ter 11 dígitos.';
      else if (docType === 'CNPJ' && digits.length !== 14)  e.personDoc = 'CNPJ deve ter 14 dígitos.';
      else if (docType === 'CPF' && !isValidCpf(digits))    e.personDoc = 'CPF inválido.';
      else if (docType === 'CNPJ' && !isValidCnpj(digits))  e.personDoc = 'CNPJ inválido.';
    }

    if (hasCar && !carNumber.trim()) e.carNumber = 'Placa é obrigatória quando possui veículo.';

    if (!selectedUf) e.selectedUf = 'Selecione uma região.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    setFormError('');
    if (!validate()) return;

    try {
      setLoading(true);
      const locations = await api.get<Array<{ id: string; uf: string }>>('/api/locations');
      const match = locations.find(l => l.uf === selectedUf);
      if (!match) {
        setFormError('Região indisponível. Tente outra.');
        setLoading(false);
        return;
      }
      // Cria a conta Firebase e dispara o e-mail de verificação. Se o e-mail já existe
      // (cadastro anterior não concluído), reentra com a senha informada.
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await sendEmailVerification(cred.user);
      } catch (err: any) {
        if (err?.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
          if (!cred.user.emailVerified) await sendEmailVerification(cred.user);
        } else {
          throw err;
        }
      }

      // O onboard é adiado até o e-mail ser verificado — o backend rejeita
      // email_not_verified. Levamos os dados do formulário para a tela de verificação.
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        personDoc: personDoc.replace(/\D/g, ''),
        docType,
        hasCar,
        carNumber: hasCar ? carNumber.trim() : null,
        locationId: match.id,
      };

      router.replace({
        pathname: '/auth/verify-email',
        params: { email: email.trim(), payload: JSON.stringify(payload) },
      });
    } catch (e: any) {
      const code = e?.code ?? '';
      const msg =
        code === 'auth/invalid-credential'
          ? 'E-mail já cadastrado com outra senha.'
          : code === 'auth/weak-password'
          ? 'A senha é muito fraca.'
          : e.message ?? 'Não foi possível criar a conta. Tente novamente.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedRegion = REGIONS.find(r => r.uf === selectedUf);

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

      {/* Glow: gradiente do canto inferior esquerdo */}
      <LinearGradient
        colors={['transparent', 'rgba(82, 183, 136, 0.10)', 'rgba(82, 183, 136, 0.25)']}
        start={{ x: 0.6, y: 0.4 }}
        end={{ x: 0, y: 1 }}
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
        <Pressable onPress={Keyboard.dismiss}>
          <View style={styles.card}>
          {/* ── Logo ── */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Ionicons name="storefront" size={22} color="#fff" />
            </View>
            <Text style={styles.logoText}>Ageris</Text>
          </View>

          <Text style={styles.welcome}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

          {formError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          ) : null}

          {/* Nome + Sobrenome */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="João"
                  placeholderTextColor={"#AAAAAA"}
                  value={firstName}
                  onChangeText={v => { setFirstName(v); clearError('firstName'); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  submitBehavior="submit"
                />
              </View>
              <FieldError message={errors.firstName} />
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Sobrenome</Text>
              <View style={styles.inputRow}>
                <TextInput
                  ref={lastNameRef}
                  style={styles.input}
                  placeholder="Silva"
                  placeholderTextColor={"#AAAAAA"}
                  value={lastName}
                  onChangeText={v => { setLastName(v); clearError('lastName'); }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  submitBehavior="submit"
                />
              </View>
              <FieldError message={errors.lastName} />
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={"#AAAAAA"}
                value={email}
                onChangeText={v => { setEmail(v); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
              />
            </View>
            <FieldError message={errors.email} />
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={"#AAAAAA"}
                value={password}
                onChangeText={v => { setPassword(v); clearError('password'); }}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                submitBehavior="submit"
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={12}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={"#AAAAAA"} />
              </Pressable>
            </View>
            <FieldError message={errors.password} />
          </View>

          {/* Confirmar Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={"#AAAAAA"}
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); clearError('confirmPassword'); }}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                submitBehavior="submit"
              />
              <Pressable onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn} hitSlop={12}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={"#AAAAAA"} />
              </Pressable>
            </View>
            <FieldError message={errors.confirmPassword} />
          </View>

          {/* Telefone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="(99) 99999-9999"
                placeholderTextColor={"#AAAAAA"}
                value={phone}
                onChangeText={v => { setPhone(v); clearError('phone'); }}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => personDocRef.current?.focus()}
                submitBehavior="submit"
              />
            </View>
            <FieldError message={errors.phone} />
          </View>

          {/* Tipo de documento */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo de documento</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, docType === 'CPF' ? styles.toggleBtnActive : null]}
                onPress={() => { setDocType('CPF'); clearError('personDoc'); }}
              >
                <Text style={[styles.toggleText, docType === 'CPF' ? styles.toggleTextActive : null]}>CPF</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, docType === 'CNPJ' ? styles.toggleBtnActive : null]}
                onPress={() => { setDocType('CNPJ'); clearError('personDoc'); }}
              >
                <Text style={[styles.toggleText, docType === 'CNPJ' ? styles.toggleTextActive : null]}>CNPJ</Text>
              </Pressable>
            </View>
          </View>

          {/* Número do documento */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{docType === 'CPF' ? 'CPF' : 'CNPJ'} (somente números)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
              <TextInput
                ref={personDocRef}
                style={styles.input}
                placeholder={docType === 'CPF' ? '00000000000' : '00000000000000'}
                placeholderTextColor={"#AAAAAA"}
                value={personDoc}
                onChangeText={v => { setPersonDoc(v); clearError('personDoc'); }}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
            <FieldError message={errors.personDoc} />
          </View>

          {/* Possui veículo */}
          <View style={[styles.fieldGroup, styles.switchRow]}>
            <View>
              <Text style={styles.label}>Possui veículo?</Text>
              <Text style={styles.switchHint}>Necessário para transporte de gado</Text>
            </View>
            <Switch
              value={hasCar}
              onValueChange={v => { setHasCar(v); if (!v) clearError('carNumber'); }}
              trackColor={{ false: AgreGreen.inputBorder, true: AgreGreen.brand }}
              thumbColor={hasCar ? AgreGreen.button : '#f4f3f4'}
            />
          </View>

          {/* Placa do veículo */}
          {hasCar && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Placa do veículo</Text>
              <View style={styles.inputRow}>
                <Ionicons name="car-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ABC-1234"
                  placeholderTextColor={"#AAAAAA"}
                  value={carNumber}
                  onChangeText={v => { setCarNumber(v); clearError('carNumber'); }}
                  autoCapitalize="characters"
                />
              </View>
              <FieldError message={errors.carNumber} />
            </View>
          )}

          {/* ── Região ── */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Região</Text>
            <Pressable
              style={[styles.inputRow, errors.selectedUf ? { borderColor: '#E53E3E' } : null]}
              onPress={() => setRegionOpen(v => !v)}
            >
              <Ionicons name="location-outline" size={20} color={"#AAAAAA"} style={styles.inputIcon} />
              <Text style={[styles.input, !selectedRegion && { color: "#AAAAAA" }]}>
                {selectedRegion ? `${selectedRegion.name} - ${selectedRegion.uf}` : 'Selecione uma região'}
              </Text>
              <Ionicons
                name={regionOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={"#AAAAAA"}
              />
            </Pressable>

            {regionOpen && (
              <View style={styles.locationDropdown}>
                {REGIONS.map(region => (
                  <Pressable
                    key={region.uf}
                    style={[
                      styles.locationOption,
                      selectedUf === region.uf && styles.locationOptionActive,
                    ]}
                    onPress={() => handleSelectRegion(region.uf)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color={selectedUf === region.uf ? AgreGreen.button : AgreGreen.muted}
                    />
                    <Text
                      style={[
                        styles.locationOptionText,
                        selectedUf === region.uf && styles.locationOptionTextActive,
                      ]}
                    >
                      {region.name} - {region.uf}
                    </Text>
                    {selectedUf === region.uf && (
                      <Ionicons name="checkmark" size={16} color={AgreGreen.button} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
            <FieldError message={errors.selectedUf} />
          </View>

          {/* Criar Conta */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Criando conta...' : 'Criar Conta'}</Text>
          </Pressable>

          {/* Link login */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Já tem uma conta? </Text>
            <Pressable onPress={() => router.replace('/auth/login')}>
              <Text style={styles.bottomLink}>Entrar</Text>
            </Pressable>
          </View>
          </View>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
