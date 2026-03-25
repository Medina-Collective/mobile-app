import { useAuthStore } from '../auth.store';
import { supabase } from '@services/supabase.client';

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: { display_name: 'Test User' },
  app_metadata: {},
  created_at: '2026-01-01',
};

const mockSession = {
  access_token: 'token-abc',
  user: mockUser,
};

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  jest.clearAllMocks();
});

describe('signIn', () => {
  it('sets user and token on success', async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });
    await useAuthStore.getState().signIn('test@example.com', 'password');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@example.com');
    expect(state.user?.displayName).toBe('Test User');
    expect(state.token).toBe('token-abc');
    expect(state.isLoading).toBe(false);
  });

  it('throws and clears isLoading on error', async () => {
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid credentials'),
    });
    await expect(useAuthStore.getState().signIn('bad@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('signUp', () => {
  it('sets user and token when session is returned immediately', async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });
    await useAuthStore.getState().signUp('test@example.com', 'password', 'Test User');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token-abc');
  });

  it('does not set user when session is null (email confirmation required)', async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });
    await useAuthStore.getState().signUp('test@example.com', 'password', 'Test User');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('throws and clears isLoading on error', async () => {
    (mockAuth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Email already registered'),
    });
    await expect(
      useAuthStore.getState().signUp('taken@example.com', 'password', 'Name'),
    ).rejects.toThrow('Email already registered');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('signOut', () => {
  it('clears user and token', async () => {
    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', displayName: 'A', role: 'user', createdAt: '' },
      token: 'tok',
      isAuthenticated: true,
    });
    (mockAuth.signOut as jest.Mock).mockResolvedValue({ error: null });
    await useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('hydrateFromStorage', () => {
  it('restores session from storage', async () => {
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });
    await useAuthStore.getState().hydrateFromStorage();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token-abc');
    expect(state.user?.email).toBe('test@example.com');
  });

  it('does nothing when no session exists', async () => {
    (mockAuth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
    await useAuthStore.getState().hydrateFromStorage();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('role mapping', () => {
  it('maps admin app_metadata role to ADMIN', async () => {
    const adminUser = { ...mockUser, app_metadata: { role: 'admin' } };
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: adminUser, session: { ...mockSession, user: adminUser } },
      error: null,
    });
    await useAuthStore.getState().signIn('admin@example.com', 'password');
    expect(useAuthStore.getState().user?.role).toBe('admin');
  });

  it('maps professional app_metadata role to PROFESSIONAL', async () => {
    const proUser = { ...mockUser, app_metadata: { role: 'professional' } };
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: proUser, session: { ...mockSession, user: proUser } },
      error: null,
    });
    await useAuthStore.getState().signIn('pro@example.com', 'password');
    expect(useAuthStore.getState().user?.role).toBe('professional');
  });

  it('falls back to email prefix when display_name is absent', async () => {
    const noNameUser = { ...mockUser, user_metadata: {} };
    (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: noNameUser, session: { ...mockSession, user: noNameUser } },
      error: null,
    });
    await useAuthStore.getState().signIn('test@example.com', 'password');
    expect(useAuthStore.getState().user?.displayName).toBe('test');
  });
});
