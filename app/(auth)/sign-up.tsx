import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, Button, Input } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { useAuth } from '@features/auth';
import { signUpSchema, type SignUpFormData } from '@features/auth/schemas/auth.schema';

export default function SignUpScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    // TODO: call API to create account, then sign in
    await signIn(data.email, data.password);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="heading2">Create account</Text>
          <Text variant="body" style={styles.subtitle}>
            Join the Medina community
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
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
                label="Confirm Password"
                placeholder="Repeat your password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={() => void handleSubmit(onSubmit)()}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.signInLink}
        >
          <Text variant="caption" style={styles.linkText}>
            Already have an account?{' '}
            <Text variant="caption" style={styles.linkTextBold}>
              Sign in
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing[6],
    backgroundColor: colors.neutral[0],
  },
  header: {
    marginBottom: spacing[8],
    gap: spacing[1],
  },
  subtitle: {
    color: colors.neutral[500],
  },
  form: {
    gap: spacing[1],
  },
  submitButton: {
    marginTop: spacing[2],
  },
  signInLink: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  linkText: {
    color: colors.neutral[500],
  },
  linkTextBold: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});
