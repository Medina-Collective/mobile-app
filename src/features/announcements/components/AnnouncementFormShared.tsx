/**
 * Shared UI sub-components used by both the Create and Edit announcement screens.
 * Extracted here to eliminate copy-paste duplication.
 */
// Styles are exported and consumed by create.tsx and edit.tsx — lint checks within-file only.
/* eslint-disable react-native/no-unused-styles */
import { useState } from 'react';
import { View, Switch, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { fontFamily } from '@theme/typography';
import { ANNOUNCEMENT_CATEGORIES } from '@features/announcements/schemas/announcement.schema';

// ── Section Bar ───────────────────────────────────────────────────────────────

export function SectionBar({ label }: Readonly<{ label: string }>) {
  return (
    <View style={sectionBarStyles.row}>
      <View style={sectionBarStyles.line} />
      <Text style={sectionBarStyles.label}>{label}</Text>
    </View>
  );
}

export const sectionBarStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] },
  line: { width: 3, height: 16, backgroundColor: colors.burgundy.mid, borderRadius: 2 },
  label: { fontSize: 16, fontWeight: '700', color: colors.warm.title },
});

// ── Category Picker ───────────────────────────────────────────────────────────

export function CategoryPicker({
  value,
  onChange,
  error,
}: Readonly<{
  value: string | undefined;
  onChange: (v: string) => void;
  error?: string | undefined;
}>) {
  const [open, setOpen] = useState(false);
  const hasError = error !== undefined && error.length > 0;

  return (
    <View style={cpStyles.wrapper}>
      <Text style={cpStyles.label}>Category</Text>
      <TouchableOpacity
        style={[cpStyles.trigger, hasError && cpStyles.triggerError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[cpStyles.triggerText, !value && cpStyles.placeholder]}>
          {value ?? 'Select a category'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.warm.muted} />
      </TouchableOpacity>
      {hasError && <Text style={cpStyles.errorText}>{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={cpStyles.overlay}>
          <View style={cpStyles.sheet}>
            <View style={cpStyles.sheetHeader}>
              <Text style={cpStyles.sheetTitle}>Select a Category</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.warm.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ANNOUNCEMENT_CATEGORIES as unknown as string[]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[cpStyles.option, value === item && cpStyles.optionActive]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[cpStyles.optionText, value === item && cpStyles.optionTextActive]}>
                    {item}
                  </Text>
                  {value === item && (
                    <Ionicons name="checkmark" size={16} color={colors.burgundy.mid} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const cpStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing[4] },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.warm.muted,
    marginBottom: spacing[2],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    paddingHorizontal: spacing[3],
  },
  triggerError: { borderColor: colors.error[500] },
  triggerText: { fontSize: 15, color: colors.warm.body, fontFamily: fontFamily.sansRegular },
  placeholder: { color: colors.warm.muted },
  errorText: { fontSize: 11, color: colors.error[500], marginTop: spacing[1] },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing[8],
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: colors.warm.title },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.warm.border,
  },
  optionActive: { backgroundColor: 'rgba(68, 0, 7, 0.04)' },
  optionText: { fontSize: 15, color: colors.warm.body, fontFamily: fontFamily.sansRegular },
  optionTextActive: { color: colors.burgundy.mid, fontWeight: '600' },
});

// ── Toggle Row ────────────────────────────────────────────────────────────────

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: Readonly<{ label: string; hint: string; value: boolean; onChange: (v: boolean) => void }>) {
  return (
    <View style={toggleStyles.row}>
      <View style={toggleStyles.info}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.hint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#78716c', true: colors.burgundy.mid }}
        ios_backgroundColor="#78716c"
        thumbColor={colors.warm.elevated}
      />
    </View>
  );
}

export const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warm.surface,
    borderWidth: 1,
    borderColor: colors.warm.border,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  info: { flex: 1, gap: spacing[1] },
  label: { fontSize: 14, fontWeight: '600', color: colors.warm.title },
  hint: { fontSize: 11, color: colors.warm.muted },
});

// ── Shared styles (field label, nav bar, etc.) ────────────────────────────────

export const sharedFormStyles = StyleSheet.create({
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.warm.muted,
    marginBottom: spacing[2],
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.warm.title,
  },
  navSpacer: { width: 40 },
  scroll: { paddingBottom: spacing[4] },
  section: { marginBottom: spacing[5] },
  typeGrid: { flexDirection: 'row', gap: spacing[2] },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    gap: spacing[1],
  },
  typeCardActive: { borderColor: colors.burgundy.mid, backgroundColor: 'rgba(68, 0, 7, 0.05)' },
  typeIcon: { marginBottom: spacing[1] },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warm.title,
    textAlign: 'center',
    lineHeight: 14,
  },
  typeLabelActive: { color: colors.burgundy.mid },
  typeDesc: {
    fontSize: 9,
    color: colors.warm.muted,
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 2,
  },
  imageContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden', height: 176 },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePicker: {
    height: 144,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.warm.border,
    backgroundColor: colors.warm.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  imagePickerText: { fontSize: 12, color: colors.warm.muted, fontWeight: '500' },
  multiline: { height: 100, textAlignVertical: 'top', paddingTop: spacing[2] },
  charCount: { fontSize: 10, color: colors.warm.muted, textAlign: 'right', marginTop: spacing[1] },
  visibilityHint: {
    fontSize: 12,
    color: colors.warm.muted,
    lineHeight: 18,
    marginBottom: spacing[4],
  },
  stickyBar: {
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.warm.border,
    backgroundColor: colors.warm.elevated,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[4] },
  mutedText: { fontSize: 15, color: colors.warm.muted, textAlign: 'center' },
});
