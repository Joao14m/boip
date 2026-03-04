import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgreGreen } from '@/constants/theme';
import { styles } from '@/styles/auth/login.styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // TODO: Firebase signInWithEmailAndPassword(auth, email, password)
    console.log('login', { email, rememberMe });
    router.replace('/(tabs)/feed');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header / Cattle area ── */}
        <View style={styles.header}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />

          <Text style={styles.headerBrand}>Agregis</Text>

          {/*
           * Cattle placeholder — quando tiver o asset, substitua por:
           * <Image source={require('@/assets/images/cattle.png')} style={styles.cattleImage} />
           */}
          <Text style={styles.cattleEmoji}>🐄</Text>
        </View>

        {/* ── Card branco ── */}
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcome}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>

          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={AgreGreen.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={AgreGreen.brand} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Sua senha"
                placeholderTextColor={AgreGreen.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={AgreGreen.muted}
                />
              </Pressable>
            </View>
          </View>

          {/* Lembrar-me + Esqueceu a senha */}
          <View style={styles.rowBetween}>
            <Pressable style={styles.checkRow} onPress={() => setRememberMe(v => !v)}>
              <View style={[styles.checkbox, rememberMe ? styles.checkboxOn : null]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.checkLabel}>Lembrar-me</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </Pressable>
          </View>

          {/* Entrar */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>

          {/* Link cadastro */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Não tem uma conta? </Text>
            <Pressable onPress={() => router.replace("/auth/signup")}>
              <Text style={styles.bottomLink}>Criar Conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

