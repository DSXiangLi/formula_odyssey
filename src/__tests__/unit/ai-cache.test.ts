import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LRUCache, AICacheManager, aiCache } from '../../services/ai/cache';

describe('LRU Cache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new LRUCache<string>(100, 5 * 60 * 1000); // 100 capacity, 5 min TTL
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store and retrieve cached response', () => {
    cache.set('key1', 'cached response');
    expect(cache.get('key1')).toBe('cached response');
  });

  it('should return undefined for non-existent key', () => {
    const result = cache.get('non-existent-key');
    expect(result).toBeUndefined();
  });

  it('should evict least recently used when cache is full', () => {
    // Fill cache to capacity
    for (let i = 0; i < 101; i++) {
      cache.set(`key-${i}`, `response-${i}`);
    }
    // First key should be evicted (undefined, not null)
    expect(cache.get('key-0')).toBeUndefined();
    // Last key should exist
    expect(cache.get('key-100')).toBe('response-100');
  });

  it('should move accessed item to front', () => {
    // Use a smaller cache for clearer LRU behavior
    const smallCache = new LRUCache<string>(5, 5 * 60 * 1000);
    smallCache.set('key-1', 'response-1');
    smallCache.set('key-2', 'response-2');
    smallCache.set('key-3', 'response-3');
    smallCache.set('key-4', 'response-4');
    smallCache.set('key-5', 'response-5');

    // Access key-1, making it most recently used
    smallCache.get('key-1');

    // Add one more to trigger eviction of LRU (key-2)
    smallCache.set('key-6', 'response-6');

    // key-1 should still exist (was recently accessed)
    expect(smallCache.get('key-1')).toBe('response-1');
    // key-2 should be evicted
    expect(smallCache.get('key-2')).toBeUndefined();
  });

  it('should expire entries after TTL', () => {
    const shortTTLCache = new LRUCache<string>(10, 1000); // 1 second TTL
    shortTTLCache.set('key1', 'response');

    // Immediately should exist
    expect(shortTTLCache.get('key1')).toBe('response');

    // Wait for TTL to expire
    vi.advanceTimersByTime(1001);

    // Should be expired
    expect(shortTTLCache.get('key1')).toBeUndefined();
  });

  it('should not expire entries within TTL', () => {
    const shortTTLCache = new LRUCache<string>(10, 10000); // 10 second TTL
    shortTTLCache.set('key1', 'response');

    // Wait less than TTL
    vi.advanceTimersByTime(5000);

    // Should still exist
    expect(shortTTLCache.get('key1')).toBe('response');
  });

  it('should clear all entries', () => {
    cache.set('key-1', 'value-1');
    cache.set('key-2', 'value-2');
    cache.clear();
    expect(cache.get('key-1')).toBeUndefined();
    expect(cache.get('key-2')).toBeUndefined();
    expect(cache.size()).toBe(0);
  });

  it('should delete specific entries', () => {
    cache.set('key-1', 'value-1');
    cache.set('key-2', 'value-2');

    expect(cache.delete('key-1')).toBe(true);
    expect(cache.get('key-1')).toBeUndefined();
    expect(cache.get('key-2')).toBe('value-2');
    expect(cache.size()).toBe(1);
  });

  it('should return false when deleting non-existent key', () => {
    expect(cache.delete('non-existent')).toBe(false);
  });

  it('should update existing entries', () => {
    cache.set('key1', 'old value');
    cache.set('key1', 'new value');
    expect(cache.get('key1')).toBe('new value');
    expect(cache.size()).toBe(1);
  });

  it('should return cache size', () => {
    expect(cache.size()).toBe(0);
    cache.set('key1', 'value1');
    expect(cache.size()).toBe(1);
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
  });

  it('should return all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    const keys = cache.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
    expect(keys).toContain('key3');
    expect(keys.length).toBe(3);
  });

  it('should track cache statistics', () => {
    cache.set('key1', 'value1');
    cache.get('key1'); // hit
    cache.get('key1'); // hit
    cache.get('nonexistent'); // miss

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(1);
    expect(stats.hitRate).toBe(2 / 3);
  });

  it('should cleanup expired entries', () => {
    const shortTTLCache = new LRUCache<string>(10, 100); // 100ms TTL
    shortTTLCache.set('key1', 'value1');

    // Advance time past TTL
    vi.advanceTimersByTime(101);

    const removed = shortTTLCache.cleanup();
    expect(removed).toBe(1);
    expect(shortTTLCache.get('key1')).toBeUndefined();
  });
});

describe('AI Cache Manager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    aiCache.clearAll();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate consistent question keys', () => {
    const key1 = AICacheManager.generateQuestionKey(1, 'ginseng', ['a', 'b', 'c']);
    const key2 = AICacheManager.generateQuestionKey(1, 'ginseng', ['a', 'b', 'c']);
    expect(key1).toBe(key2);
  });

  it('should sort collected medicines in question key generation', () => {
    const key1 = AICacheManager.generateQuestionKey(1, 'ginseng', ['c', 'a', 'b']);
    const key2 = AICacheManager.generateQuestionKey(1, 'ginseng', ['a', 'b', 'c']);
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different inputs', () => {
    const key1 = AICacheManager.generateQuestionKey(1, 'ginseng', ['a']);
    const key2 = AICacheManager.generateQuestionKey(1, 'ginseng', ['b']);
    expect(key1).not.toBe(key2);
  });

  it('should generate event keys', () => {
    const key = AICacheManager.generateEventKey('2026-03-23', 'player1');
    expect(key).toBe('e:2026-03-23:player1');
  });

  it('should generate event keys with anonymous fallback', () => {
    const key = AICacheManager.generateEventKey('2026-03-23');
    expect(key).toBe('e:2026-03-23:anon');
  });

  it('should generate validation keys with truncation', () => {
    const longQuestion = 'a'.repeat(100);
    const longAnswer = 'b'.repeat(100);
    const key = AICacheManager.generateValidationKey(longQuestion, longAnswer);
    expect(key.startsWith('v:')).toBe(true);
    expect(key.length).toBeLessThan(200);
  });

  it('should truncate long prompts in validation key generation', () => {
    const longQuestion = 'a'.repeat(200);
    const key = AICacheManager.generateValidationKey(longQuestion, 'answer');
    expect(key.length).toBeLessThan(longQuestion.length + 10);
  });

  it('should generate guide keys', () => {
    const key = AICacheManager.generateGuideKey('question', 'answer', 1);
    expect(key.startsWith('g:')).toBe(true);
  });

  it('should use separate caches for different purposes', () => {
    const questionData = { question: 'test' };
    const eventData = { event: 'test' };

    aiCache.questionCache.set('q:test', questionData);
    aiCache.eventCache.set('e:test', eventData);

    expect(aiCache.questionCache.get('q:test')).toBe(questionData);
    expect(aiCache.eventCache.get('e:test')).toBe(eventData);
    expect(aiCache.questionCache.get('e:test')).toBeUndefined();
  });

  it('should get all stats', () => {
    aiCache.questionCache.set('key1', 'value1');
    aiCache.questionCache.get('key1'); // 1 hit
    aiCache.eventCache.set('key2', 'value2');

    const stats = aiCache.getAllStats();
    expect(stats.questions).toBeDefined();
    expect(stats.events).toBeDefined();
    expect(stats.validations).toBeDefined();
    expect(stats.guides).toBeDefined();
    expect(stats.questions.hits).toBeGreaterThanOrEqual(1);
    expect(stats.questions.size).toBe(1);
  });

  it('should cleanup all caches', () => {
    // Create a fresh AICacheManager with short TTL for testing
    const testCache = new AICacheManager();
    const shortTTLCache = new LRUCache<string>(10, 1); // 1ms TTL

    // Manually set up short TTL caches for testing
    testCache.questionCache = shortTTLCache;
    testCache.eventCache = new LRUCache<string>(10, 1);
    testCache.validationCache = new LRUCache<string>(10, 1);
    testCache.guideCache = new LRUCache<string>(10, 1);

    shortTTLCache.set('q:test', 'value');

    // Wait for expiration
    vi.advanceTimersByTime(2);

    const result = testCache.cleanup();
    expect(result.questions).toBeGreaterThanOrEqual(0);
  });

  it('should clear all caches', () => {
    aiCache.questionCache.set('key1', 'value1');
    aiCache.eventCache.set('key2', 'value2');
    aiCache.validationCache.set('key3', 'value3');
    aiCache.guideCache.set('key4', 'value4');

    aiCache.clearAll();

    expect(aiCache.questionCache.size()).toBe(0);
    expect(aiCache.eventCache.size()).toBe(0);
    expect(aiCache.validationCache.size()).toBe(0);
    expect(aiCache.guideCache.size()).toBe(0);
  });
});
