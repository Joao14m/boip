import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AgreGreen } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { uploadImage } from '@/lib/upload';

const BREEDS = ['Nelore', 'Angus', 'Brahman', 'Hereford', 'Senepol', 'Gir', 'Guzerá', 'Tabapuã'];
const PURPOSES = [
  { label: 'Corte', value: 'BEEF' },
  { label: 'Leite', value: 'DAIRY' },
  { label: 'Reprodução', value: 'BREEDING' },
];
const SEXES = [
  { label: 'Macho', value: 'M' },
  { label: 'Fêmea', value: 'F' },
  { label: 'Misto', value: 'MIXED' },
];

export default function CreateListingScreen() {
  const { userId } = useAuth();
  const [userLocationId, setUserLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    api.get<any>(`/api/users/${userId}`)
      .then((data) => setUserLocationId(data.locationId))
      .catch(console.error);
  }, [userId]);

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

  // Images (up to 3)
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limite', 'Máximo de 3 imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const buildAndSubmit = async (publish: boolean) => {
    if (!lotCode || !headCount || !priceAmount) {
      Alert.alert('Erro', 'Preencha código do lote, quantidade e preço.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma foto.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create lot
      const lot = await api.post<any>('/api/lots', {
        ownerUserId: userId,
        lotCode,
        headCount: Number(headCount),
        locationId: userLocationId,
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

      // 3. Upload images to Firebase Storage
      const media = [];
      for (let i = 0; i < images.length; i++) {
        const path = `listings/${userId}/${lot.id}/${i}.jpg`;
        const url = await uploadImage(images[i], path);
        media.push({ mediaSlot: i, mediaType: 'IMAGE', mediaKey: url, contentType: 'image/jpeg' });
      }

      // 4. Create listing
      const listing = await api.post<any>('/api/listings', {
        lotId: lot.id,
        sellerUserId: userId,
        priceType,
        priceAmount: Number(priceAmount),
        currency: 'BRL',
        media,
      });

      // 5. Activate if publishing
      if (publish) {
        await api.patch(`/api/listings/${listing.id}/status`, { status: 'ACTIVE' });
      }

      router.back();
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
                <Pressable key={s.value} style={chipStyle(sex === s.value)} onPress={() => setSex(sex === s.value ? '' : s.value)}>
                  <Text style={chipText(sex === s.value)}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={labelStyle}>Finalidade</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PURPOSES.map(p => (
                <Pressable key={p.value} style={chipStyle(purpose === p.value)} onPress={() => setPurpose(purpose === p.value ? '' : p.value)}>
                  <Text style={chipText(purpose === p.value)}>{p.label}</Text>
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

          {/* ── Fotos ── */}
          <Text style={{ fontSize: 18, fontWeight: '700', color: AgreGreen.dark, marginTop: 8, marginBottom: 16 }}>
            Fotos
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {images.map((uri, i) => (
              <View key={i} style={{ position: 'relative' }}>
                <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 10 }} />
                <Pressable
                  onPress={() => removeImage(i)}
                  style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#E53E3E', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            {images.length < 3 && (
              <Pressable
                onPress={pickImage}
                style={{ width: 100, height: 100, borderRadius: 10, borderWidth: 2, borderColor: AgreGreen.inputBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: AgreGreen.inputBg }}
              >
                <Ionicons name="camera-outline" size={28} color={AgreGreen.muted} />
                <Text style={{ color: AgreGreen.muted, fontSize: 11, marginTop: 4 }}>{images.length}/3</Text>
              </Pressable>
            )}
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
          <View style={{ gap: 10 }}>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: pressed ? AgreGreen.dark : AgreGreen.button,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center' as const,
                opacity: loading ? 0.6 : 1,
              })}
              onPress={() => buildAndSubmit(true)}
              disabled={loading}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                {loading ? 'Criando...' : 'Publicar Anuncio'}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#e8e8e8' : AgreGreen.inputBg,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center' as const,
                borderWidth: 1,
                borderColor: AgreGreen.inputBorder,
                opacity: loading ? 0.6 : 1,
              })}
              onPress={() => buildAndSubmit(false)}
              disabled={loading}
            >
              <Text style={{ color: AgreGreen.dark, fontSize: 16, fontWeight: '600' }}>
                Salvar Rascunho
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
