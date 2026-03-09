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
const PURPOSES = ['Corte', 'Leite', 'Reprodução'];
const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

/* ── helpers ── */
function formatPrice(amount: number, currency: string) {
  if (currency === 'BRL') return `R$ ${amount.toLocaleString('pt-BR')}`;
  return `${currency} ${amount}`;
}

/* ══════════════════════════════════════════════ */
export default function FeedScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  /* ── fetch all active listings (re-runs on screen focus) ── */
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api.get<{ content: any[] }>('/api/listings?status=ACTIVE&size=100')
        .then((data) => setListings(data.content ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [])
  );

  /* ── count active filters ── */
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

  /* ── client-side filtering ── */
  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const lot = item.lotSummary;

      // text search on lot code / breed
      if (search) {
        const q = search.toLowerCase();
        const lotCode = (lot?.lotCode ?? '').toLowerCase();
        const lotBreed = (lot?.breed ?? '').toLowerCase();
        if (!lotCode.includes(q) && !lotBreed.includes(q)) return false;
      }

      if (breed && lot?.breed !== breed) return false;
      if (purpose && lot?.purpose !== purpose) return false;

      // UF filter — requires location data on listing (not available yet)
      // TODO: will work once backend returns location info in lotSummary

      // price range
      const price = item.priceAmount ?? 0;
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;

      // weight range
      const weight = lot?.avgWeightKg ?? 0;
      if (weightMin && weight < Number(weightMin)) return false;
      if (weightMax && weight > Number(weightMax)) return false;

      return true;
    });
  }, [listings, search, breed, purpose, priceMin, priceMax, weightMin, weightMax]);

  /* ── clear all filters ── */
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
        <Text
          style={[
            styles.dropdownText,
            !value && styles.dropdownPlaceholder,
          ]}
        >
          {value || allLabel}
        </Text>
        <Ionicons
          name={openDropdown === key ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#999"
        />
      </Pressable>
      {openDropdown === key && (
        <ScrollView style={styles.dropdownOptions} nestedScrollEnabled>
          <Pressable
            style={[
              styles.dropdownOption,
              !value && styles.dropdownOptionActive,
            ]}
            onPress={() => {
              onChange('');
              setOpenDropdown(null);
            }}
          >
            <Text
              style={[
                styles.dropdownOptionText,
                !value && styles.dropdownOptionTextActive,
              ]}
            >
              {allLabel}
            </Text>
          </Pressable>
          {options.map((opt) => (
            <Pressable
              key={opt}
              style={[
                styles.dropdownOption,
                value === opt && styles.dropdownOptionActive,
              ]}
              onPress={() => {
                onChange(opt);
                setOpenDropdown(null);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === opt && styles.dropdownOptionTextActive,
                ]}
              >
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
          <Pressable style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={18} color="#888" />
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

  /* ══════════════════════════════════════════════ */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="storefront-outline" size={22} color={AgreGreen.dark} />
          <View>
            <Text style={styles.headerBrand}>Agregis</Text>
          </View>
        </View>
        <Pressable style={styles.createBtn} onPress={() => router.push('/listing/create')}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.createBtnText}>Criar Anuncio</Text>
        </Pressable>
      </View>

      {/* ── Filter Toggle ── */}
      <Pressable
        style={styles.filterToggle}
        onPress={() => {
          setShowFilters((v) => !v);
          setOpenDropdown(null);
        }}
      >
        <View style={styles.filterToggleLeft}>
          <Ionicons name="funnel-outline" size={18} color={AgreGreen.dark} />
          <Text style={styles.filterToggleText}>Filtros</Text>
          {activeFilterCount > 0 && (
            <View style={styles.activeFilterCount}>
              <Text style={styles.activeFilterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.filterToggleAction}>
          {showFilters ? 'Recolher' : 'Expandir'}
        </Text>
      </Pressable>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <ScrollView
          style={styles.filterPanel}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Search */}
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

          {/* Breed */}
          {renderDropdown('Raça', 'breed', BREEDS, breed, setBreed, 'Todas as raças')}

          {/* Purpose */}
          {renderDropdown('Finalidade', 'purpose', PURPOSES, purpose, setPurpose, 'Todas')}

          {/* UF */}
          {renderDropdown('Estado', 'uf', UFS, uf, setUf, 'Todos os estados')}

          {/* Price Range */}
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

          {/* Weight Range */}
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

          {/* Clear */}
          {activeFilterCount > 0 && (
            <Pressable style={styles.clearFiltersBtn} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Limpar filtros</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* ── Results ── */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filtered.length} anuncio{filtered.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AgreGreen.brand} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>
            Nenhum anuncio encontrado.{'\n'}Tente ajustar os filtros.
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
