import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { AgreGreen } from '@/constants/theme';
import { api } from '@/lib/api';

export default function PaymentScreen() {
  const { chargeId, listingId } = useLocalSearchParams<{
    chargeId: string;
    listingId: string;
  }>();

  const [pixKey, setPixKey] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── fetch PIX payload from billing info ── */
  useEffect(() => {
    if (!chargeId) return;
    api.get<any>(`/api/payments/${chargeId}`)
      .then((billing) => {
        const payload = billing?.pix?.payload ?? '';
        setPixKey(payload);
      })
      .catch(() => {});
  }, [chargeId]);

  /* ── poll listing status every 4s ── */
  useEffect(() => {
    if (!listingId || confirmed) return;

    intervalRef.current = setInterval(async () => {
      try {
        const listing = await api.get<any>(`/api/listings/${listingId}`);
        if (listing?.status === 'SOLD') {
          setConfirmed(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (_) {}
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [listingId, confirmed]);

  const handleCopy = () => {
    Clipboard.setString(pixKey ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (confirmed) {
    return (
      <SafeAreaView style={container}>
        <View style={successBox}>
          <Ionicons name="checkmark-circle" size={72} color={AgreGreen.brand} />
          <Text style={successTitle}>Pagamento confirmado!</Text>
          <Text style={successSub}>
            Sua compra foi realizada com sucesso. O vendedor será notificado.
          </Text>
          <Pressable style={doneBtn} onPress={() => router.replace('/(tabs)/feed')}>
            <Text style={doneBtnText}>Voltar ao feed</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={container}>
      {/* header */}
      <View style={header}>
        <Pressable onPress={() => router.back()} style={backBtn}>
          <Ionicons name="arrow-back" size={22} color={AgreGreen.dark} />
        </Pressable>
        <Text style={headerTitle}>Pagamento via PIX</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={scrollContent} showsVerticalScrollIndicator={false}>
        {/* instruction */}
        <View style={infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={AgreGreen.brand} />
          <Text style={infoText}>
            Copie a chave PIX abaixo e pague pelo app do seu banco. O pagamento é confirmado automaticamente.
          </Text>
        </View>

        {/* pix key box */}
        <View style={pixBox}>
          <Text style={pixLabel}>Chave PIX (copia e cola)</Text>
          <Text style={pixValue} selectable numberOfLines={3}>
            {pixKey || '—'}
          </Text>
          <Pressable style={[copyBtn, copied && copyBtnDone]} onPress={handleCopy}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#fff" />
            <Text style={copyBtnText}>{copied ? 'Copiado!' : 'Copiar chave'}</Text>
          </Pressable>
        </View>

        {/* waiting indicator */}
        <View style={waitingBox}>
          <ActivityIndicator size="small" color={AgreGreen.brand} />
          <Text style={waitingText}>Aguardando confirmação do pagamento...</Text>
        </View>

        <Text style={hint}>
          Não feche esta tela. Assim que o pagamento for confirmado, você será avisado automaticamente.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── inline styles ── */
import { StyleSheet } from 'react-native';

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F5F5' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#ECECEC' },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: AgreGreen.dark },
  scrollContent:{ padding: 20, gap: 16 },
  infoCard:     { flexDirection: 'row', gap: 10, backgroundColor: AgreGreen.pale, borderRadius: 10, padding: 14, alignItems: 'flex-start' },
  infoText:     { flex: 1, fontSize: 13, color: AgreGreen.muted, lineHeight: 19 },
  pixBox:       { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#ECECEC' },
  pixLabel:     { fontSize: 12, fontWeight: '600', color: AgreGreen.muted, marginBottom: 8 },
  pixValue:     { fontSize: 13, color: '#1B2D24', lineHeight: 20, marginBottom: 14 },
  copyBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: AgreGreen.button, borderRadius: 8, paddingVertical: 10 },
  copyBtnDone:  { backgroundColor: AgreGreen.brand },
  copyBtnText:  { color: '#fff', fontSize: 14, fontWeight: '600' },
  waitingBox:   { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: 8 },
  waitingText:  { fontSize: 13, color: AgreGreen.muted },
  hint:         { fontSize: 12, color: '#AAA', textAlign: 'center', lineHeight: 18 },
  successBox:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', color: AgreGreen.dark, textAlign: 'center' },
  successSub:   { fontSize: 14, color: AgreGreen.muted, textAlign: 'center', lineHeight: 21 },
  doneBtn:      { marginTop: 8, backgroundColor: AgreGreen.button, borderRadius: 10, paddingHorizontal: 32, paddingVertical: 14 },
  doneBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700' },
});

const { container, header, backBtn, headerTitle, scrollContent, infoCard, infoText,
  pixBox, pixLabel, pixValue, copyBtn, copyBtnDone, copyBtnText,
  waitingBox, waitingText, hint, successBox, successTitle, successSub, doneBtn, doneBtnText } = s;
