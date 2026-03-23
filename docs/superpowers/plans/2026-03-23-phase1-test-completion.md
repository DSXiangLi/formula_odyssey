# Phase 1 测试补全计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 补全Phase 1缺失的测试覆盖，确保AI缓存、Storage、路由、Store持久化等核心功能被完整验证

**Architecture:** 采用TDD方式，为每个未覆盖模块编写单元测试和集成测试，使用Vitest + Testing Library，确保测试间隔离

**Tech Stack:** Vitest, Testing Library React, jsdom, React Router Testing

---

## 当前测试缺口分析

| 模块 | 当前测试 | 需要补充 | 优先级 |
|-----|---------|---------|-------|
| AI缓存服务 | ❌ 0 | LRU淘汰、TTL过期、缓存key生成 | 🔴 高 |
| Storage服务 | ❌ 0 | localStorage操作、错误处理 | 🔴 高 |
| Store持久化 | ❌ 0 | 持久化/恢复、数据迁移 | 🔴 高 |
| 路由系统 | ❌ 0 | 路由跳转、参数传递 | 🟡 中 |
| Store集成 | ❌ 0 | store间协作、状态一致性 | 🟡 中 |
| 数据完整性 | ❌ 0 | 20章数据符合类型定义 | 🟡 中 |

---

## Task 1: AI缓存服务测试

**Files:**
- Create: `src/__tests__/unit/ai-cache.test.ts`

---

### Step 1.1: 编写LRU缓存淘汰测试

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiCache } from '../../services/ai/cacheService';

describe('AI Cache Service - LRU', () => {
  beforeEach(() => {
    aiCache.clear();
  });

  it('should store and retrieve cached response', () => {
    const key = aiCache.generateKey('test prompt', { chapter: 1 });
    aiCache.set(key, 'cached response');
    expect(aiCache.get(key)).toBe('cached response');
  });

  it('should return null for non-existent key', () => {
    const result = aiCache.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('should evict least recently used when cache is full', () => {
    // Assuming cache size is 100, fill it up
    for (let i = 0; i < 101; i++) {
      aiCache.set(`key-${i}`, `response-${i}`);
    }
    // First key should be evicted
    expect(aiCache.get('key-0')).toBeNull();
    // Last key should exist
    expect(aiCache.get('key-100')).toBe('response-100');
  });

  it('should move accessed item to front (most recently used)', () => {
    aiCache.set('key-1', 'response-1');
    aiCache.set('key-2', 'response-2');
    // Access key-1, making it most recently used
    aiCache.get('key-1');
    // Fill cache to eviction
    for (let i = 3; i < 103; i++) {
      aiCache.set(`key-${i}`, `response-${i}`);
    }
    // key-1 should still exist (was recently accessed)
    expect(aiCache.get('key-1')).toBe('response-1');
    // key-2 should be evicted
    expect(aiCache.get('key-2')).toBeNull();
  });
});
```

---

### Step 1.2: 编写TTL过期测试

```typescript
  it('should expire entries after TTL (7 days)', () => {
    const key = aiCache.generateKey('test', {});
    aiCache.set(key, 'response');

    // Simulate 8 days passing
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    vi.spyOn(Date, 'now').mockReturnValue(eightDaysAgo);

    expect(aiCache.get(key)).toBeNull();
    vi.restoreAllMocks();
  });

  it('should not expire entries within TTL', () => {
    const key = aiCache.generateKey('test', {});
    aiCache.set(key, 'response');

    // Simulate 6 days passing (within 7 day TTL)
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    vi.spyOn(Date, 'now').mockReturnValue(sixDaysAgo);

    expect(aiCache.get(key)).toBe('response');
    vi.restoreAllMocks();
  });
```

---

### Step 1.3: 编写缓存Key生成测试

```typescript
  it('should generate consistent keys for same inputs', () => {
    const key1 = aiCache.generateKey('prompt', { a: 1, b: 2 });
    const key2 = aiCache.generateKey('prompt', { a: 1, b: 2 });
    expect(key1).toBe(key2);
  });

  it('should generate different keys for different prompts', () => {
    const key1 = aiCache.generateKey('prompt1', {});
    const key2 = aiCache.generateKey('prompt2', {});
    expect(key1).not.toBe(key2);
  });

  it('should truncate long prompts in key generation', () => {
    const longPrompt = 'a'.repeat(200);
    const key = aiCache.generateKey(longPrompt, {});
    expect(key.length).toBeLessThan(longPrompt.length + 10);
  });
```

---

### Step 1.4: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/unit/ai-cache.test.ts
# Expected: All tests PASS
git add src/__tests__/unit/ai-cache.test.ts
git commit -m "test(ai): add LRU cache and TTL tests"
```

---

## Task 2: Storage服务测试

**Files:**
- Create: `src/__tests__/unit/storage.test.ts`

---

### Step 2.1: 编写基本存储操作测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../../services/storage/localStorage';

describe('Storage Service', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('should store and retrieve string values', () => {
    storage.set('key', 'value');
    expect(storage.get('key', 'default')).toBe('value');
  });

  it('should store and retrieve object values', () => {
    const obj = { name: 'test', value: 123 };
    storage.set('key', obj);
    expect(storage.get('key', {})).toEqual(obj);
  });

  it('should store and retrieve array values', () => {
    const arr = [1, 2, 3];
    storage.set('key', arr);
    expect(storage.get('key', [])).toEqual(arr);
  });

  it('should return default value when key does not exist', () => {
    expect(storage.get('non-existent', 'default')).toBe('default');
    expect(storage.get('non-existent', { default: true })).toEqual({ default: true });
  });

  it('should return default value when storage throws error', () => {
    // Simulate quota exceeded or other error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => { throw new Error('Quota exceeded'); });

    storage.set('key', 'value');
    // Should not throw, gracefully handle error
    expect(() => storage.set('key', 'value')).not.toThrow();

    localStorage.setItem = originalSetItem;
  });
```

---

### Step 2.2: 编写删除操作测试

```typescript
  it('should remove stored values', () => {
    storage.set('key', 'value');
    storage.remove('key');
    expect(storage.get('key', 'default')).toBe('default');
  });

  it('should clear all values', () => {
    storage.set('key1', 'value1');
    storage.set('key2', 'value2');
    storage.clear();
    expect(storage.get('key1', 'default')).toBe('default');
    expect(storage.get('key2', 'default')).toBe('default');
  });

  it('should handle remove errors gracefully', () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn(() => { throw new Error('Storage error'); });

    expect(() => storage.remove('key')).not.toThrow();

    localStorage.removeItem = originalRemoveItem;
  });
```

---

### Step 2.3: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/unit/storage.test.ts
# Expected: All tests PASS
git add src/__tests__/unit/storage.test.ts
git commit -m "test(storage): add localStorage wrapper tests"
```

---

## Task 3: Store持久化测试

**Files:**
- Create: `src/__tests__/integration/store-persistence.test.ts`

---

### Step 3.1: 编写PlayerStore持久化测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { storage } from '../../services/storage/localStorage';

describe('PlayerStore Persistence', () => {
  beforeEach(() => {
    // Clear storage and reset store
    storage.clear();
    usePlayerStore.setState({
      ...usePlayerStore.getState(),
      name: '学徒',
      level: 1,
      experience: 0,
      currency: 100,
      unlockedChapters: ['chapter-1'],
      completedChapters: [],
      collectedMedicines: [],
    });
  });

  it('should persist player data to localStorage', () => {
    const { setName, addCurrency } = usePlayerStore.getState();

    setName('TestPlayer');
    addCurrency(50);

    // Simulate reload by checking storage
    const stored = storage.get('yaoling-player-storage', null);
    expect(stored).not.toBeNull();
    expect(stored.state.name).toBe('TestPlayer');
    expect(stored.state.currency).toBe(150);
  });

  it('should restore player data from localStorage', () => {
    // Pre-populate storage
    storage.set('yaoling-player-storage', {
      state: {
        name: 'RestoredPlayer',
        level: 5,
        currency: 500,
        unlockedChapters: ['chapter-1', 'chapter-2'],
      },
      version: 0,
    });

    // Store should restore on init
    const state = usePlayerStore.getState();
    expect(state.name).toBe('RestoredPlayer');
    expect(state.level).toBe(5);
    expect(state.currency).toBe(500);
  });

  it('should handle corrupted storage gracefully', () => {
    storage.set('yaoling-player-storage', 'invalid-json');

    // Should not throw, use defaults
    const state = usePlayerStore.getState();
    expect(state.name).toBe('学徒');
    expect(state.level).toBe(1);
  });
```

---

### Step 3.2: 编写ChapterStore持久化测试

```typescript
import { useChapterStore } from '../../stores/chapterStore';

describe('ChapterStore Persistence', () => {
  beforeEach(() => {
    storage.clear();
    useChapterStore.setState({
      progress: {},
      currentChapterId: null,
      currentStageIndex: 0,
    });
  });

  it('should persist chapter progress', () => {
    const { setCurrentChapter, completeStage } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    completeStage('chapter-1', 'c1-intro');

    const stored = storage.get('yaoling-chapter-storage', null);
    expect(stored).not.toBeNull();
    expect(stored.state.progress['chapter-1']).toBeDefined();
    expect(stored.state.progress['chapter-1'].completedStages).toContain('c1-intro');
  });

  it('should restore chapter progress from storage', () => {
    storage.set('yaoling-chapter-storage', {
      state: {
        progress: {
          'chapter-1': {
            chapterId: 'chapter-1',
            currentStage: 2,
            completedStages: ['c1-intro', 'c1-gathering'],
            collectedMedicines: ['麻黄'],
            battleScore: 100,
            clinicalScore: 80,
          },
        },
        currentChapterId: 'chapter-1',
        currentStageIndex: 2,
      },
      version: 0,
    });

    const { getChapterProgress, currentStageIndex } = useChapterStore.getState();
    const progress = getChapterProgress('chapter-1');

    expect(progress?.completedStages).toContain('c1-intro');
    expect(progress?.completedStages).toContain('c1-gathering');
    expect(currentStageIndex).toBe(2);
  });
```

---

### Step 3.3: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/integration/store-persistence.test.ts
# Expected: All tests PASS
git add src/__tests__/integration/store-persistence.test.ts
git commit -m "test(stores): add persistence and restore tests"
```

---

## Task 4: Store集成测试

**Files:**
- Create: `src/__tests__/integration/store-integration.test.ts`

---

### Step 4.1: 编写跨Store协作测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset both stores
    usePlayerStore.setState({
      unlockedChapters: ['chapter-1'],
      completedChapters: [],
      collectedMedicines: [],
    });
    useChapterStore.setState({
      progress: {},
      currentChapterId: null,
      currentStageIndex: 0,
    });
  });

  it('should sync medicine collection across stores', () => {
    const { collectMedicine } = usePlayerStore.getState();
    const { setCurrentChapter, collectMedicineInChapter } = useChapterStore.getState();

    setCurrentChapter('chapter-1');

    // Collect in chapter
    collectMedicineInChapter('chapter-1', '麻黄');
    // Also collect in player
    collectMedicine('麻黄');

    // Verify both stores have the data
    const playerState = usePlayerStore.getState();
    const chapterProgress = useChapterStore.getState().getChapterProgress('chapter-1');

    expect(playerState.collectedMedicines).toContain('麻黄');
    expect(chapterProgress?.collectedMedicines).toContain('麻黄');
  });

  it('should unlock next chapter when current is completed', () => {
    const { completeChapter, unlockChapter } = usePlayerStore.getState();
    const { setCurrentChapter, completeStage } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    completeStage('chapter-1', 'c1-mastery');
    completeChapter('chapter-1');
    unlockChapter('chapter-2');

    const playerState = usePlayerStore.getState();
    expect(playerState.completedChapters).toContain('chapter-1');
    expect(playerState.unlockedChapters).toContain('chapter-2');
  });

  it('should maintain state consistency across operations', () => {
    const { addExperience, addCurrency } = usePlayerStore.getState();
    const { setCurrentChapter, setCurrentStage, completeStage } = useChapterStore.getState();

    // Perform multiple operations
    setCurrentChapter('chapter-1');
    addExperience(500);
    addCurrency(-20);
    setCurrentStage(1);
    completeStage('chapter-1', 'c1-intro');
    addExperience(600); // Should level up

    // Verify final state
    const playerState = usePlayerStore.getState();
    const chapterState = useChapterStore.getState();

    expect(playerState.experience).toBe(1100);
    expect(playerState.level).toBe(2);
    expect(playerState.currency).toBe(80);
    expect(chapterState.currentChapterId).toBe('chapter-1');
    expect(chapterState.currentStageIndex).toBe(1);
    expect(chapterState.progress['chapter-1']?.completedStages).toContain('c1-intro');
  });
```

---

### Step 4.2: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/integration/store-integration.test.ts
# Expected: All tests PASS
git add src/__tests__/integration/store-integration.test.ts
git commit -m "test(stores): add cross-store integration tests"
```

---

## Task 5: 数据完整性测试

**Files:**
- Create: `src/__tests__/unit/data-integrity.test.ts`

---

### Step 5.1: 编写章节数据验证测试

```typescript
import { describe, it, expect } from 'vitest';
import { chapters } from '../../data/chapters';
import { validateChapter } from '../../utils/validators';
import { WuxingType } from '../../types';

describe('Data Integrity', () => {
  it('should have exactly 20 chapters', () => {
    expect(chapters.length).toBe(20);
  });

  it('should have unique chapter numbers 1-20', () => {
    const numbers = chapters.map(c => c.chapterNumber);
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(20);

    for (let i = 1; i <= 20; i++) {
      expect(numbers).toContain(i);
    }
  });

  it('should have valid wuxing types', () => {
    const validWuxing = Object.values(WuxingType);
    chapters.forEach(chapter => {
      expect(validWuxing).toContain(chapter.wuxing);
    });
  });

  it('should have exactly 6 stages per chapter', () => {
    chapters.forEach(chapter => {
      expect(chapter.stages.length).toBe(6);
    });
  });

  it('should pass Zod schema validation', () => {
    chapters.forEach(chapter => {
      const result = validateChapter(chapter);
      if (!result.success) {
        console.error('Validation failed for chapter:', chapter.id, result.error);
      }
      expect(result.success).toBe(true);
    });
  });

  it('should have valid stage types', () => {
    const validStageTypes = ['intro', 'gathering', 'battle', 'formula', 'clinical', 'mastery'];
    chapters.forEach(chapter => {
      chapter.stages.forEach(stage => {
        expect(validStageTypes).toContain(stage.type);
      });
    });
  });

  it('should have chapter 1 unlocked and others locked', () => {
    chapters.forEach(chapter => {
      if (chapter.chapterNumber === 1) {
        expect(chapter.isUnlocked).toBe(true);
      } else {
        expect(chapter.isUnlocked).toBe(false);
      }
    });
  });

  it('should have unlockRequirements for chapters > 1', () => {
    chapters.slice(1).forEach(chapter => {
      expect(chapter.unlockRequirements.length).toBeGreaterThan(0);
    });
  });

  it('should have medicines and formulas arrays', () => {
    chapters.forEach(chapter => {
      expect(Array.isArray(chapter.medicines)).toBe(true);
      expect(Array.isArray(chapter.formulas)).toBe(true);
    });
  });
```

---

### Step 5.2: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/unit/data-integrity.test.ts
# Expected: All tests PASS
git add src/__tests__/unit/data-integrity.test.ts
git commit -m "test(data): add chapter data integrity tests"
```

---

## Task 6: 路由测试

**Files:**
- Create: `src/__tests__/integration/routing.test.tsx`

---

### Step 6.1: 编写路由测试

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChapterSelect } from '../../pages/ChapterSelect';

// Mock component for chapter entry
const MockChapterEntry = () => <div data-testid="chapter-entry">Chapter Entry</div>;

describe('Routing', () => {
  it('should render ChapterSelect on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ChapterSelect />} />
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/药灵山谷/)).toBeInTheDocument();
  });

  it('should render ChapterEntry on /chapter/:id path', () => {
    render(
      <MemoryRouter initialEntries={['/chapter/chapter-1']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-entry')).toBeInTheDocument();
  });

  it('should pass chapterId parameter correctly', () => {
    const ChapterWithId = () => {
      const { useParams } = require('react-router-dom');
      const { chapterId } = useParams();
      return <div data-testid="chapter-id">{chapterId}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/chapter/chapter-5']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<ChapterWithId />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-id')).toHaveTextContent('chapter-5');
  });
```

---

### Step 6.2: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/integration/routing.test.tsx
# Expected: All tests PASS
git add src/__tests__/integration/routing.test.tsx
git commit -m "test(routing): add react-router integration tests"
```

---

## Task 7: Store边界条件测试

**Files:**
- Create: `src/__tests__/unit/store-edge-cases.test.ts`

---

### Step 7.1: 编写边界条件测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';

describe('Store Edge Cases', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      name: '学徒',
      level: 1,
      experience: 0,
      currency: 100,
      unlockedChapters: ['chapter-1'],
      completedChapters: [],
      collectedMedicines: [],
    });
  });

  it('should not allow negative currency', () => {
    const { addCurrency } = usePlayerStore.getState();
    addCurrency(-150);

    const state = usePlayerStore.getState();
    expect(state.currency).toBe(0);
  });

  it('should handle level up correctly', () => {
    const { addExperience } = usePlayerStore.getState();

    // Add exactly 1000 exp (should level up to 2)
    addExperience(1000);
    const state1 = usePlayerStore.getState();
    expect(state1.level).toBe(2);
    expect(state1.experience).toBe(1000);

    // Add more exp (should stay level 2 until 2000)
    addExperience(500);
    const state2 = usePlayerStore.getState();
    expect(state2.level).toBe(2);
    expect(state2.experience).toBe(1500);

    // Add enough to reach level 3
    addExperience(500);
    const state3 = usePlayerStore.getState();
    expect(state3.level).toBe(2); // 2000 exp = level 2 (2000/1000 + 1 = 3, but integer division...)
    // Actually: Math.floor(2000/1000) + 1 = 3
    expect(state3.level).toBe(3);
  });

  it('should not collect same medicine twice', () => {
    const { collectMedicine } = usePlayerStore.getState();

    collectMedicine('麻黄');
    const count1 = usePlayerStore.getState().collectedMedicines.length;

    collectMedicine('麻黄');
    const count2 = usePlayerStore.getState().collectedMedicines.length;

    expect(count1).toBe(count2);
    expect(usePlayerStore.getState().collectedMedicines.filter(m => m === '麻黄').length).toBe(1);
  });

  it('should not unlock same chapter twice', () => {
    const { unlockChapter } = usePlayerStore.getState();

    unlockChapter('chapter-2');
    const count1 = usePlayerStore.getState().unlockedChapters.length;

    unlockChapter('chapter-2');
    const count2 = usePlayerStore.getState().unlockedChapters.length;

    expect(count1).toBe(count2);
  });

  it('should handle empty chapter operations gracefully', () => {
    const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();

    // Operations on non-existent chapter should not crash
    expect(() => {
      completeStage('non-existent', 'stage-1');
    }).not.toThrow();

    const progress = getChapterProgress('non-existent');
    expect(progress).toBeUndefined();
  });
```

---

### Step 7.2: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit src/__tests__/unit/store-edge-cases.test.ts
# Expected: All tests PASS
git add src/__tests__/unit/store-edge-cases.test.ts
git commit -m "test(stores): add edge case tests"
```

---

## Task 8: 最终验证

### Step 8.1: 运行所有测试

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit
# Expected: All tests PASS (24 existing + 50+ new)
```

### Step 8.2: 运行类型检查

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run type-check
# Expected: 0 errors
```

### Step 8.3: 运行构建验证

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run build
# Expected: Build successful
```

### Step 8.4: 最终提交

```bash
git add .
git commit -m "test(phase1): complete test coverage for core framework"
```

---

## 测试覆盖目标

| 模块 | 测试文件 | 预期测试数 |
|-----|---------|-----------|
| AI缓存 | `ai-cache.test.ts` | 10+ |
| Storage | `storage.test.ts` | 8+ |
| Store持久化 | `store-persistence.test.ts` | 6+ |
| Store集成 | `store-integration.test.ts` | 4+ |
| 数据完整性 | `data-integrity.test.ts` | 10+ |
| 路由 | `routing.test.tsx` | 4+ |
| 边界条件 | `store-edge-cases.test.ts` | 6+ |
| **总计** | | **48+** |

**完成标准：总测试数 ≥ 70，所有测试通过，类型检查0错误，构建成功**
