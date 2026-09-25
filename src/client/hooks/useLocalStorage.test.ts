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

  // Regression: separate components calling the same hook (e.g. useGames in
  // both GameOption and Status) must not drift apart.
  it('propagates a write to another hook instance using the same key', () => {
    const writer = renderHook(() => useLocalStorage<number | null>('shared-key', null));
    const reader = renderHook(() => useLocalStorage<number | null>('shared-key', null));

    expect(reader.result.current[0]).toBeNull();

    act(() => writer.result.current[1](7));

    expect(writer.result.current[0]).toBe(7);
    expect(reader.result.current[0]).toBe(7);
  });

  it('keeps instances on different keys independent', () => {
    const a = renderHook(() => useLocalStorage('key-a', 'a'));
    const b = renderHook(() => useLocalStorage('key-b', 'b'));

    act(() => a.result.current[1]('changed'));

    expect(a.result.current[0]).toBe('changed');
    expect(b.result.current[0]).toBe('b');
  });

  it('returns a stable reference for an unchanged object value', () => {
    localStorage.setItem('stable-key', JSON.stringify({ x: 1 }));
    const { result, rerender } = renderHook(() => useLocalStorage('stable-key', { x: 0 }));

    const first = result.current[0];
    rerender();
    expect(result.current[0]).toBe(first);
  });
});
