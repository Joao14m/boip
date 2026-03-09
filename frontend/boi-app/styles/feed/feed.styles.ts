import { StyleSheet } from 'react-native';
import { AgreGreen } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  /* ── Header ── */
  header: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: AgreGreen.dark,
  },
  headerSub: {
    fontSize: 11,
    color: AgreGreen.muted,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgreGreen.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  /* ── Filter Toggle ── */
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  filterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B2D24',
  },
  filterToggleAction: {
    fontSize: 13,
    color: AgreGreen.muted,
  },
  activeFilterCount: {
    backgroundColor: AgreGreen.brand,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },

  /* ── Filter Panel ── */
  filterPanel: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },

  /* ── Search ── */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1B2D24',
    marginLeft: 8,
  },
  clearBtn: {
    padding: 4,
  },

  /* ── Filter Field ── */
  filterField: {
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B2D24',
    marginBottom: 6,
  },

  /* ── Dropdown ── */
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
  },
  dropdownText: {
    fontSize: 14,
    color: '#1B2D24',
  },
  dropdownPlaceholder: {
    color: '#999',
  },

  /* ── Dropdown Options Overlay ── */
  dropdownOptions: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownOptionActive: {
    backgroundColor: AgreGreen.pale,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#1B2D24',
  },
  dropdownOptionTextActive: {
    color: AgreGreen.dark,
    fontWeight: '600',
  },

  /* ── Range Slider ── */
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rangeValue: {
    fontSize: 13,
    color: AgreGreen.muted,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginVertical: 8,
  },
  sliderFill: {
    height: 4,
    backgroundColor: AgreGreen.brand,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
  },
  rangeInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
    color: '#1B2D24',
    textAlign: 'center',
  },
  rangeDash: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#999',
  },

  /* ── Clear Filters ── */
  clearFiltersBtn: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearFiltersText: {
    fontSize: 13,
    color: AgreGreen.brand,
    fontWeight: '600',
  },

  /* ── Results Header ── */
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B2D24',
  },

  /* ── Listing Cards ── */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: AgreGreen.button,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  purposeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B2D24',
    flex: 1,
    marginRight: 8,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: AgreGreen.brand,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: '#555',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: AgreGreen.muted,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: AgreGreen.muted,
  },

  /* ── Empty / Loading ── */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    color: AgreGreen.muted,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});
