// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initialValue when key is not set', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists a new value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));
    act(() => result.current[1]('new-value'));
    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
  });

  it('reads an existing value from localStorage on mount', () => {
    localStorage.setItem('test-key', JSON.stringify({ x: 1 }));
    const { result } = renderHook(() => useLocalStorage('test-key', { x: 0 }));
    expect(result.current[0]).toEqual({ x: 1 });
  });

  it('returns initialValue when stored value is malformed JSON', () => {
    localStorage.setItem('test-key', 'not-valid-json{');
    const { result } = renderHook(() => useLocalStorage('test-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('accepts an updater function', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  it('stores objects correctly', () => {
    const { result } = renderHook(() => useLocalStorage<{ a: number }>('obj-key', { a: 0 }));
    act(() => result.current[1]({ a: 99 }));
    expect(result.current[0]).toEqual({ a: 99 });
    expect(JSON.parse(localStorage.getItem('obj-key')!)).toEqual({ a: 99 });
  });
});
