import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Input } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';
import { signInSchema, type SignInFormData } from '@features/auth/schemas/auth.schema';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInFormData) => {
    await signIn(data.email, data.password);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Back ─────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.beige[300]} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* ── Heading ────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text variant="heading1">{'Welcome\nback ♡'}</Text>
            <Text variant="bodySm" style={styles.subtitle}>
              So glad you're here. Sign in to continue.
            </Text>
          </View>

          {/* ── Form ───────────────────────────────────────────────── */}
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoComplete="current-password"
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity style={styles.forgotLink}>
              <Text variant="caption" style={styles.forgotText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Continue"
            onPress={() => void handleSubmit(onSubmit)()}
            loading={isLoading}
            style={styles.cta}
          />
        </View>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.footer}>
          <Text variant="caption">
            {"Don't have an account?  "}
            <Text variant="caption" style={styles.footerLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.burgundy.deep },
  flex:       { flex: 1 },
  backButton: { marginTop: spacing[2], marginLeft: spacing[6], width: 40, height: 40, justifyContent: 'center' },
  content:    { flex: 1, paddingHorizontal: spacing[8], paddingTop: spacing[10] },
  header:     { marginBottom: spacing[12], gap: spacing[3] },
  subtitle:   { color: colors.beige[400] },
  forgotLink: { alignSelf: 'flex-end', marginTop: -spacing[2] },
  forgotText: { color: colors.crimson[400] },
  cta:        { marginTop: spacing[10], width: '100%' },
  footer:     { paddingBottom: spacing[6], alignItems: 'center' },
  footerLink: { color: colors.beige[200], fontWeight: '600' },
});
