import { Dimensions, StyleSheet } from 'react-native';
import { AgreGreen } from '@/constants/theme';

export const HEADER_HEIGHT = Dimensions.get('window').height * 0.36;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AgreGreen.header,
  },
  flex: { flex: 1 },

  // Header
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: AgreGreen.header,
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: AgreGreen.brand,
    opacity: 0.3,
    top: -60,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AgreGreen.dark,
    opacity: 0.15,
    top: 30,
    right: 70,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AgreGreen.brand,
    opacity: 0.18,
    bottom: 50,
    right: 16,
  },
  headerBrand: {
    position: 'absolute',
    top: 20,
    left: 28,
    fontSize: 26,
    fontWeight: '800',
    color: AgreGreen.dark,
    letterSpacing: 1,
  },
  cattleEmoji: {
    fontSize: 68,
    transform: [{ scaleX: -1 }],
    position: 'absolute',
    bottom: 20,
    left: 24,
    opacity: 0.85,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
  },
  cardContent: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
  },
  welcome: {
    fontSize: 26,
    fontWeight: '800',
    color: AgreGreen.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AgreGreen.muted,
    marginBottom: 30,
  },

  // Inputs
  fieldGroup: { marginBottom: 18 },
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
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1B2D24',
  },
  eyeBtn: { padding: 4 },

  // Remember me / Forgot
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 28,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
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
    fontSize: 14,
    color: AgreGreen.muted,
  },
  forgotText: {
    fontSize: 14,
    color: AgreGreen.button,
    fontWeight: '600',
  },

  // Button
  button: {
    backgroundColor: AgreGreen.button,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AgreGreen.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Bottom link
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
});
