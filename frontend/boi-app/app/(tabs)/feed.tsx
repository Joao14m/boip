import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/feed/feed.styles';
import { api } from '@/lib/api';

/* ── Known dropdown values ── */
const BREEDS = ['Nelore', 'Angus', 'Brahman', 'Hereford', 'Senepol', 'Gir', 'Guzerá', 'Tabapuã'];
const PURPOSES = ['Corte', 'Leite', 'Reprodução', 'Misto'];
const SEX_LABEL: Record<string, string> = { M: 'Macho', F: 'Fêmea', MIXED: 'Misto' };
const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

function formatPrice(amount: number, currency: string) {
  if (currency === 'BRL') return `R$ ${amount.toLocaleString('pt-BR')}`;
  return `${currency} ${amount}`;
}

/* ══════════════════════════════════════════════ */
export default function FeedScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  /* ── filter state ── */
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [breed, setBreed] = useState('');
  const [purpose, setPurpose] = useState('');
  const [uf, setUf] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [weightMin, setWeightMin] = useState('');
  const [weightMax, setWeightMax] = useState('');

  /* ── dropdown open state ── */
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api.get<{ content: any[] }>('/api/listings?status=ACTIVE&size=50')
        .then((data) => setListings(data.content ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [])
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (breed) count++;
    if (purpose) count++;
    if (uf) count++;
    if (priceMin) count++;
    if (priceMax) count++;
    if (weightMin) count++;
    if (weightMax) count++;
    return count;
  }, [search, breed, purpose, uf, priceMin, priceMax, weightMin, weightMax]);

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const lot = item.lotSummary;
      if (search) {
        const q = search.toLowerCase();
        const lotCode = (lot?.lotCode ?? '').toLowerCase();
        const lotBreed = (lot?.breed ?? '').toLowerCase();
        if (!lotCode.includes(q) && !lotBreed.includes(q)) return false;
      }
      if (breed && lot?.breed !== breed) return false;
      if (purpose && lot?.purpose !== purpose) return false;
      if (uf && lot?.uf !== uf) return false;
      const price = item.priceAmount ?? 0;
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;
      const weight = lot?.avgWeightKg ?? 0;
      if (weightMin && weight < Number(weightMin)) return false;
      if (weightMax && weight > Number(weightMax)) return false;
      return true;
    });
  }, [listings, search, breed, purpose, uf, priceMin, priceMax, weightMin, weightMax]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setBreed('');
    setPurpose('');
    setUf('');
    setPriceMin('');
    setPriceMax('');
    setWeightMin('');
    setWeightMax('');
    setOpenDropdown(null);
  }, []);

  /* ── dropdown component ── */
  const renderDropdown = (
    label: string,
    key: string,
    options: string[],
    value: string,
    onChange: (v: string) => void,
    allLabel: string
  ) => (
    <View style={styles.filterField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Pressable
        style={styles.dropdown}
        onPress={() => setOpenDropdown(openDropdown === key ? null : key)}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || allLabel}
        </Text>
        <Ionicons name={openDropdown === key ? 'chevron-up' : 'chevron-down'} size={16} color="#999" />
      </Pressable>
      {openDropdown === key && (
        <ScrollView style={styles.dropdownOptions} nestedScrollEnabled>
          <Pressable
            style={[styles.dropdownOption, !value && styles.dropdownOptionActive]}
            onPress={() => { onChange(''); setOpenDropdown(null); }}
          >
            <Text style={[styles.dropdownOptionText, !value && styles.dropdownOptionTextActive]}>
              {allLabel}
            </Text>
          </Pressable>
          {options.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.dropdownOption, value === opt && styles.dropdownOptionActive]}
              onPress={() => { onChange(opt); setOpenDropdown(null); }}
            >
              <Text style={[styles.dropdownOptionText, value === opt && styles.dropdownOptionTextActive]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );

  /* ── listing card ── */
  const renderCard = ({ item }: { item: any }) => {
    const lot = item.lotSummary;
    const media: any[] = item.media ?? [];
    const firstImage = media.find((m) => m.mediaSlot === 0)?.mediaKey ?? null;
    const photoCount = media.length;

    const locationParts = [lot?.city, lot?.uf].filter(Boolean);
    const location = locationParts.join(' - ');

    return (
      <View style={styles.card}>
        <View style={styles.cardImagePlaceholder}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={{ width: '100%', height: '100%', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="image-outline" size={40} color="#BBB" />
          )}

          {lot?.purpose && (
            <View style={styles.purposeBadge}>
              <Text style={styles.purposeBadgeText}>{lot.purpose}</Text>
            </View>
          )}

          <Pressable style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={18} color="#888" />
          </Pressable>

          {/* Dots indicator */}
          {photoCount > 1 && (
            <View style={styles.imageDots}>
              {Array.from({ length: Math.min(photoCount, 5) }).map((_, i) => (
                <View key={i} style={[styles.imageDot, i === 0 && styles.imageDotActive]} />
              ))}
            </View>
          )}

          {/* Photo count badge */}
          {photoCount > 0 && (
            <View style={styles.photoCountBadge}>
              <Ionicons name="images-outline" size={12} color="#fff" />
              <Text style={styles.photoCountText}>{photoCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {lot?.lotCode ?? `Anúncio #${item.id?.slice(0, 6)}`}
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
                  <Text style={styles.tagText}>{SEX_LABEL[lot.sex] ?? lot.sex}</Text>
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

          {location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={AgreGreen.muted} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          ) : null}

          <Pressable
            style={styles.detailBtn}
            onPress={() => router.push({ pathname: '/listing/[id]', params: { id: item.id } })}
          >
            <Text style={styles.detailBtnText}>Ver Detalhes</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  /* ══════════════════════════════════════════════ */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoGlow} />
          <View style={styles.logoBox}>
            <Ionicons name="storefront" size={22} color="#fff" />
          </View>
          <View style={styles.headerBrandGroup}>
            <Text style={styles.headerBrand}>Agregis</Text>
            <Text style={styles.headerSub}>Compra e venda de gado</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.createBtn} onPress={() => router.push('/listing/create')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Criar Anúncio</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Filter Toggle ── */}
      <View style={styles.filterToggle}>
        <Pressable
          style={styles.filterToggleLeft}
          onPress={() => { setShowFilters(v => !v); setOpenDropdown(null); }}
        >
          <Ionicons name="funnel-outline" size={18} color={AgreGreen.dark} />
          <Text style={styles.filterToggleText}>Filtros</Text>
          {activeFilterCount > 0 && (
            <View style={styles.activeFilterCount}>
              <Text style={styles.activeFilterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.filterToggleRight}>
          {activeFilterCount > 0 && (
            <Pressable style={styles.clearInlineBtn} onPress={clearFilters}>
              <Ionicons name="close" size={14} color={AgreGreen.muted} />
              <Text style={styles.clearInlineText}>Limpar</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.filterToggleAction}
            onPress={() => { setShowFilters(v => !v); setOpenDropdown(null); }}
          >
            <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={16} color={AgreGreen.muted} />
            <Text style={styles.filterToggleActionText}>{showFilters ? 'Recolher' : 'Expandir'}</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <ScrollView
          style={styles.filterPanel}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.filterField, { marginTop: 12 }]}>
            <Text style={styles.filterLabel}>Buscar</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Digite para buscar..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
              {search !== '' && (
                <Pressable style={styles.clearBtn} onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#CCC" />
                </Pressable>
              )}
            </View>
          </View>

          {renderDropdown('Raça', 'breed', BREEDS, breed, setBreed, 'Todas as raças')}
          {renderDropdown('Finalidade', 'purpose', PURPOSES, purpose, setPurpose, 'Todas')}
          {renderDropdown('Estado', 'uf', UFS, uf, setUf, 'Todos os estados')}

          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>
              Preço: R$ {priceMin || '0'} - R$ {priceMax || '∞'}
            </Text>
            <View style={styles.rangeInputRow}>
              <TextInput
                style={styles.rangeInput}
                placeholder="Min"
                placeholderTextColor="#999"
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
              />
              <Text style={styles.rangeDash}>—</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="Max"
                placeholderTextColor="#999"
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>
              Peso: {weightMin || '0'}kg - {weightMax || '∞'}kg
            </Text>
            <View style={styles.rangeInputRow}>
              <TextInput
                style={styles.rangeInput}
                placeholder="Min (kg)"
                placeholderTextColor="#999"
                value={weightMin}
                onChangeText={setWeightMin}
                keyboardType="numeric"
              />
              <Text style={styles.rangeDash}>—</Text>
              <TextInput
                style={styles.rangeInput}
                placeholder="Max (kg)"
                placeholderTextColor="#999"
                value={weightMax}
                onChangeText={setWeightMax}
                keyboardType="numeric"
              />
            </View>
          </View>

          {activeFilterCount > 0 && (
            <Pressable style={styles.clearFiltersBtn} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Todos os Anúncios ({filtered.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name="heart-outline"
            size={14}
            color={activeTab === 'favorites' ? AgreGreen.dark : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
            Favoritos (0)
          </Text>
        </Pressable>
      </View>

      {/* ── Results ── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AgreGreen.brand} />
        </View>
      ) : activeTab === 'favorites' ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>Nenhum favorito ainda.</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>
            Nenhum anúncio encontrado.{'\n'}Tente ajustar os filtros.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
