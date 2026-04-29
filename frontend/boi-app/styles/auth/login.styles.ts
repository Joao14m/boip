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
    paddingVertical: 36,
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

  // ── Lembrar-me / Esqueceu ──────────────────────
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 22,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: AgreGreen.button,
    borderColor: AgreGreen.button,
  },
  checkLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#555555',
  },
  forgotText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: AgreGreen.button,
  },

  // ── Botão Entrar ───────────────────────────────
  button: {
    backgroundColor: '#111111',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // ── Link cadastro ──────────────────────────────
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
