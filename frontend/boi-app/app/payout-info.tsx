import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AgreGreen } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FieldError } from '@/components/FieldError';

const PIX_KEY_TYPES = ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP'];
const ACCOUNT_TYPES = ['CONTA_CORRENTE', 'CONTA_POUPANCA'];

export default function PayoutInfoScreen() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [transferType, setTransferType] = useState<'PIX' | 'TED'>('PIX');

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearError = (field: string) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (transferType === 'PIX') {
      if (!pixKey.trim()) e.pixKey = 'Chave PIX é obrigatória.';
    } else {
      if (!bankCode.trim())    e.bankCode    = 'Código do banco é obrigatório.';
      if (!agency.trim())      e.agency      = 'Agência é obrigatória.';
      if (!account.trim())     e.account     = 'Conta é obrigatória.';
      if (!accountDigit.trim()) e.accountDigit = 'Dígito é obrigatório.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* PIX fields */
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('EVP');

  /* TED fields */
  const [bankCode, setBankCode] = useState('');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [accountDigit, setAccountDigit] = useState('');
  const [bankAccountType, setBankAccountType] = useState('CONTA_CORRENTE');
  const [ispb, setIspb] = useState('');

  /* ── load existing ── */
  useEffect(() => {
    if (!userId) return;
    api.get<any>(`/api/users/${userId}/payout-info`)
      .then((data) => {
        setTransferType(data.transferType ?? 'PIX');
        setPixKey(data.pixKey ?? '');
        setPixKeyType(data.pixKeyType ?? 'EVP');
        setBankCode(data.bankCode ?? '');
        setAgency(data.agency ?? '');
        setAccount(data.account ?? '');
        setAccountDigit(data.accountDigit ?? '');
        setBankAccountType(data.bankAccountType ?? 'CONTA_CORRENTE');
        setIspb(data.ispb ?? '');
      })
      .catch(() => {}) // 404 = not set yet, that's fine
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setFormError('');
    setSuccessMsg('');
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/api/users/${userId}/payout-info`, {
        transferType,
        pixKey: transferType === 'PIX' ? pixKey : null,
        pixKeyType: transferType === 'PIX' ? pixKeyType : null,
        bankCode: transferType === 'TED' ? bankCode : null,
        agency: transferType === 'TED' ? agency : null,
        account: transferType === 'TED' ? account : null,
        accountDigit: transferType === 'TED' ? accountDigit : null,
        bankAccountType: transferType === 'TED' ? bankAccountType : null,
        ispb: transferType === 'TED' ? ispb || null : null,
      });
      setSuccessMsg('Dados bancários atualizados com sucesso.');
      setTimeout(() => router.back(), 1200);
    } catch (e: any) {
      setFormError(e.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <ActivityIndicator size="large" color={AgreGreen.brand} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      {/* header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={AgreGreen.dark} />
        </Pressable>
        <Text style={s.headerTitle}>Dados para Recebimento</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {formError ? (
          <View style={{ backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FED7D7', borderRadius: 8, padding: 12 }}>
            <Text style={{ color: '#C53030', fontSize: 13 }}>{formError}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={{ backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: '#9AE6B4', borderRadius: 8, padding: 12 }}>
            <Text style={{ color: '#276749', fontSize: 13 }}>{successMsg}</Text>
          </View>
        ) : null}

        {/* type toggle */}
        <View style={s.toggleRow}>
          <Pressable
            style={[s.toggleBtn, transferType === 'PIX' && s.toggleBtnActive]}
            onPress={() => setTransferType('PIX')}
          >
            <Text style={[s.toggleText, transferType === 'PIX' && s.toggleTextActive]}>PIX</Text>
          </Pressable>
          <Pressable
            style={[s.toggleBtn, transferType === 'TED' && s.toggleBtnActive]}
            onPress={() => setTransferType('TED')}
          >
            <Text style={[s.toggleText, transferType === 'TED' && s.toggleTextActive]}>TED</Text>
          </Pressable>
        </View>

        {transferType === 'PIX' ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Chave PIX</Text>

            <Text style={s.label}>Tipo da chave</Text>
            <View style={s.chipRow}>
              {PIX_KEY_TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[s.chip, pixKeyType === t && s.chipActive]}
                  onPress={() => setPixKeyType(t)}
                >
                  <Text style={[s.chipText, pixKeyType === t && s.chipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.label}>Chave</Text>
            <TextInput
              style={s.input}
              value={pixKey}
              onChangeText={v => { setPixKey(v); clearError('pixKey'); }}
              placeholder="Ex: email@exemplo.com"
              placeholderTextColor={AgreGreen.placeholder}
              autoCapitalize="none"
            />
            <FieldError message={errors.pixKey} />
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.cardTitle}>Dados Bancários (TED)</Text>

            <Text style={s.label}>Código do banco</Text>
            <TextInput style={s.input} value={bankCode} onChangeText={v => { setBankCode(v); clearError('bankCode'); }} placeholder="Ex: 237" placeholderTextColor={AgreGreen.placeholder} keyboardType="numeric" />
            <FieldError message={errors.bankCode} />

            <Text style={s.label}>Agência (sem dígito)</Text>
            <TextInput style={s.input} value={agency} onChangeText={v => { setAgency(v); clearError('agency'); }} placeholder="Ex: 1263" placeholderTextColor={AgreGreen.placeholder} keyboardType="numeric" />
            <FieldError message={errors.agency} />

            <View style={s.row}>
              <View style={s.flex}>
                <Text style={s.label}>Conta (sem dígito)</Text>
                <TextInput style={s.input} value={account} onChangeText={v => { setAccount(v); clearError('account'); }} placeholder="Ex: 9999991" placeholderTextColor={AgreGreen.placeholder} keyboardType="numeric" />
                <FieldError message={errors.account} />
              </View>
              <View style={s.digitField}>
                <Text style={s.label}>Dígito</Text>
                <TextInput style={s.input} value={accountDigit} onChangeText={v => { setAccountDigit(v); clearError('accountDigit'); }} placeholder="1" placeholderTextColor={AgreGreen.placeholder} keyboardType="numeric" maxLength={2} />
                <FieldError message={errors.accountDigit} />
              </View>
            </View>

            <Text style={s.label}>Tipo de conta</Text>
            <View style={s.chipRow}>
              {ACCOUNT_TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[s.chip, bankAccountType === t && s.chipActive]}
                  onPress={() => setBankAccountType(t)}
                >
                  <Text style={[s.chipText, bankAccountType === t && s.chipTextActive]}>
                    {t === 'CONTA_CORRENTE' ? 'Corrente' : 'Poupança'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.label}>ISPB (opcional)</Text>
            <TextInput style={s.input} value={ispb} onChangeText={setIspb} placeholder="Ex: 60746948" placeholderTextColor={AgreGreen.placeholder} keyboardType="numeric" />
          </View>
        )}

        <Pressable style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.saveBtnText}>Salvar</Text>
          }
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

import { StyleSheet } from 'react-native';

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ECECEC' },
  backBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontSize: 16, fontWeight: '700', color: AgreGreen.dark },
  scroll:          { padding: 20, gap: 16 },
  toggleRow:       { flexDirection: 'row', backgroundColor: '#E8E8E8', borderRadius: 10, padding: 4, gap: 4 },
  toggleBtn:       { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:      { fontSize: 14, fontWeight: '600', color: '#999' },
  toggleTextActive:{ color: AgreGreen.dark },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#ECECEC', gap: 4 },
  cardTitle:       { fontSize: 15, fontWeight: '700', color: AgreGreen.dark, marginBottom: 8 },
  label:           { fontSize: 12, fontWeight: '600', color: AgreGreen.muted, marginTop: 8, marginBottom: 4 },
  input:           { backgroundColor: AgreGreen.inputBg, borderWidth: 1, borderColor: AgreGreen.inputBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1B2D24' },
  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip:            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F5F5F5' },
  chipActive:      { borderColor: AgreGreen.brand, backgroundColor: AgreGreen.pale },
  chipText:        { fontSize: 12, color: '#555' },
  chipTextActive:  { color: AgreGreen.dark, fontWeight: '700' },
  row:             { flexDirection: 'row', gap: 10 },
  flex:            { flex: 1 },
  digitField:      { width: 80 },
  saveBtn:         { backgroundColor: AgreGreen.button, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
});
