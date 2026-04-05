import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { AccountSwitcher } from '../AccountSwitcher';
import type { AccountInfo } from '../AccountSwitcher';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

// measureInWindow is a no-op in tests — mock it to immediately invoke the callback
// so the dropdown actually opens when the trigger is pressed.
beforeAll(() => {
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation((cb) => cb(0, 50, 200, 40));
});

afterAll(() => {
  jest.restoreAllMocks();
});

const personalAccount: AccountInfo = {
  id: 'user-1',
  name: 'Fatima Zahra',
  type: 'personal',
  initials: 'FZ',
};

const proAccount: AccountInfo = {
  id: 'pro-1',
  name: 'Velzera Studio',
  type: 'professional',
  initials: 'VS',
};

const proAccountWithAvatar: AccountInfo = {
  ...proAccount,
  avatarUrl: 'https://example.com/logo.png',
};

const mockSwitch = jest.fn();
const mockAddAccount = jest.fn();

beforeEach(() => {
  mockSwitch.mockClear();
  mockAddAccount.mockClear();
});

function renderSwitcher(accounts: AccountInfo[], activeAccountId: string) {
  return render(
    <AccountSwitcher
      accounts={accounts}
      activeAccountId={activeAccountId}
      onSwitch={mockSwitch}
      onAddAccount={mockAddAccount}
    />,
  );
}

describe('AccountSwitcher — trigger', () => {
  it('renders the active account name', () => {
    const { getByText } = renderSwitcher([personalAccount], 'user-1');
    expect(getByText('Fatima Zahra')).toBeTruthy();
  });

  it('falls back to "Profile" when no active account matches', () => {
    const { getByText } = renderSwitcher([personalAccount], 'unknown-id');
    expect(getByText('Profile')).toBeTruthy();
  });
});

describe('AccountSwitcher — dropdown', () => {
  it('opens the dropdown when the trigger is pressed', () => {
    const { getByText, queryByText } = renderSwitcher([personalAccount, proAccount], 'user-1');
    expect(queryByText('Add Account')).toBeNull();
    fireEvent.press(getByText('Fatima Zahra'));
    expect(getByText('Add Account')).toBeTruthy();
  });

  it('renders all accounts in the dropdown', () => {
    const { getByText, getAllByText } = renderSwitcher([personalAccount, proAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    expect(getAllByText('Fatima Zahra').length).toBeGreaterThan(0);
    expect(getByText('Velzera Studio')).toBeTruthy();
  });

  it('renders "Personal account" label for personal type', () => {
    const { getByText } = renderSwitcher([personalAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    expect(getByText('Personal account')).toBeTruthy();
  });

  it('renders "Professional account" label for professional type', () => {
    const { getByText } = renderSwitcher([proAccount], 'pro-1');
    fireEvent.press(getByText('Velzera Studio'));
    expect(getByText('Professional account')).toBeTruthy();
  });

  it('calls onSwitch with the selected account id', () => {
    const { getByText } = renderSwitcher([personalAccount, proAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    fireEvent.press(getByText('Velzera Studio'));
    expect(mockSwitch).toHaveBeenCalledWith('pro-1');
  });

  it('closes the dropdown after selecting an account', () => {
    const { getByText, queryByText } = renderSwitcher([personalAccount, proAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    fireEvent.press(getByText('Velzera Studio'));
    expect(queryByText('Add Account')).toBeNull();
  });

  it('calls onAddAccount when "Add Account" is pressed', () => {
    const { getByText } = renderSwitcher([personalAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    fireEvent.press(getByText('Add Account'));
    expect(mockAddAccount).toHaveBeenCalled();
  });

  it('closes the dropdown after pressing Add Account', () => {
    const { getByText, queryByText } = renderSwitcher([personalAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    fireEvent.press(getByText('Add Account'));
    expect(queryByText('Add Account')).toBeNull();
  });
});

describe('AccountSwitcher — avatar rendering', () => {
  it('renders initials for professional account without avatar', () => {
    const { getByText } = renderSwitcher([proAccount], 'pro-1');
    fireEvent.press(getByText('Velzera Studio'));
    expect(getByText('VS')).toBeTruthy();
  });

  it('renders without crashing when professional account has an avatarUrl', () => {
    const { getByText, toJSON } = renderSwitcher([proAccountWithAvatar], 'pro-1');
    fireEvent.press(getByText('Velzera Studio'));
    expect(toJSON()).toBeTruthy();
  });

  it('renders personal account without crash (icon variant)', () => {
    const { getByText, toJSON } = renderSwitcher([personalAccount], 'user-1');
    fireEvent.press(getByText('Fatima Zahra'));
    expect(toJSON()).toBeTruthy();
  });
});
