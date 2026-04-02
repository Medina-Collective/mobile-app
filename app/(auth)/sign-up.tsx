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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Input, BackButton } from '@components/ui';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';
import { signUpSchema, type SignUpFormData } from '@features/auth/schemas/auth.schema';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [applyingForVerified, setApplyingForVerified] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setServerError(undefined);
    try {
      await signUp(data.email, data.password, data.displayName);
      if (applyingForVerified) {
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

          {/* Verified profile intent badge */}
          {applyingForVerified && (
            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedBadgeLeft}>
                <Ionicons name="checkmark-circle" size={15} color="#2F0A0A" />
                <Text style={styles.verifiedBadgeText}>Applying for a verified profile</Text>
              </View>
              <TouchableOpacity
                onPress={() => setApplyingForVerified(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={16} color="#2F0A0A" />
              </TouchableOpacity>
            </View>
          )}

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
            textColor="#ffffff"
          />

          {/* Verified profile application link */}
          {!applyingForVerified && (
            <TouchableOpacity
              onPress={() => setApplyingForVerified(true)}
              style={styles.verifiedLink}
              activeOpacity={0.7}
            >
              <Text variant="caption" style={styles.verifiedLinkLabel}>
                Are you an organizer, business, or community group?
              </Text>
              <Text variant="caption" style={styles.verifiedLinkCta}>
                Apply for a verified profile →
              </Text>
            </TouchableOpacity>
          )}

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

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8ddd4',
    borderRadius: 8,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  verifiedBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F0A0A',
    letterSpacing: 0.2,
  },

  serverError: { color: '#e57373', textAlign: 'center', marginTop: spacing[2] },
  cta: { width: '100%', marginTop: spacing[4], backgroundColor: '#2F0A0A' },

  verifiedLink: {
    marginTop: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
  },
  verifiedLinkLabel: {
    color: 'rgba(26, 18, 18, 0.40)',
    textAlign: 'center',
  },
  verifiedLinkCta: {
    color: 'rgba(47, 10, 10, 0.65)',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  footer: { marginTop: spacing[8], alignItems: 'center' },
  footerText: { color: 'rgba(26, 18, 18, 0.45)' },
  footerLink: { color: '#2F0A0A', fontWeight: '600' },
});
