import { useState, useCallback } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { format, addDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCENT = colors.burgundy.mid;
const ACCENT_LIGHT = 'rgba(68, 0, 7, 0.15)';

type MarkedDates = Record<string, {
  startingDay?: boolean;
  endingDay?: boolean;
  color?: string;
  textColor?: string;
  selected?: boolean;
  selectedColor?: string;
}>;

function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function buildMarkedDates(staged: Date, rangeStart?: Date): MarkedDates {
  const endStr = toDateStr(staged);

  if (rangeStart === undefined) {
    return {
      [endStr]: { startingDay: true, endingDay: true, color: ACCENT, textColor: '#ffffff' },
    };
  }

  const startStr = toDateStr(rangeStart);
  const marks: MarkedDates = {};

  if (startStr === endStr) {
    marks[startStr] = { startingDay: true, endingDay: true, color: ACCENT, textColor: '#ffffff' };
    return marks;
  }

  // If end is before start, just mark end alone
  if (staged < rangeStart) {
    marks[endStr] = { startingDay: true, endingDay: true, color: ACCENT, textColor: '#ffffff' };
    return marks;
  }

  marks[startStr] = { startingDay: true, color: ACCENT, textColor: '#ffffff' };
  marks[endStr] = { endingDay: true, color: ACCENT, textColor: '#ffffff' };

  // Fill intermediate days
  let cur = addDays(rangeStart, 1);
  while (toDateStr(cur) < endStr) {
    marks[toDateStr(cur)] = { color: ACCENT_LIGHT, textColor: ACCENT };
    cur = addDays(cur, 1);
  }

  return marks;
}

// ── Calendar theme ─────────────────────────────────────────────────────────────

const CALENDAR_THEME = {
  calendarBackground: 'transparent',
  backgroundColor: 'transparent',
  monthTextColor: '#2F0A0A',
  arrowColor: ACCENT,
  todayTextColor: ACCENT,
  dayTextColor: '#1f2937',
  textDisabledColor: '#c9bfb5',
  selectedDayBackgroundColor: ACCENT,
  selectedDayTextColor: '#ffffff',
  textMonthFontWeight: '700' as const,
  textDayFontSize: 14,
  textMonthFontSize: 15,
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface DatePickerProps {
  label?: string | undefined;
  value: Date | undefined;
  onChange: (date: Date) => void;
  minimumDate?: Date | undefined;
  maximumDate?: Date | undefined;
  /** When set, dates between rangeStart and the selected date are highlighted */
  rangeStart?: Date | undefined;
  error?: string | undefined;
  helperText?: string | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  rangeStart,
  error,
  helperText,
  placeholder = 'Select a date',
  disabled = false,
}: Readonly<DatePickerProps>) {
  const [showPicker, setShowPicker] = useState(false);
  const [stagingDate, setStagingDate] = useState<Date>(value ?? new Date());

  const displayValue = value === undefined ? undefined : format(value, 'MMM d, yyyy');
  const hasError = error !== undefined && error.length > 0;

  const markedDates = buildMarkedDates(stagingDate, rangeStart);

  const handleOpen = useCallback(() => {
    setStagingDate(value ?? new Date());
    setShowPicker(true);
  }, [value]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      // Parse from dateString to avoid UTC timezone shift
      const parts = day.dateString.split('-').map(Number);
      const selected = new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1);
      // Preserve existing time component if any
      if (value !== undefined) {
        selected.setHours(value.getHours(), value.getMinutes(), value.getSeconds());
      }
      setStagingDate(selected);
    },
    [value],
  );

  const handleConfirm = useCallback(() => {
    onChange(stagingDate);
    setShowPicker(false);
  }, [onChange, stagingDate]);

  return (
    <View style={styles.wrapper}>
      {label !== undefined && (
        <Text variant="overline" style={styles.label}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, hasError && styles.buttonError, disabled && styles.buttonDisabled]}
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        <Text
          variant="body"
          style={[
            styles.valueText,
            displayValue === undefined && styles.placeholder,
            disabled && styles.valueTextDisabled,
          ]}
        >
          {displayValue ?? placeholder}
        </Text>
        <Ionicons
          name={disabled ? 'lock-closed-outline' : 'calendar-outline'}
          size={18}
          color={disabled ? colors.warm.border : colors.warm.muted}
        />
      </TouchableOpacity>

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

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              {label !== undefined && <Text variant="heading3">{label}</Text>}
            </View>

            <Calendar
              current={toDateStr(stagingDate)}
              onDayPress={handleDayPress}
              markedDates={markedDates}
              markingType="period"
              {...(minimumDate !== undefined && { minDate: toDateStr(minimumDate) })}
              {...(maximumDate !== undefined && { maxDate: toDateStr(maximumDate) })}
              theme={CALENDAR_THEME}
              style={styles.calendar}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setShowPicker(false)}
                style={styles.cancelBtn}
              />
              <Button
                title="Confirm"
                variant="solid"
                onPress={handleConfirm}
                style={styles.confirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
    color: '#7b625b',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#7b625b',
    paddingVertical: spacing[2],
  },
  buttonError: {
    borderBottomColor: colors.error[500],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueText: {
    fontSize: 16,
    color: '#1f2937',
  },
  valueTextDisabled: {
    color: colors.warm.muted,
  },
  placeholder: {
    color: '#7b625b',
  },
  errorText: {
    marginTop: spacing[1],
    color: colors.error[500],
  },
  helperText: {
    marginTop: spacing[1],
    color: colors.neutral[500],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
    paddingTop: spacing[4],
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  calendar: {
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 1,
  },
});
