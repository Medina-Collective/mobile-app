import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="heading2">Welcome back</Text>
          <Text variant="body" style={styles.subtitle}>
            Sign in to your Medina account
          </Text>
        </View>

        <View style={styles.form}>
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

          <Button
            title="Sign In"
            onPress={() => void handleSubmit(onSubmit)()}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.signUpLink}
        >
          <Text variant="caption" style={styles.linkText}>
            Don't have an account?{' '}
            <Text variant="caption" style={styles.linkTextBold}>
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
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
  signUpLink: {
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
