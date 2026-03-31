import { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@components/ui';
import { spacing } from '@theme/spacing';
import { supabase } from '@services/supabase.client';
import { useAuthStore } from '@store/auth.store';

export default function CheckEmailScreen() {
  const router = useRouter();
  const { email, role } = useLocalSearchParams<{ email: string; role: string }>();
  const [isChecking, setIsChecking] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const setAuth = useAuthStore((s) => s.hydrateFromStorage);

  // Auto-advance if the user confirms via deep link while the app is open
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        void setAuth().then(() => {
          if (role === 'professional') {
            router.replace('/(auth)/professional-profile');
          } else {
            router.replace('/(tabs)');
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [role, router, setAuth]);

  const handleContinue = async () => {
    setIsChecking(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await setAuth();
        if (role === 'professional') {
          router.replace('/(auth)/professional-profile');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        alert(
          "We couldn't detect your confirmation yet. Please click the link in the email first.",
        );
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendDisabled(true);
    await supabase.auth.resend({ type: 'signup', email });
    setTimeout(() => setResendDisabled(false), 60000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-outline" size={56} color="#CEC1AE" />
        </View>

        <Text variant="heading2" style={styles.heading}>
          Check your inbox
        </Text>
        <Text variant="bodySm" style={styles.body}>
          {'We sent a confirmation link to\n'}
          <Text variant="bodySm" style={styles.email}>
            {email}
          </Text>
          {
            '\n\nOpen the email and tap the link to activate your account. Then come back here and press Continue.'
          }
        </Text>

        <Button
          title="I've confirmed — Continue"
          onPress={() => void handleContinue()}
          loading={isChecking}
          style={styles.cta}
        />

        <TouchableOpacity
          onPress={() => void handleResend()}
          disabled={resendDisabled}
          style={styles.resendBtn}
        >
          <Text
            variant="caption"
            style={[styles.resendText, resendDisabled && styles.resendDisabled]}
          >
            {resendDisabled ? 'Email sent — check your inbox' : "Didn't receive it? Resend email"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#28030a' },
  container: {
    flex: 1,
    paddingHorizontal: spacing[8],
    paddingTop: spacing[16],
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3d0a12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  heading: {
    color: '#CEC1AE',
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  body: {
    color: '#7b625b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[10],
  },
  email: {
    color: '#CEC1AE',
    fontWeight: '600',
  },
  cta: {
    width: '100%',
    backgroundColor: '#CEC1AE',
    marginBottom: spacing[4],
  },
  resendBtn: {
    padding: spacing[2],
  },
  resendText: {
    color: '#7b625b',
    textAlign: 'center',
  },
  resendDisabled: {
    opacity: 0.5,
  },
});
