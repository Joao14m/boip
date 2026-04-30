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
    paddingTop: 14,
    paddingBottom: 14,
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
    gap: 10,
  },
  logoGlow: {
    position: 'absolute',
    left: -6,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AgreGreen.brand,
    opacity: 0.25,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AgreGreen.button,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AgreGreen.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBrandGroup: {
    flexDirection: 'column',
    gap: 1,
  },
  headerBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B2D24',
  },
  headerSub: {
    fontSize: 11,
    color: '#888',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Filter Toggle ── */
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B2D24',
  },
  filterToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  clearInlineText: {
    fontSize: 13,
    color: AgreGreen.muted,
  },
  filterToggleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  filterToggleActionText: {
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
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
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

  /* ── Range Inputs ── */
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

  /* ── Tabs ── */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 4,
    gap: 4,
    borderRadius: 999,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#1B2D24',
  },

  /* ── Listing Cards ── */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: AgreGreen.brand,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: AgreGreen.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  purposeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  photoCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  imageDots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  imageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  imageDotActive: {
    backgroundColor: '#fff',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1B2D24',
    flex: 1,
    marginRight: 8,
  },
  cardPrice: {
    fontSize: 16,
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
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: AgreGreen.muted,
  },

  /* ── Detail Button ── */
  detailBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
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
