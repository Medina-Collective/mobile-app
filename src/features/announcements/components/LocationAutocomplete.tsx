import { useState, useEffect, useRef, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';

const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

interface Prediction {
  placeId: string;
  description: string;
}

interface LocationAutocompleteProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string | undefined;
  helperText?: string | undefined;
  placeholder?: string | undefined;
}

export function LocationAutocomplete({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Search for a place…',
}: Readonly<LocationAutocompleteProps>) {
  const [inputText, setInputText] = useState(value ?? '');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showList, setShowList] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. form reset in edit screen)
  useEffect(() => {
    setInputText(value ?? '');
  }, [value]);

  const fetchPredictions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setPredictions([]);
      return;
    }
    if (!PLACES_API_KEY) {
      console.warn('[LocationAutocomplete] EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set.');
      return;
    }
    try {
      const res = await fetch(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': PLACES_API_KEY,
            'X-Goog-FieldMask':
              'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
          },
          body: JSON.stringify({
            input: query,
            languageCode: 'en',
            regionCode: 'CA',
            locationRestriction: {
              rectangle: {
                low: { latitude: 44.9, longitude: -79.8 },
                high: { latitude: 62.6, longitude: -57.1 },
              },
            },
          }),
        },
      );
      const json = (await res.json()) as {
        suggestions?: {
          placePrediction: { placeId: string; text: { text: string } };
        }[];
        error?: { message: string; status: string };
      };
      if (json.error !== undefined) {
        console.warn('[LocationAutocomplete] API error:', json.error.status, json.error.message);
        setPredictions([]);
        return;
      }
      const parsed: Prediction[] = (json.suggestions ?? []).map((s) => ({
        placeId: s.placePrediction.placeId,
        description: s.placePrediction.text.text,
      }));
      setPredictions(parsed.slice(0, 6));
      setShowList(parsed.length > 0);
    } catch (e) {
      console.error('[LocationAutocomplete] fetch error:', e);
      setPredictions([]);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputText(text);
      if (text.trim() === '') {
        onChange('');
        setPredictions([]);
        setShowList(false);
        return;
      }
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchPredictions(text);
      }, 300);
    },
    [fetchPredictions, onChange],
  );

  const handleSelect = useCallback(
    (description: string) => {
      setInputText(description);
      onChange(description);
      setPredictions([]);
      setShowList(false);
    },
    [onChange],
  );

  const hasError = error !== undefined && error.length > 0;

  return (
    <View style={styles.wrapper}>
      <Text variant="overline" style={styles.label}>
        {label}
      </Text>

      <View style={[styles.inputRow, hasError && styles.inputRowError]}>
        <Ionicons name="location-outline" size={18} color={colors.warm.muted} style={styles.icon} />
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7b625b"
          selectionColor={colors.burgundy.mid}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={() => setShowList(false)}
        />
        {inputText.length > 0 && (
          <TouchableOpacity onPress={() => handleSelect('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.warm.muted} />
          </TouchableOpacity>
        )}
      </View>

      {hasError && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}

      {helperText !== undefined && !hasError && (
        <Text variant="caption" style={styles.helperText}>
          {helperText}
        </Text>
      )}

      {/* Plain View — no FlatList, no VirtualizedList warning */}
      {showList && predictions.length > 0 && (
        <View style={styles.listView}>
          {predictions.map((item, index) => (
            <TouchableOpacity
              key={item.placeId}
              style={[styles.row, index > 0 && styles.rowBorder]}
              onPress={() => handleSelect(item.description)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color={colors.warm.muted} style={styles.rowIcon} />
              <Text style={styles.rowText} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
    zIndex: 10,
  },
  label: {
    marginBottom: spacing[2],
    color: '#7b625b',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7b625b',
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  inputRowError: {
    borderBottomColor: colors.error[500],
  },
  icon: {
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
    color: '#1f2937',
    fontFamily: fontFamily.sansRegular,
    padding: 0,
  },
  errorText: {
    marginTop: spacing[1],
    color: colors.error[500],
  },
  helperText: {
    marginTop: spacing[1],
    color: colors.neutral[500],
  },
  listView: {
    marginTop: spacing[1],
    backgroundColor: colors.warm.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warm.border,
    shadowColor: colors.warm.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.warm.border,
  },
  rowIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: colors.warm.body,
    fontFamily: fontFamily.sansRegular,
    lineHeight: 20,
  },
});
