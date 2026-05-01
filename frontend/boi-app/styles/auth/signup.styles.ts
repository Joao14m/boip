import { StyleSheet } from 'react-native';
import { AgreGreen, Fonts } from '@/constants/theme';

export const styles = StyleSheet.create({
  // ── Fundo ──────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },

  // ── ScrollView ─────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  // ── Card ───────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },

  // ── Logo ───────────────────────────────────────
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AgreGreen.button,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AgreGreen.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    color: AgreGreen.dark,
    letterSpacing: 0.3,
  },

  // ── Títulos ────────────────────────────────────
  welcome: {
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    color: '#0F1C15',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: AgreGreen.muted,
    lineHeight: 20,
    marginBottom: 24,
  },

  // ── Banner de erro ─────────────────────────────
  errorBanner: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    fontFamily: Fonts.regular,
    color: '#C53030',
    fontSize: 13,
  },

  // ── Layout helpers ─────────────────────────────
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },

  // ── Inputs ─────────────────────────────────────
  fieldGroup: { marginBottom: 14 },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: '#1B2D24',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: '#1B2D24',
  },
  eyeBtn: { padding: 4 },

  // ── CPF / CNPJ toggle ──────────────────────────
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: AgreGreen.button,
    borderColor: AgreGreen.button,
    shadowColor: AgreGreen.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: AgreGreen.muted,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

  // ── Switch row ─────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },

  // ── Location dropdown ──────────────────────────
  locationDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ECECEC',
    maxHeight: 240,
    overflow: 'hidden',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  locationOptionText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#1B2D24',
  },
  locationOptionActive: {
    backgroundColor: AgreGreen.pale,
  },
  locationOptionTextActive: {
    fontFamily: Fonts.semiBold,
    color: AgreGreen.dark,
  },

  // ── Botão Criar Conta ──────────────────────────
  button: {
    backgroundColor: '#111111',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // ── Link login ─────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#888888',
  },
  bottomLink: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: AgreGreen.button,
  },
});
