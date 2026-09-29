// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { flushStorageWrites, useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Drain any write the previous test left pending before clearing, so no
    // pending value survives into the next test's reads.
    flushStorageWrites();
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
    flushStorageWrites();
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
  });

  // Writes are write-behind: the value has to be readable at once, because the
  // board renders from it on the same click, while the serialization is
  // deferred off the critical path.
  it('exposes a new value before it has been persisted', () => {
    const { result } = renderHook(() => useLocalStorage('deferred-key', 'old'));

    act(() => result.current[1]('fresh'));

    expect(result.current[0]).toBe('fresh');
    expect(localStorage.getItem('deferred-key')).toBeNull();

    flushStorageWrites();
    expect(localStorage.getItem('deferred-key')).toBe('"fresh"');
  });

  it('coalesces repeated writes to the same key into one store write', () => {
    const { result } = renderHook(() => useLocalStorage('busy-key', 0));

    act(() => {
      result.current[1](1);
      result.current[1](2);
      result.current[1](3);
    });

    expect(result.current[0]).toBe(3);
    flushStorageWrites();
    expect(localStorage.getItem('busy-key')).toBe('3');
  });

  // Regression: the snapshot identity has to survive the flush. If the cache
  // were seeded with a re-parsed copy, the value would change reference the
  // moment the deferred write landed and re-render every reader.
  it('keeps the same object reference across a flush', () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ a: number }>('identity-key', { a: 0 })
    );

    act(() => result.current[1]({ a: 1 }));
    const beforeFlush = result.current[0];

    flushStorageWrites();

    expect(result.current[0]).toBe(beforeFlush);
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
    flushStorageWrites();
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
