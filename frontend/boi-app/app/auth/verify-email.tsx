import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AgreGreen, Fonts } from '@/constants/theme';
import { styles } from '@/styles/auth/signup.styles';

export default function VerifyEmailScreen() {
  const { refreshMe } = useAuth();
  const params = useLocalSearchParams<{ email?: string; payload?: string }>();
  const email = params.email ?? auth.currentUser?.email ?? '';

  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [info, setInfo]         = useState('');

  // Confere se o e-mail foi verificado e, em caso afirmativo, conclui o onboard.
  const handleConfirm = async () => {
    setFormError('');
    setInfo('');
    const current = auth.currentUser;
    if (!current) {
      setFormError('Sessão expirada. Faça login novamente.');
      return;
    }

    try {
      setLoading(true);
      await current.reload();                 // atualiza emailVerified a partir do Firebase
      if (!current.emailVerified) {
        setFormError('Ainda não confirmamos seu e-mail. Clique no link enviado e tente de novo.');
        return;
      }
      await current.getIdToken(true);         // força refresh do token para o claim email_verified

      if (!params.payload) {
        // Sem dados do formulário (ex.: cheguei aqui por outro fluxo): refaz o cadastro.
        router.replace('/auth/signup');
        return;
      }

      await api.post('/auth/onboard', JSON.parse(params.payload));
      await refreshMe();
      router.replace('/(tabs)/feed');
    } catch (e: any) {
      setFormError(e?.message ?? 'Não foi possível concluir o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setFormError('');
    setInfo('');
    const current = auth.currentUser;
    if (!current) {
      setFormError('Sessão expirada. Faça login novamente.');
      return;
    }
    try {
      setResending(true);
      await sendEmailVerification(current);
      setInfo('E-mail de verificação reenviado.');
    } catch (e: any) {
      const code = e?.code ?? '';
      setFormError(
        code === 'auth/too-many-requests'
          ? 'Muitas tentativas. Aguarde um pouco antes de reenviar.'
          : 'Não foi possível reenviar o e-mail.',
      );
    } finally {
      setResending(false);
    }
  };

  const handleUseAnother = async () => {
    try {
      await auth.signOut();
    } finally {
      router.replace('/auth/signup');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <LinearGradient
        colors={['rgba(82, 183, 136, 0.30)', 'rgba(82, 183, 136, 0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 0.75 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(82, 183, 136, 0.10)', 'rgba(82, 183, 136, 0.25)']}
        start={{ x: 0.6, y: 0.4 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={local.center}>
        <View style={styles.card}>
          <View style={local.iconCircle}>
            <Ionicons name="mail-unread-outline" size={32} color={AgreGreen.button} />
          </View>

          <Text style={styles.welcome}>Confirme seu e-mail</Text>
          <Text style={styles.subtitle}>
            Enviamos um link de verificação para{'\n'}
            <Text style={local.email}>{email}</Text>.{'\n'}
            Clique no link e depois toque em "Já confirmei".
          </Text>

          {formError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          ) : null}

          {info ? (
            <View style={local.infoBanner}>
              <Text style={local.infoBannerText}>{info}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Já confirmei'}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [local.secondaryBtn, pressed ? { opacity: 0.7 } : null]}
            onPress={handleResend}
            disabled={resending}
          >
            <Text style={local.secondaryText}>
              {resending ? 'Reenviando...' : 'Reenviar e-mail'}
            </Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Não é seu e-mail? </Text>
            <Pressable onPress={handleUseAnother} hitSlop={8}>
              <Text style={styles.bottomLink}>Usar outra conta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const local = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: AgreGreen.pale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  email: {
    fontFamily: Fonts.semiBold,
    color: AgreGreen.dark,
  },
  infoBanner: {
    backgroundColor: AgreGreen.pale,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoBannerText: {
    fontFamily: Fonts.regular,
    color: AgreGreen.dark,
    fontSize: 13,
  },
  secondaryBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: AgreGreen.button,
  },
});
