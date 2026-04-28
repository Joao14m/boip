import { StyleSheet } from 'react-native';
import { AgreGreen } from '@/constants/theme';

export const styles = StyleSheet.create({
  // ── Fundo ──────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#EDF8F2',
  },
  flex: { flex: 1 },

  // Brilho de fundo (posicionado absolutamente)
  glowTopLeft: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#fff',
    opacity: 0.45,
    top: -100,
    left: -80,
  },
  glowBottomRight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: AgreGreen.brand,
    opacity: 0.12,
    bottom: -60,
    right: -60,
  },

  // ── ScrollView ─────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },

  // ── Card flutuante ─────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
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
    fontSize: 22,
    fontWeight: '800',
    color: AgreGreen.dark,
    letterSpacing: 0.3,
  },

  // ── Títulos ────────────────────────────────────
  welcome: {
    fontSize: 26,
    fontWeight: '800',
    color: AgreGreen.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: AgreGreen.muted,
    lineHeight: 20,
    marginBottom: 28,
  },

  // ── Inputs ─────────────────────────────────────
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B2D24',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgreGreen.inputBg,
    borderWidth: 1.5,
    borderColor: AgreGreen.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1B2D24',
  },
  eyeBtn: { padding: 4 },

  // ── Lembrar-me / Esqueceu ──────────────────────
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 24,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: AgreGreen.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: AgreGreen.button,
    borderColor: AgreGreen.button,
  },
  checkLabel: {
    fontSize: 13,
    color: AgreGreen.muted,
  },
  forgotText: {
    fontSize: 13,
    color: AgreGreen.button,
    fontWeight: '600',
  },

  // ── Botão Entrar ───────────────────────────────
  button: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Link cadastro ──────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  bottomText: {
    fontSize: 14,
    color: AgreGreen.muted,
  },
  bottomLink: {
    fontSize: 14,
    color: AgreGreen.button,
    fontWeight: '700',
  },

  // ── Divisor ────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#AAAAAA',
    letterSpacing: 1.4,
  },

  // ── Botão Demo ─────────────────────────────────
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    height: 52,
    backgroundColor: '#fff',
  },
  demoBtnPressed: {
    backgroundColor: '#F8F8F8',
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
});
