import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
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

type Location = { id: string; uf: string; municipality: string };

export default function SignupScreen() {
  const { refreshMe } = useAuth();

  const [firstName, setFirstName]               = useState('');
  const [lastName, setLastName]                 = useState('');
  const [email, setEmail]                       = useState('');
  const [password, setPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone]                       = useState('');
  const [personDoc, setPersonDoc]               = useState('');
  const [docType, setDocType]                   = useState<'CPF' | 'CNPJ'>('CPF');
  const [hasCar, setHasCar]                     = useState(false);
  const [carNumber, setCarNumber]               = useState('');
  const [locationId, setLocationId]             = useState('');
  const [locations, setLocations]               = useState<Location[]>([]);
  const [locationQuery, setLocationQuery]       = useState('');
  const [loading, setLoading]                   = useState(false);

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get<Location[]>('/api/locations').then(setLocations).catch(() => {});
  }, []);

  const filteredLocations = useMemo(() => {
    if (!locationQuery.trim()) return [];
    const q = locationQuery.toLowerCase();
    return locations
      .filter(l => l.municipality.toLowerCase().includes(q) || l.uf.toLowerCase().includes(q))
      .sort((a, b) => a.municipality.localeCompare(b.municipality))
      .slice(0, 5);
  }, [locations, locationQuery]);

  const selectedLocation = locations.find(l => l.id === locationId);

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = 'Nome é obrigatório.';
    if (!lastName.trim())  e.lastName  = 'Sobrenome é obrigatório.';

    if (!email.trim())          e.email = 'E-mail é obrigatório.';
    else if (!email.includes('@')) e.email = 'E-mail inválido.';

    if (!password)               e.password = 'Senha é obrigatória.';
    else if (password.length < 6) e.password = 'Senha deve ter pelo menos 6 caracteres.';

    if (!confirmPassword)              e.confirmPassword = 'Confirme a senha.';
    else if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem.';

    if (!phone.trim()) e.phone = 'Telefone é obrigatório.';

    if (!personDoc.trim())
      e.personDoc = `${docType} é obrigatório.`;
    else if (docType === 'CPF' && personDoc.replace(/\D/g, '').length !== 11)
      e.personDoc = 'CPF deve ter 11 dígitos.';
    else if (docType === 'CNPJ' && personDoc.replace(/\D/g, '').length !== 14)
      e.personDoc = 'CNPJ deve ter 14 dígitos.';

    if (hasCar && !carNumber.trim()) e.carNumber = 'Placa é obrigatória quando possui veículo.';

    if (!locationId) e.locationId = 'Selecione uma localização.';

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
        locationId,
      });
      await refreshMe();
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      setFormError(e.message ?? 'Não foi possível criar a conta. Tente novamente.');
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
          <Text style={styles.welcome}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>

          {/* Banner de erro do servidor */}
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
                />
              </View>
              <FieldError message={errors.firstName} />
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Sobrenome</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Silva"
                  placeholderTextColor={AgreGreen.placeholder}
                  value={lastName}
                  onChangeText={v => { setLastName(v); clearError('lastName'); }}
                  autoCapitalize="words"
                />
              </View>
              <FieldError message={errors.lastName} />
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={AgreGreen.placeholder}
                value={email}
                onChangeText={v => { setEmail(v); clearError('email'); }}
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
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={AgreGreen.placeholder}
                value={password}
                onChangeText={v => { setPassword(v); clearError('password'); }}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={AgreGreen.muted} />
              </Pressable>
            </View>
            <FieldError message={errors.password} />
          </View>

          {/* Confirmar Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={AgreGreen.placeholder}
                value={confirmPassword}
                onChangeText={v => { setConfirmPassword(v); clearError('confirmPassword'); }}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={AgreGreen.muted} />
              </Pressable>
            </View>
            <FieldError message={errors.confirmPassword} />
          </View>

          {/* Telefone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Telefone</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="(99) 99999-9999"
                placeholderTextColor={AgreGreen.placeholder}
                value={phone}
                onChangeText={v => { setPhone(v); clearError('phone'); }}
                keyboardType="phone-pad"
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
              <Ionicons name="card-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={docType === 'CPF' ? '00000000000' : '00000000000000'}
                placeholderTextColor={AgreGreen.placeholder}
                value={personDoc}
                onChangeText={v => { setPersonDoc(v); clearError('personDoc'); }}
                keyboardType="numeric"
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
                <Ionicons name="car-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
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

          {/* Localização */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Localização</Text>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite município ou UF"
                placeholderTextColor={AgreGreen.placeholder}
                value={selectedLocation ? `${selectedLocation.municipality} - ${selectedLocation.uf}` : locationQuery}
                onChangeText={v => { setLocationQuery(v); setLocationId(''); clearError('locationId'); }}
                onFocus={() => { if (selectedLocation) { setLocationQuery(''); setLocationId(''); } }}
                autoCapitalize="words"
              />
            </View>
            {filteredLocations.length > 0 && !locationId && (
              <View style={{ marginTop: 4, gap: 2 }}>
                {filteredLocations.map(loc => (
                  <Pressable
                    key={loc.id}
                    style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: AgreGreen.inputBg, borderRadius: 8 }}
                    onPress={() => { setLocationId(loc.id); setLocationQuery(''); clearError('locationId'); }}
                  >
                    <Text style={{ color: AgreGreen.dark, fontSize: 14 }}>{loc.municipality} - {loc.uf}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <FieldError message={errors.locationId} />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
