import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../../services/storage/localStorage';

// Mock localStorage for Node.js environment
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// @ts-ignore - mocking global localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should store and retrieve string values', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('value'));
    storage.set('key', 'value');
    expect(storage.get('key', 'default')).toBe('value');
  });

  it('should store and retrieve object values', () => {
    const obj = { name: 'test', value: 123 };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(obj));
    storage.set('key', obj);
    expect(storage.get('key', {})).toEqual(obj);
  });

  it('should store and retrieve array values', () => {
    const arr = [1, 2, 3];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(arr));
    storage.set('key', arr);
    expect(storage.get('key', [])).toEqual(arr);
  });

  it('should return default value when key does not exist', () => {
    expect(storage.get('non-existent', 'default')).toBe('default');
    expect(storage.get('non-existent', { default: true })).toEqual({ default: true });
  });

  it('should handle JSON parse errors gracefully', () => {
    // Mock getItem to return invalid JSON
    localStorageMock.getItem.mockReturnValueOnce('not-json');
    expect(storage.get('invalid', 'default')).toBe('default');
  });

  it('should remove stored values', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    storage.set('key', 'value');
    storage.remove('key');
    expect(storage.get('key', 'default')).toBe('default');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('key');
  });

  it('should clear all values', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    storage.clear();
    expect(localStorageMock.clear).toHaveBeenCalled();
  });

  it('should handle set errors gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => { throw new Error('Quota exceeded'); });

    expect(() => storage.set('key', 'value')).not.toThrow();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should handle get errors gracefully', () => {
    localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('Storage error'); });

    expect(storage.get('key', 'default')).toBe('default');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('key');
  });
});
