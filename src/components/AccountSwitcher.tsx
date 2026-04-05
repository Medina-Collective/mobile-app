import { useRef, useState } from 'react';
import { View, TouchableOpacity, Modal, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@components/ui';
import { colors } from '@theme/colors';
import { fontFamily, fontSize } from '@theme/typography';
import { spacing } from '@theme/spacing';

export interface AccountInfo {
  id: string;
  name: string;
  type: 'personal' | 'professional';
  initials: string;
  avatarUrl?: string;
}

interface AccountSwitcherProps {
  accounts: AccountInfo[];
  activeAccountId: string;
  onSwitch: (id: string) => void;
  onAddAccount?: () => void;
}

export function AccountSwitcher({
  accounts,
  activeAccountId,
  onSwitch,
  onAddAccount,
}: Readonly<AccountSwitcherProps>) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<View>(null);

  const active = accounts.find((a) => a.id === activeAccountId);

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, _w, h) => {
      setDropdownPos({ top: y + h + 8, left: x });
      setOpen(true);
    });
  };

  return (
    <>
      {/* Trigger */}
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity onPress={handleOpen} style={styles.trigger} activeOpacity={0.8}>
          <Text style={styles.triggerName}>{active?.name ?? 'Profile'}</Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.warm.muted}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown via Modal so it floats above everything */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { top: dropdownPos.top, left: dropdownPos.left }]}>
            {/* Account rows */}
            <View style={styles.accountList}>
              {accounts.map((account) => {
                const isActive = account.id === activeAccountId;
                return (
                  <TouchableOpacity
                    key={account.id}
                    style={[styles.accountRow, isActive && styles.accountRowActive]}
                    onPress={() => {
                      onSwitch(account.id);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    {/* Avatar */}
                    {account.avatarUrl !== undefined ? (
                      <Image
                        source={{ uri: account.avatarUrl }}
                        style={[
                          styles.avatar,
                          account.type === 'professional'
                            ? styles.avatarProShape
                            : styles.avatarPersonalShape,
                        ]}
                      />
                    ) : account.type === 'professional' ? (
                      <View style={[styles.avatar, styles.avatarProBg]}>
                        <Text style={styles.avatarInitials}>{account.initials}</Text>
                      </View>
                    ) : (
                      <View style={[styles.avatar, styles.avatarPersonalBg]}>
                        <Ionicons name="person" size={18} color={colors.burgundy.deep} />
                      </View>
                    )}

                    {/* Info */}
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName} numberOfLines={1}>
                        {account.name}
                      </Text>
                      <Text style={styles.accountType}>
                        {account.type === 'professional' ? 'Professional' : 'Personal'} account
                      </Text>
                    </View>

                    {isActive && (
                      <Ionicons name="checkmark" size={16} color={colors.burgundy.deep} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Add Account */}
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.addRow}
              onPress={() => {
                onAddAccount?.();
                setOpen(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.addCircle}>
                <Ionicons name="add" size={16} color={colors.warm.muted} />
              </View>
              <Text style={styles.addText}>Add Account</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  triggerName: {
    fontFamily: fontFamily.serifBold,
    fontSize: 28,
    color: colors.warm.title,
    letterSpacing: 0.2,
  },
  chevron: {
    marginTop: 6,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  dropdown: {
    position: 'absolute',
    width: 264,
    backgroundColor: colors.warm.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warm.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },

  accountList: {
    padding: spacing[2],
    gap: spacing[1],
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 14,
  },
  accountRowActive: {
    backgroundColor: colors.warm.chip,
  },

  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarProShape: { borderRadius: 10 },
  avatarPersonalShape: { borderRadius: 20 },
  avatarProBg: {
    borderRadius: 10,
    backgroundColor: colors.burgundy.deep,
  },
  avatarPersonalBg: {
    borderRadius: 20,
    backgroundColor: 'rgba(47,10,10,0.07)',
  },
  avatarInitials: {
    fontFamily: fontFamily.serifBold,
    fontSize: fontSize.xs,
    color: '#EDE4D8',
    letterSpacing: 1,
  },

  accountInfo: { flex: 1, minWidth: 0 },
  accountName: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: fontSize.sm,
    color: colors.warm.title,
  },
  accountType: {
    fontFamily: fontFamily.sansRegular,
    fontSize: fontSize.xs,
    color: colors.warm.muted,
    marginTop: 2,
    textTransform: 'capitalize',
  },

  divider: { height: 1, backgroundColor: colors.warm.border },

  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    margin: spacing[2],
    borderRadius: 14,
  },
  addCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.warm.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: fontSize.sm,
    color: colors.warm.muted,
  },
});
