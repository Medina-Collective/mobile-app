import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useListProfessionals, useGetProfessional } from '../useProfessional';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useListProfessionals', () => {
  it('returns all professionals', async () => {
    const { result } = renderHook(() => useListProfessionals(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });
});

describe('useGetProfessional', () => {
  it('returns the matching professional by id', async () => {
    const { result } = renderHook(() => useGetProfessional('1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.businessName).toBe('Henna by Fatima');
  });

  it('throws an error for an unknown id', async () => {
    const { result } = renderHook(() => useGetProfessional('999'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('Professional not found'));
  });
});
