import { storage } from '../storage';

// jest-expo includes the AsyncStorage mock automatically via the preset.
// Each test gets a clean store via beforeEach.
beforeEach(async () => {
  await storage.clear();
});

describe('storage.setItem / getItem', () => {
  it('stores and retrieves a string', async () => {
    await storage.setItem('key', 'value');
    expect(await storage.getItem('key')).toBe('value');
  });

  it('returns null for a key that does not exist', async () => {
    expect(await storage.getItem('nonexistent')).toBeNull();
  });
});

describe('storage.removeItem', () => {
  it('removes a stored key', async () => {
    await storage.setItem('key', 'value');
    await storage.removeItem('key');
    expect(await storage.getItem('key')).toBeNull();
  });

  it('does not throw when removing a non-existent key', async () => {
    await expect(storage.removeItem('ghost')).resolves.not.toThrow();
  });
});

describe('storage.setJson / getJson', () => {
  it('stores and retrieves a plain object', async () => {
    const obj = { id: '1', name: 'Medina' };
    await storage.setJson('obj', obj);
    expect(await storage.getJson('obj')).toEqual(obj);
  });

  it('stores and retrieves an array', async () => {
    const arr = [1, 2, 3];
    await storage.setJson('arr', arr);
    expect(await storage.getJson('arr')).toEqual(arr);
  });

  it('returns null for a key that does not exist', async () => {
    expect(await storage.getJson('missing')).toBeNull();
  });
});

describe('storage.clear', () => {
  it('removes all stored keys', async () => {
    await storage.setItem('a', '1');
    await storage.setItem('b', '2');
    await storage.clear();
    expect(await storage.getItem('a')).toBeNull();
    expect(await storage.getItem('b')).toBeNull();
  });
});
