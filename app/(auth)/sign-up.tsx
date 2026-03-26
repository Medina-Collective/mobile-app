import { useState } from 'react';
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
import { signUpSchema, type SignUpFormData } from '@features/auth/schemas/auth.schema';

type Role = 'user' | 'professional';
const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'user', label: 'Member', description: 'Discover events & professionals' },
  { value: 'professional', label: 'Professional', description: 'Publish events & a profile' },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', role: 'user', password: '', confirmPassword: '' },
  });

  const selectedRole = watch('role');
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  const onSubmit = async (data: SignUpFormData) => {
    setServerError(undefined);
    try {
      await signUp(data.email, data.password, data.displayName);
      if (data.role === 'professional') {
        router.replace('/(auth)/professional-profile');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setServerError(message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <BackButton />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="heading1" style={styles.heading}>
              {'You belong\nhere ♡'}
            </Text>
            <Text variant="bodySm" style={styles.subtitle}>
              Create your account and join the community.
            </Text>
          </View>

          <View style={styles.roleSection}>
            <Text variant="overline" style={styles.subtitle}>
              I am joining as
            </Text>
            <View style={styles.roleRow}>
              {ROLES.map(({ value, label, description }) => {
                const isSelected = selectedRole === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setValue('role', value)}
                    style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                      {label}
                    </Text>
                    <Text style={[styles.roleDesc, isSelected && styles.roleDescSelected]}>
                      {description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <Input
                  variant="light"
                label="Full name"
                placeholder="Your name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                autoComplete="name"
                error={errors.displayName?.message}
              />
            )}
          />
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
                placeholder="Min. 8 characters"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoComplete="new-password"
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                  variant="light"
                label="Confirm password"
                placeholder="Repeat your password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {serverError !== undefined && (
            <Text variant="caption" style={styles.serverError}>
              {serverError}
            </Text>
          )}

          <Button
            title="Create account"
            onPress={() => void handleSubmit(onSubmit)()}
            loading={isLoading}
            style={styles.cta}
            textColor='#ffffff'
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} style={styles.footer}>
            <Text variant="caption" style={styles.footerText}>
              {'Already have an account?  '}
              <Text variant="caption" style={styles.footerLink}>
                Sign in
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#faf6f0' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing[8], paddingTop: spacing[8], paddingBottom: spacing[10] },
  header: { marginBottom: spacing[10], gap: spacing[3] },
  heading: { color: '#1a1212' },
  subtitle: { color: 'rgba(26, 18, 18, 0.45)' },

  roleSection: { marginBottom: spacing[10], gap: spacing[4] },
  roleRow: { flexDirection: 'row', gap: spacing[3] },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(160, 122, 95, 0.30)',
    borderRadius: 8,
    padding: spacing[4],
    gap: spacing[1],
    backgroundColor: 'transparent',
  },
  roleCardSelected: { borderColor: '#2F0A0A', backgroundColor: 'rgba(40, 2, 10, 0.04)' },
  roleLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(26, 18, 18, 0.55)', letterSpacing: 0.3 },
  roleLabelSelected: { color: '#1a1212' },
  roleDesc: { fontSize: 11, color: 'rgba(26, 18, 18, 0.45)', lineHeight: 15, opacity: 0.7 },
  roleDescSelected: { color: 'rgba(26, 18, 18, 0.55)', opacity: 1 },

  serverError: { color: '#e57373', textAlign: 'center', marginTop: spacing[2] },
  cta: { width: '100%', marginTop: spacing[4], backgroundColor: '#2F0A0A' },
  footer: { marginTop: spacing[8], alignItems: 'center' },
  footerText: { color: 'rgba(26, 18, 18, 0.45)' },
  footerLink: { color: '#2F0A0A', fontWeight: '600' },
});
