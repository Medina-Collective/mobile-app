import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useListProfessionals, useGetProfessional } from '../useProfessional';
import { supabase } from '@services/supabase.client';

const mockFrom = supabase.from as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockRow = {
  id: '1',
  business_name: 'Henna by Fatima',
  profile_type: 'service',
  category: 'Beauty',
  subcategories: ['Henna'],
  service_types: ['at_home'],
  based_in: 'Montreal',
  serves_areas: ['Montreal'],
  description: 'Henna artist',
  inquiry_email: 'hello@henna.com',
  instagram: null,
  phone: null,
  website: null,
  booking_link: null,
  price_range: null,
  starting_price: null,
  logo_uri: null,
  status: 'approved',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  user_id: 'user-1',
};

beforeEach(() => {
  mockFrom.mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockRow, error: null }),
  });
});

describe('useListProfessionals', () => {
  it('returns professionals from Supabase on success', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: [mockRow], error: null }),
    });
    const { result } = renderHook(() => useListProfessionals(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.businessName).toBe('Henna by Fatima');
  });

  it('sets isError when Supabase returns an error', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });
    const { result } = renderHook(() => useListProfessionals(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useGetProfessional', () => {
  it('returns the professional by id', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockRow, error: null }),
    });
    const { result } = renderHook(() => useGetProfessional('1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.businessName).toBe('Henna by Fatima');
  });

  it('sets isError when professional is not found', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    });
    const { result } = renderHook(() => useGetProfessional('999'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
