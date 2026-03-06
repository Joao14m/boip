import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgreGreen } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const BREEDS = ['Nelore', 'Angus', 'Brahman', 'Hereford', 'Senepol', 'Gir', 'Guzerá', 'Tabapuã'];
const PURPOSES = ['Corte', 'Leite', 'Reprodução'];
const SEXES = ['Macho', 'Fêmea', 'Misto'];

export default function CreateListingScreen() {
  const { userId } = useAuth();

  // Lot fields
  const [lotCode, setLotCode] = useState('');
  const [headCount, setHeadCount] = useState('');

  // Profile fields
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('');
  const [purpose, setPurpose] = useState('');
  const [avgWeightKg, setAvgWeightKg] = useState('');
  const [avgAgeMonths, setAvgAgeMonths] = useState('');
  const [description, setDescription] = useState('');

  // Listing fields
  const [priceType, setPriceType] = useState<'PER_HEAD' | 'TOTAL'>('TOTAL');
  const [priceAmount, setPriceAmount] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!lotCode || !headCount || !priceAmount) {
      Alert.alert('Erro', 'Preencha código do lote, quantidade e preço.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create lot
      const lot = await api.post<any>('/api/lots', {
        ownerUserId: userId,
        lotCode,
        headCount: Number(headCount),
        locationId: null,
      });

      // 2. Create lot profile
      await api.post(`/api/lots/${lot.id}/profile`, {
        breed: breed || null,
        sex: sex || null,
        purpose: purpose || null,
        avgWeightKg: avgWeightKg ? Number(avgWeightKg) : null,
        avgAgeMonths: avgAgeMonths ? Number(avgAgeMonths) : null,
        description: description || null,
      });

      // 3. Create listing (with placeholder media)
      const listing = await api.post<any>('/api/listings', {
        lotId: lot.id,
        sellerUserId: userId,
        priceType,
        priceAmount: Number(priceAmount),
        currency: 'BRL',
        media: [
          { mediaSlot: 0, mediaType: 'IMAGE', mediaKey: 'placeholder.jpg', contentType: 'image/jpeg' },
        ],
      });

      // 4. Activate listing
      await api.patch(`/api/listings/${listing.id}/status`, { status: 'ACTIVE' });

      Alert.alert('Sucesso', 'Anuncio criado!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro ao criar anuncio', e.message);
    } finally {
      setLoading(false);
    }
  };

  const chipStyle = (selected: boolean) => ({
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: selected ? AgreGreen.button : AgreGreen.inputBg,
    borderWidth: 1,
    borderColor: selected ? AgreGreen.button : AgreGreen.inputBorder,
  });

  const chipText = (selected: boolean) => ({
    color: selected ? '#fff' : AgreGreen.muted,
    fontSize: 13,
  });

  const inputStyle = {
    backgroundColor: AgreGreen.inputBg,
    borderWidth: 1,
    borderColor: AgreGreen.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: AgreGreen.dark,
  };

  const labelStyle = {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AgreGreen.dark,
    marginBottom: 6,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Lote ── */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: AgreGreen.dark, marginBottom: 16 }}>
            Dados do Lote
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Código do Lote</Text>
            <TextInput style={inputStyle} placeholder="Ex: LOTE-001" placeholderTextColor={AgreGreen.placeholder} value={lotCode} onChangeText={setLotCode} />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Quantidade (cabeças)</Text>
            <TextInput style={inputStyle} placeholder="Ex: 50" placeholderTextColor={AgreGreen.placeholder} value={headCount} onChangeText={setHeadCount} keyboardType="numeric" />
          </View>

          {/* ── Perfil ── */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: AgreGreen.dark, marginTop: 8, marginBottom: 16 }}>
            Perfil do Lote
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Raça</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {BREEDS.map(b => (
                  <Pressable key={b} style={chipStyle(breed === b)} onPress={() => setBreed(breed === b ? '' : b)}>
                    <Text style={chipText(breed === b)}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Sexo</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SEXES.map(s => (
                <Pressable key={s} style={chipStyle(sex === s)} onPress={() => setSex(sex === s ? '' : s)}>
                  <Text style={chipText(sex === s)}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Finalidade</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PURPOSES.map(p => (
                <Pressable key={p} style={chipStyle(purpose === p)} onPress={() => setPurpose(purpose === p ? '' : p)}>
                  <Text style={chipText(purpose === p)}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Peso médio (kg)</Text>
              <TextInput style={inputStyle} placeholder="Ex: 450" placeholderTextColor={AgreGreen.placeholder} value={avgWeightKg} onChangeText={setAvgWeightKg} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Idade média (meses)</Text>
              <TextInput style={inputStyle} placeholder="Ex: 24" placeholderTextColor={AgreGreen.placeholder} value={avgAgeMonths} onChangeText={setAvgAgeMonths} keyboardType="numeric" />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Descrição</Text>
            <TextInput
              style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Detalhes adicionais sobre o lote..."
              placeholderTextColor={AgreGreen.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* ── Preço ── */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: AgreGreen.dark, marginTop: 8, marginBottom: 16 }}>
            Preço
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Tipo de preço</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable style={chipStyle(priceType === 'TOTAL')} onPress={() => setPriceType('TOTAL')}>
                <Text style={chipText(priceType === 'TOTAL')}>Total</Text>
              </Pressable>
              <Pressable style={chipStyle(priceType === 'PER_HEAD')} onPress={() => setPriceType('PER_HEAD')}>
                <Text style={chipText(priceType === 'PER_HEAD')}>Por cabeça</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={labelStyle}>Valor (R$)</Text>
            <TextInput style={inputStyle} placeholder="Ex: 150000" placeholderTextColor={AgreGreen.placeholder} value={priceAmount} onChangeText={setPriceAmount} keyboardType="numeric" />
          </View>

          {/* ── Submit ── */}
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? AgreGreen.dark : AgreGreen.button,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center' as const,
              opacity: loading ? 0.6 : 1,
            })}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
              {loading ? 'Criando...' : 'Criar Anuncio'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
