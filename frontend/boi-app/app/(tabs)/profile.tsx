import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/profile/profile.styles';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { auth } from '@/lib/firebase';

type Tab = 'anuncios' | 'conta';

/* ── helper: format price ── */
function formatPrice(amount: number, currency: string) {
  if (currency === 'BRL') return `R$ ${amount.toLocaleString('pt-BR')}`;
  return `${currency} ${amount}`;
}

/* ═══════════════════════════════════════════ */
export default function ProfileScreen() {
  const { userId, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('anuncios');
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', personDoc: '', docType: '' });

  /* ── fetch user ── */
  useEffect(() => {
    if (!userId) {
      setLoadingUser(false);
      return;
    }
    api.get<any>(`/api/users/${userId}`)
      .then((data) => {
        setUser(data);
        if (data.locationId) {
          api.get<any>(`/api/locations/${data.locationId}`)
            .then(setLocation)
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, [userId]);

  /* ── fetch listings (re-runs on screen focus to pick up new drafts/active) ── */
  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoadingListings(false);
        setListings([]);
        return;
      }
      setLoadingListings(true);
      api.get<{ content: any[] }>(`/api/listings?sellerUserId=${userId}&size=50`)
        .then((data) => setListings(data.content ?? []))
        .catch(console.error)
        .finally(() => setLoadingListings(false));
    }, [userId])
  );

  /* ── format document ── */
  const formatDoc = useCallback((doc: string, type: string) => {
    if (type === 'CPF' && doc.length === 11) {
      return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`;
    }
    if (type === 'CNPJ' && doc.length === 14) {
      return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`;
    }
    return doc;
  }, []);

  /* ── listing card ── */
  const renderListingCard = ({ item }: { item: any }) => {
    const lot = item.lotSummary;
    const firstImage = item.media?.find((m: any) => m.mediaSlot === 0)?.mediaKey ?? null;
    const statusLabel: Record<string, string> = { ACTIVE: 'Ativo', DRAFT: 'Rascunho', PAUSED: 'Pausado', SOLD: 'Vendido', CANCELLED: 'Cancelado' };
    const statusColors: Record<string, { bg: string; text: string }> = {
      ACTIVE:    { bg: '#E8F5E9', text: '#2E7D32' },
      DRAFT:     { bg: '#FFF8E1', text: '#B8860B' },
      PAUSED:    { bg: '#FFF3E0', text: '#E65100' },
      SOLD:      { bg: '#E3F2FD', text: '#1565C0' },
      CANCELLED: { bg: '#FFEBEE', text: '#C62828' },
    };
    const sc = statusColors[item.status] ?? { bg: '#F5F5F5', text: '#555' };
    return (
      <View style={styles.card}>
        <View style={styles.cardImagePlaceholder}>
          {firstImage ? (
            <Image source={{ uri: firstImage }} style={{ width: '100%', height: '100%', borderTopLeftRadius: 14, borderTopRightRadius: 14 }} resizeMode="cover" />
          ) : (
            <Ionicons name="image-outline" size={40} color="#BBB" />
          )}
          {lot?.purpose && (
            <View style={styles.purposeBadge}>
              <Text style={styles.purposeBadgeText}>{lot.purpose}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {lot?.lotCode ?? `Anuncio #${item.id?.slice(0, 6)}`}
            </Text>
            <Text style={styles.cardPrice}>
              {formatPrice(item.priceAmount, item.currency)}
            </Text>
          </View>

          {lot && (
            <View style={styles.tagsRow}>
              {lot.breed && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{lot.breed}</Text>
                </View>
              )}
              {lot.sex && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{lot.sex}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.detailsRow}>
            {lot?.avgWeightKg != null && (
              <View style={styles.detailItem}>
                <Ionicons name="barbell-outline" size={14} color={AgreGreen.muted} />
                <Text style={styles.detailText}>{lot.avgWeightKg}kg</Text>
              </View>
            )}
            {lot?.avgAgeMonths != null && (
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={AgreGreen.muted} />
                <Text style={styles.detailText}>{lot.avgAgeMonths} meses</Text>
              </View>
            )}
            {lot?.headCount != null && (
              <View style={styles.detailItem}>
                <Ionicons name="apps-outline" size={14} color={AgreGreen.muted} />
                <Text style={styles.detailText}>{lot.headCount} cab.</Text>
              </View>
            )}
          </View>
          <View style={{ alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: sc.bg }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: sc.text }}>{statusLabel[item.status] ?? item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  /* ═══════════════════════════════════════════ */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={32} color="#fff" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {user ? `${user.firstName} ${user.lastName}` : '...'}
          </Text>
          <Text style={styles.headerEmail}>{user?.email ?? ''}</Text>
        </View>
      </View>

      {/* ── Tab Switcher ── */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'anuncios' && styles.tabActive]}
          onPress={() => setActiveTab('anuncios')}
        >
          <Ionicons
            name="pricetags-outline"
            size={16}
            color={activeTab === 'anuncios' ? AgreGreen.dark : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'anuncios' && styles.tabTextActive]}>
            Meus Anuncios
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'conta' && styles.tabActive]}
          onPress={() => setActiveTab('conta')}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={activeTab === 'conta' ? AgreGreen.dark : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'conta' && styles.tabTextActive]}>
            Conta
          </Text>
        </Pressable>
      </View>

      {/* ── Content ── */}
      {activeTab === 'anuncios' ? (
        <View style={styles.listingsContainer}>
          <View style={styles.listingsHeader}>
            <View>
              <Text style={styles.listingsTitle}>Meus Anuncios</Text>
              <Text style={styles.listingsCount}>
                {listings.length} anuncio{listings.length !== 1 ? 's' : ''} criado{listings.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable style={styles.createBtn} onPress={() => router.push('/listing/create')}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.createBtnText}>Criar Anuncio</Text>
            </Pressable>
          </View>

          {loadingListings ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AgreGreen.brand} />
            </View>
          ) : listings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                Voce ainda nao tem anuncios.{'\n'}Crie seu primeiro anuncio!
              </Text>
            </View>
          ) : (
            <FlatList
              data={listings}
              keyExtractor={(item) => item.id}
              renderItem={renderListingCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        /* ── Conta Tab ── */
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.contaContainer}
          contentContainerStyle={styles.contaScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          {loadingUser ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AgreGreen.brand} />
            </View>
          ) : user ? (
            <>
              {/* Informacoes da Conta */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Informacoes da Conta</Text>
                    <Text style={styles.sectionSubtitle}>
                      Gerencie suas informacoes pessoais
                    </Text>
                  </View>
                  {!editing ? (
                    <Pressable style={styles.editBtn} onPress={() => {
                      setEditForm({
                        firstName: user.firstName ?? '',
                        lastName: user.lastName ?? '',
                        phone: user.phone ?? '',
                        personDoc: user.personDoc ?? '',
                        docType: user.docType ?? 'CPF',
                      });
                      setEditing(true);
                    }}>
                      <Ionicons name="create-outline" size={14} color="#fff" />
                      <Text style={styles.editBtnText}>Editar</Text>
                    </Pressable>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable style={[styles.editBtn, { backgroundColor: '#ccc' }]} onPress={() => setEditing(false)}>
                        <Text style={styles.editBtnText}>Cancelar</Text>
                      </Pressable>
                      <Pressable style={styles.editBtn} onPress={async () => {
                        try {
                          const updated = await api.patch<any>(`/api/users/${userId}`, editForm);
                          setUser(updated);
                          setEditing(false);
                        } catch (e: any) {
                          Alert.alert('Erro', e.message);
                        }
                      }}>
                        <Text style={styles.editBtnText}>Salvar</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                {editing ? (
                  <>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>Nome</Text>
                        <TextInput
                          style={[styles.infoValue, { borderBottomWidth: 1, borderColor: AgreGreen.inputBorder, paddingVertical: 4 }]}
                          value={editForm.firstName}
                          onChangeText={(v) => setEditForm(f => ({ ...f, firstName: v }))}
                        />
                      </View>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>Sobrenome</Text>
                        <TextInput
                          style={[styles.infoValue, { borderBottomWidth: 1, borderColor: AgreGreen.inputBorder, paddingVertical: 4 }]}
                          value={editForm.lastName}
                          onChangeText={(v) => setEditForm(f => ({ ...f, lastName: v }))}
                        />
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>Telefone</Text>
                        <TextInput
                          style={[styles.infoValue, { borderBottomWidth: 1, borderColor: AgreGreen.inputBorder, paddingVertical: 4 }]}
                          value={editForm.phone}
                          onChangeText={(v) => setEditForm(f => ({ ...f, phone: v }))}
                          keyboardType="phone-pad"
                        />
                      </View>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>{editForm.docType}</Text>
                        <TextInput
                          style={[styles.infoValue, { borderBottomWidth: 1, borderColor: AgreGreen.inputBorder, paddingVertical: 4 }]}
                          value={editForm.personDoc}
                          onChangeText={(v) => setEditForm(f => ({ ...f, personDoc: v }))}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>Nome Completo</Text>
                        <Text style={styles.infoValue}>
                          {user.firstName} {user.lastName}
                        </Text>
                      </View>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>Telefone</Text>
                        <Text style={styles.infoValue}>{user.phone}</Text>
                      </View>
                      <View style={[styles.infoField, styles.infoHalf]}>
                        <Text style={styles.infoLabel}>{user.docType}</Text>
                        <Text style={styles.infoValue}>
                          {formatDoc(user.personDoc, user.docType)}
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Localizacao */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Localizacao</Text>
                    <Text style={styles.sectionSubtitle}>
                      Sua localizacao cadastrada
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={[styles.infoField, styles.infoHalf]}>
                    <Text style={styles.infoLabel}>Cidade</Text>
                    <Text style={styles.infoValue}>
                      {location?.municipality ?? '—'}
                    </Text>
                  </View>
                  <View style={[styles.infoField, styles.infoHalf]}>
                    <Text style={styles.infoLabel}>Estado</Text>
                    <Text style={styles.infoValue}>
                      {location?.uf ?? '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Dados Bancarios */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Dados para Recebimento</Text>
                    <Text style={styles.sectionSubtitle}>PIX ou TED para receber pagamentos</Text>
                  </View>
                </View>
                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}
                  onPress={() => router.push('/payout-info')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="card-outline" size={18} color={AgreGreen.brand} />
                    <Text style={{ fontSize: 14, color: '#1B2D24' }}>Gerenciar dados bancários</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CCC" />
                </Pressable>
              </View>

              {/* Actions */}
              <View style={styles.sectionCard}>
                <Pressable style={styles.dangerBtn} onPress={() => {
                  Alert.alert('Sair', 'Deseja realmente sair?', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sair', style: 'destructive', onPress: async () => {
                      await signOut();
                      router.replace('/auth/login');
                    }},
                  ]);
                }}>
                  <Ionicons name="log-out-outline" size={18} color="#E53E3E" />
                  <Text style={styles.dangerBtnText}>Sair da Conta</Text>
                </Pressable>
              </View>

              <View style={styles.sectionCard}>
                <Pressable style={styles.deletBtn} onPress={() => {
                  Alert.alert(
                    'Deletar Conta',
                    'Essa ação é irreversível. Deseja realmente deletar sua conta?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Deletar', style: 'destructive', onPress: async () => {
                        try {
                          await api.delete(`/api/users/${userId}`);
                          if (auth.currentUser) await auth.currentUser.delete();
                          await signOut();
                          router.replace('/auth/login');
                        } catch (e: any) {
                          Alert.alert('Erro', e.message);
                        }
                      }},
                    ],
                  );
                }}>
                  <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                  <Text style={styles.dangerBtnText}>Deletar Conta</Text>
                </Pressable>
              </View>
            </>
          ) : null}
          </Pressable>
        </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
