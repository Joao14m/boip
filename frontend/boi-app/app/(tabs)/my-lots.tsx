import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/my-lots/my-lots.styles';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useFocusEffect } from 'expo-router';

type SubTab = 'favoritos' | 'meus';

const STATUS_FILTERS = ['Todos', 'ACTIVE', 'DRAFT', 'PAUSED', 'SOLD', 'CANCELLED'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/* ── helper: status badge color ── */
function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':    return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'DRAFT':     return { bg: '#FFF8E1', text: '#B8860B' };
    case 'PAUSED':    return { bg: '#FFF3E0', text: '#E65100' };
    case 'SOLD':      return { bg: '#E3F2FD', text: '#1565C0' };
    case 'CANCELLED': return { bg: '#FFEBEE', text: '#C62828' };
    default:          return { bg: '#F5F5F5', text: '#555' };
  }
}

/* ── helper: format price ── */
function formatPrice(amount: number, currency: string) {
  if (currency === 'BRL') return `R$ ${amount.toLocaleString('pt-BR')}`;
  return `${currency} ${amount}`;
}

/* ── helper: translate status ── */
function translateStatus(status: string) {
  switch (status) {
    case 'ACTIVE':    return 'Ativo';
    case 'DRAFT':     return 'Rascunho';
    case 'PAUSED':    return 'Pausado';
    case 'SOLD':      return 'Vendido';
    case 'CANCELLED': return 'Cancelado';
    default:          return status;
  }
}

/* ═══════════════════════════════════════════ */
export default function MyLotsScreen() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<SubTab>('favoritos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [myListings, setMyListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingFav, setLoadingFav] = useState(true);

  /* ── fetch user's listings (re-runs on screen focus) ── */
  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoadingMy(false);
        setMyListings([]);
        return;
      }
      setLoadingMy(true);
      api.get<{ content: any[] }>(`/api/listings?sellerUserId=${userId}&size=50`)
        .then((data) => setMyListings(data.content ?? []))
        .catch(console.error)
        .finally(() => setLoadingMy(false));
    }, [userId])
  );

  /* ── fetch favorites ── */
  useEffect(() => {
    // TODO: implement favorites endpoint — for now empty
    setLoadingFav(false);
    setFavorites([]);
  }, []);

  /* ── filtered listings by status ── */
  const filteredListings =
    statusFilter === 'Todos'
      ? myListings
      : myListings.filter((l) => l.status === statusFilter);

  /* ── listing card ── */
  const renderCard = ({ item }: { item: any }) => {
    const lot = item.lotSummary;
    const sc = statusColor(item.status);
    const firstImage = item.media?.find((m: any) => m.mediaSlot === 0)?.mediaKey ?? null;
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
          {/* Title + Price */}
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {lot?.lotCode ?? `Anuncio #${item.id?.slice(0, 6)}`}
            </Text>
            <Text style={styles.cardPrice}>
              {formatPrice(item.priceAmount, item.currency)}
            </Text>
          </View>

          {/* Tags */}
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

          {/* Details */}
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

          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>
              {translateStatus(item.status)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /* ── favorite card (same structure, with heart) ── */
  const renderFavoriteCard = ({ item }: { item: any }) => {
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
          <Pressable style={styles.heartBtn}>
            <Ionicons name="heart" size={18} color="#E53E3E" />
          </Pressable>
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
        <View style={styles.headerLeft}>
          <View style={styles.logoGlow} />
          <View style={styles.logoBox}>
            <Ionicons name="folder" size={22} color="#fff" />
          </View>
          <View style={styles.headerBrandGroup}>
            <Text style={styles.headerBrand}>Meus Lotes</Text>
            <Text style={styles.headerSub}>Gerencie seus anúncios e favoritos</Text>
          </View>
        </View>
      </View>

      {/* ── Sub-tab Switcher ── */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'favoritos' && styles.tabActive]}
          onPress={() => setActiveTab('favoritos')}
        >
          <Ionicons
            name="heart-outline"
            size={16}
            color={activeTab === 'favoritos' ? '#1B2D24' : '#666'}
          />
          <Text
            style={[styles.tabText, activeTab === 'favoritos' && styles.tabTextActive]}
          >
            Favoritos ({favorites.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'meus' && styles.tabActive]}
          onPress={() => setActiveTab('meus')}
        >
          <Ionicons
            name="folder-outline"
            size={16}
            color={activeTab === 'meus' ? '#1B2D24' : '#666'}
          />
          <Text
            style={[styles.tabText, activeTab === 'meus' && styles.tabTextActive]}
          >
            Meus Lotes ({myListings.length})
          </Text>
        </Pressable>
      </View>

      {/* ── Content ── */}
      {activeTab === 'favoritos' ? (
        loadingFav ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AgreGreen.brand} />
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>
              Nenhum favorito ainda.{'\n'}Explore o Feed e marque anuncios que gostar!
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavoriteCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            overScrollMode="always"
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          {/* Status filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollContainer}
            contentContainerStyle={styles.filterRow}
          >
            {STATUS_FILTERS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.filterChip,
                  statusFilter === s && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(s)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === s && styles.filterChipTextActive,
                  ]}
                >
                  {s === 'Todos' ? 'Todos' : translateStatus(s)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {loadingMy ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AgreGreen.brand} />
            </View>
          ) : filteredListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {statusFilter === 'Todos'
                  ? 'Nenhum lote com status inativo.'
                  : `Nenhum lote com status "${translateStatus(statusFilter)}".`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredListings}
              keyExtractor={(item) => item.id}
              renderItem={renderCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              overScrollMode="always"
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
