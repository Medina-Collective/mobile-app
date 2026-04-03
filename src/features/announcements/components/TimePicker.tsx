import { useState, useCallback } from 'react';
import { View, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

interface TimePickerProps {
  label?: string | undefined;
  value: Date | undefined;
  onChange: (date: Date) => void;
  error?: string | undefined;
  helperText?: string | undefined;
  placeholder?: string | undefined;
}

export function TimePicker({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder = 'Select a time',
}: Readonly<TimePickerProps>) {
  const [showPicker, setShowPicker] = useState(false);
  const [stagingDate, setStagingDate] = useState<Date>(value ?? new Date());

  const displayValue = value === undefined ? undefined : format(value, 'h:mm a');
  const hasError = error !== undefined && error.length > 0;

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      setShowPicker(false);
      if (event.type === 'set' && selected !== undefined) {
        onChange(selected);
      }
    },
    [onChange],
  );

  const handleIOSStagingChange = useCallback((_event: DateTimePickerEvent, selected?: Date) => {
    if (selected !== undefined) {
      setStagingDate(selected);
    }
  }, []);

  const handleIOSConfirm = useCallback(() => {
    onChange(stagingDate);
    setShowPicker(false);
  }, [onChange, stagingDate]);

  const handleOpen = useCallback(() => {
    setStagingDate(value ?? new Date());
    setShowPicker(true);
  }, [value]);

  return (
    <View style={styles.wrapper}>
      {label !== undefined && (
        <Text variant="overline" style={styles.label}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, hasError && styles.buttonError]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text
          variant="body"
          style={[styles.valueText, displayValue === undefined && styles.placeholder]}
        >
          {displayValue ?? placeholder}
        </Text>
        <Ionicons name="time-outline" size={18} color={colors.warm.muted} />
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

      {/* Android: opens inline spinner */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="time"
          display="spinner"
          onChange={handleAndroidChange}
          is24Hour={false}
        />
      )}

      {/* iOS: opens in a bottom sheet with spinner + confirm */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text variant="heading3">{label}</Text>
              </View>
              <DateTimePicker
                value={stagingDate}
                mode="time"
                display="spinner"
                onChange={handleIOSStagingChange}
                is24Hour={false}
                textColor="#1a1212"
                style={styles.iosPicker}
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
                  onPress={handleIOSConfirm}
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  valueText: {
    fontSize: 16,
    color: '#1f2937',
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
  // iOS modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    paddingTop: spacing[4],
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  iosPicker: {
    height: 200,
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
