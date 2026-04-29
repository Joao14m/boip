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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/auth/signup.styles';
import { FieldError } from '@/components/FieldError';

const REGIONS = [
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'MG', name: 'Minas Gerais' },
];

export default function SignupScreen() {
  const { refreshMe } = useAuth();

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

    if (!personDoc.trim())
      e.personDoc = `${docType} é obrigatório.`;
    else if (docType === 'CPF' && personDoc.replace(/\D/g, '').length !== 11)
      e.personDoc = 'CPF deve ter 11 dígitos.';
    else if (docType === 'CNPJ' && personDoc.replace(/\D/g, '').length !== 14)
      e.personDoc = 'CNPJ deve ter 14 dígitos.';

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
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await api.post('/auth/onboard', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        personDoc: personDoc.replace(/\D/g, ''),
        docType,
        hasCar,
        carNumber: hasCar ? carNumber.trim() : null,
        uf: selectedUf,
      });
      await refreshMe();
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      setFormError(e.message ?? 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRegion = REGIONS.find(r => r.uf === selectedUf);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          {/* ── Logo ── */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Ionicons name="storefront" size={22} color="#fff" />
            </View>
            <Text style={styles.logoText}>BoiMarket</Text>
          </View>

          <Text style={styles.welcome}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

          {formError ? (
            <View style={{ backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Text style={{ color: '#C53030', fontSize: 13 }}>{formError}</Text>
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
                  placeholderTextColor={AgreGreen.placeholder}
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
                  placeholderTextColor={AgreGreen.placeholder}
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
              <Ionicons name="mail-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={AgreGreen.placeholder}
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
              <Ionicons name="lock-closed-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={AgreGreen.placeholder}
                value={password}
                onChangeText={v => { setPassword(v); clearError('password'); }}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                submitBehavior="submit"
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={12}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={AgreGreen.placeholder} />
              </Pressable>
            </View>
            <FieldError message={errors.password} />
          </View>

          {/* Confirmar Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={AgreGreen.placeholder}
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); clearError('confirmPassword'); }}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                submitBehavior="submit"
              />
              <Pressable onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn} hitSlop={12}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={AgreGreen.placeholder} />
              </Pressable>
            </View>
            <FieldError message={errors.confirmPassword} />
          </View>

          {/* Telefone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="(99) 99999-9999"
                placeholderTextColor={AgreGreen.placeholder}
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
              <Ionicons name="card-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
              <TextInput
                ref={personDocRef}
                style={styles.input}
                placeholder={docType === 'CPF' ? '00000000000' : '00000000000000'}
                placeholderTextColor={AgreGreen.placeholder}
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
                <Ionicons name="car-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ABC-1234"
                  placeholderTextColor={AgreGreen.placeholder}
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
              <Ionicons name="location-outline" size={20} color={AgreGreen.placeholder} style={styles.inputIcon} />
              <Text style={[styles.input, !selectedRegion && { color: AgreGreen.placeholder }]}>
                {selectedRegion ? `${selectedRegion.name} - ${selectedRegion.uf}` : 'Selecione uma região'}
              </Text>
              <Ionicons
                name={regionOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={AgreGreen.placeholder}
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
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
