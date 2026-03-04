import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/profile/profile.styles';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

// TODO: replace with real authenticated user ID
const MOCK_USER_ID = '';

type Tab = 'anuncios' | 'conta';

/* ── helper: format price ── */
function formatPrice(amount: number, currency: string) {
  if (currency === 'BRL') return `R$ ${amount.toLocaleString('pt-BR')}`;
  return `${currency} ${amount}`;
}

/* ═══════════════════════════════════════════ */
export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('anuncios');
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  /* ── fetch user ── */
  useEffect(() => {
    if (!MOCK_USER_ID) {
      setLoadingUser(false);
      setUser({
        firstName: 'Joao',
        lastName: 'Silva',
        email: 'seu@email.com',
        phone: '(34) 99999-9999',
        personDoc: '12345678900',
        docType: 'CPF',
        locationId: null,
      });
      setLocation({ municipality: 'Uberlandia', uf: 'MG' });
      return;
    }
    fetch(`${API_BASE}/api/users/${MOCK_USER_ID}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        if (data.locationId) {
          fetch(`${API_BASE}/api/locations/${data.locationId}`)
            .then((r) => r.json())
            .then(setLocation)
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, []);

  /* ── fetch listings ── */
  useEffect(() => {
    if (!MOCK_USER_ID) {
      setLoadingListings(false);
      setListings([]);
      return;
    }
    fetch(`${API_BASE}/api/listings?sellerUserId=${MOCK_USER_ID}&status=ACTIVE&size=50`)
      .then((r) => r.json())
      .then((data) => setListings(data.content ?? []))
      .catch(console.error)
      .finally(() => setLoadingListings(false));
  }, []);

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

  /* ── listing card (active only, no status badge) ── */
  const renderListingCard = ({ item }: { item: any }) => {
    const lot = item.lotSummary;
    return (
      <View style={styles.card}>
        <View style={styles.cardImagePlaceholder}>
          <Ionicons name="image-outline" size={40} color="#BBB" />
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
                {listings.length} de {listings.length} anuncios criados
              </Text>
            </View>
            <Pressable style={styles.createBtn}>
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
        <ScrollView
          style={styles.contaContainer}
          contentContainerStyle={styles.contaScroll}
          showsVerticalScrollIndicator={false}
        >
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
                  <Pressable style={styles.editBtn}>
                    <Ionicons name="create-outline" size={14} color="#fff" />
                    <Text style={styles.editBtnText}>Editar</Text>
                  </Pressable>
                </View>

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

              {/* Actions */}
              <View style={styles.sectionCard}>
                <Pressable style={styles.dangerBtn}>
                  <Ionicons name="log-out-outline" size={18} color="#E53E3E" />
                  <Text style={styles.dangerBtnText}>Sair da Conta</Text>
                </Pressable>
              </View>

              <View style={styles.sectionCard}>
                <Pressable style={styles.deletBtn}>
                  <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                  <Text style={styles.dangerBtnText}>Deletar Conta</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
