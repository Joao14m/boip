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
  Alert,
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

type Location = {
  id: string;
  uf: string;
  municipality: string;
};

export default function SignupScreen() {
  const { refreshMe } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [personDoc, setPersonDoc] = useState('');
  const [docType, setDocType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [hasCar, setHasCar] = useState(false);
  const [carNumber, setCarNumber] = useState('');
  const [locationId, setLocationId] = useState('');

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !phone || !personDoc || !locationId) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      await api.post('/auth/onboard', {
        firstName,
        lastName,
        phone,
        personDoc,
        docType,
        hasCar,
        carNumber: hasCar ? carNumber : null,
        locationId,
      });
      await refreshMe();
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      Alert.alert('Erro ao criar conta', e.message);
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
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Sobrenome</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Silva"
                  placeholderTextColor={AgreGreen.placeholder}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
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
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
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
                onChangeText={setPassword}
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
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={AgreGreen.muted}
                />
              </Pressable>
            </View>
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
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Tipo de documento CPF / CNPJ */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo de documento</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleBtn, docType === 'CPF' ? styles.toggleBtnActive : null]}
                onPress={() => setDocType('CPF')}
              >
                <Text style={[styles.toggleText, docType === 'CPF' ? styles.toggleTextActive : null]}>CPF</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, docType === 'CNPJ' ? styles.toggleBtnActive : null]}
                onPress={() => setDocType('CNPJ')}
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
                onChangeText={setPersonDoc}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Possui veículo */}
          <View style={[styles.fieldGroup, styles.switchRow]}>
            <View>
              <Text style={styles.label}>Possui veículo?</Text>
              <Text style={styles.switchHint}>Necessário para transporte de gado</Text>
            </View>
            <Switch
              value={hasCar}
              onValueChange={setHasCar}
              trackColor={{ false: AgreGreen.inputBorder, true: AgreGreen.brand }}
              thumbColor={hasCar ? AgreGreen.button : '#f4f3f4'}
            />
          </View>

          {/* Placa do veículo (condicional) */}
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
                  onChangeText={setCarNumber}
                  autoCapitalize="characters"
                />
              </View>
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
                onChangeText={(text) => { setLocationQuery(text); setLocationId(''); }}
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
                    onPress={() => { setLocationId(loc.id); setLocationQuery(''); }}
                  >
                    <Text style={{ color: AgreGreen.dark, fontSize: 14 }}>{loc.municipality} - {loc.uf}</Text>
                  </Pressable>
                ))}
              </View>
            )}
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

