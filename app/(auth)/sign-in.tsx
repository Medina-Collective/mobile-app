import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input, BackButton } from '@components/ui';
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton />

          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="heading1" style={styles.heading}>
                {'Welcome\nback ♡'}
              </Text>
              <Text variant="bodySm" style={styles.subtitle}>
                So glad you're here. Sign in to continue.
              </Text>
            </View>

            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    variant="light"
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
                    variant="light"
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
              textColor="#ffffff"
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.footer}>
              <Text variant="caption" style={styles.footerText}>
                {"Don't have an account?  "}
                <Text variant="caption" style={styles.footerLink}>
                  Sign up
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#faf6f0' },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing[8], paddingTop: spacing[10] },
  header: { marginBottom: spacing[12], gap: spacing[3] },
  heading: { color: '#1a1212' },
  subtitle: { color: 'rgba(26, 18, 18, 0.45)' },
  forgotLink: { alignSelf: 'flex-end', marginTop: -spacing[2] },
  forgotText: { color: 'rgba(26, 18, 18, 0.45)' },
  cta: { marginTop: spacing[10], width: '100%', backgroundColor: '#2F0A0A' },
  scroll: { flexGrow: 1 },
  footer: { paddingTop: spacing[8], paddingBottom: spacing[6], alignItems: 'center' },
  footerText: { color: 'rgba(26, 18, 18, 0.45)' },
  footerLink: { color: '#2F0A0A', fontWeight: '600' },
});
