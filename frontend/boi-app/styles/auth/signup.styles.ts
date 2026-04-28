import { StyleSheet } from 'react-native';
import { AgreGreen } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: { flex: 1 },

  // Logo row (same as login)
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
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

  // Card (ScrollView)
  card: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardContent: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 60,
  },
  welcome: {
    fontSize: 26,
    fontWeight: '800',
    color: AgreGreen.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: AgreGreen.muted,
    marginBottom: 26,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
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

  // CPF / CNPJ toggle
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AgreGreen.inputBorder,
    backgroundColor: AgreGreen.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: AgreGreen.button,
    borderColor: AgreGreen.button,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: AgreGreen.muted,
  },
  toggleTextActive: {
    color: '#fff',
  },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchHint: {
    fontSize: 12,
    color: AgreGreen.placeholder,
    marginTop: 2,
  },

  // Location dropdown
  locationDropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ECECEC',
    maxHeight: 200,
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
    fontSize: 14,
    color: AgreGreen.dark,
  },
  locationOptionActive: {
    backgroundColor: AgreGreen.pale,
  },
  locationOptionTextActive: {
    color: AgreGreen.dark,
    fontWeight: '600',
  },

  // Modal de localização
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B2D24',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1B2D24',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalOptionActive: {
    backgroundColor: AgreGreen.pale,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#1B2D24',
  },
  modalOptionTextActive: {
    color: AgreGreen.dark,
    fontWeight: '600',
  },
  modalEmpty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 12,
  },
  modalEmptyText: {
    fontSize: 14,
    color: AgreGreen.muted,
    textAlign: 'center',
  },

  // Button
  button: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 8,
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
