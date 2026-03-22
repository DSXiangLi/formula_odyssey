/**
 * LRU Cache Implementation
 * 药灵山谷v3.0 AI缓存层
 */

interface CacheNode<T> {
  key: string;
  data: T;
  timestamp: number;
  next?: CacheNode<T>;
  prev?: CacheNode<T>;
}

export class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, CacheNode<T>>;
  private head?: CacheNode<T>;
  private tail?: CacheNode<T>;
  private ttl: number; // Time to live in milliseconds
  private hits = 0;
  private misses = 0;

  constructor(capacity: number, ttl: number = 5 * 60 * 1000) {
    this.capacity = capacity;
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      return undefined;
    }

    // 检查是否过期
    if (Date.now() - node.timestamp > this.ttl) {
      this.cache.delete(key);
      this.removeNode(node);
      this.misses++;
      return undefined;
    }

    // 移动到头部（最近使用）
    this.moveToHead(node);
    this.hits++;
    return node.data;
  }

  /**
   * 设置缓存项
   */
  set(key: string, data: T): void {
    // 如果已存在，更新并移动到头部
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.data = data;
      existingNode.timestamp = Date.now();
      this.moveToHead(existingNode);
      return;
    }

    // 如果容量已满，移除尾部
    if (this.cache.size >= this.capacity) {
      this.removeLRU();
    }

    // 创建新节点并添加到头部
    const newNode: CacheNode<T> = {
      key,
      data,
      timestamp: Date.now(),
    };

    this.cache.set(key, newNode);
    this.addToHead(newNode);
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.cache.delete(key);
    this.removeNode(node);
    return true;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.head = undefined;
    this.tail = undefined;
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取缓存统计
   */
  getStats(): { hits: number; misses: number; size: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, node] of this.cache.entries()) {
      if (now - node.timestamp > this.ttl) {
        this.cache.delete(key);
        this.removeNode(node);
        removed++;
      }
    }

    return removed;
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // ========== 私有方法 ==========

  private addToHead(node: CacheNode<T>): void {
    node.next = this.head;
    node.prev = undefined;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeLRU(): void {
    if (!this.tail) return;

    this.cache.delete(this.tail.key);
    this.removeNode(this.tail);
  }
}

// ========== AI缓存管理器 ==========

export class AICacheManager {
  // 题目缓存 - 按章节+目标药物哈希
  questionCache: LRUCache<unknown>;
  // 事件缓存 - 按日期
  eventCache: LRUCache<unknown>;
  // 答案验证缓存
  validationCache: LRUCache<unknown>;
  // 引导回复缓存
  guideCache: LRUCache<unknown>;

  constructor() {
    // 题目缓存：100条，10分钟TTL
    this.questionCache = new LRUCache(100, 10 * 60 * 1000);
    // 事件缓存：50条，当天有效（24小时）
    this.eventCache = new LRUCache(50, 24 * 60 * 60 * 1000);
    // 验证缓存：200条，5分钟TTL
    this.validationCache = new LRUCache(200, 5 * 60 * 1000);
    // 引导缓存：100条，10分钟TTL
    this.guideCache = new LRUCache(100, 10 * 60 * 1000);
  }

  /**
   * 生成缓存键
   */
  static generateQuestionKey(
    chapter: number,
    targetMedicine: string,
    collectedMedicines: string[]
  ): string {
    const sorted = [...collectedMedicines].sort().join(',');
    return `q:${chapter}:${targetMedicine}:${sorted}`;
  }

  static generateEventKey(date: string, playerId?: string): string {
    return `e:${date}:${playerId || 'anon'}`;
  }

  static generateValidationKey(question: string, answer: string): string {
    // 简化问题用于缓存键
    const simplified = question.slice(0, 50);
    return `v:${simplified}:${answer.slice(0, 50)}`;
  }

  static generateGuideKey(
    question: string,
    playerAnswer: string,
    round: number
  ): string {
    const simplified = question.slice(0, 30);
    return `g:${simplified}:${playerAnswer.slice(0, 30)}:${round}`;
  }

  /**
   * 清理所有过期缓存
   */
  cleanup(): { questions: number; events: number; validations: number; guides: number } {
    return {
      questions: this.questionCache.cleanup(),
      events: this.eventCache.cleanup(),
      validations: this.validationCache.cleanup(),
      guides: this.guideCache.cleanup(),
    };
  }

  /**
   * 获取所有统计
   */
  getAllStats(): {
    questions: ReturnType<LRUCache<unknown>['getStats']>;
    events: ReturnType<LRUCache<unknown>['getStats']>;
    validations: ReturnType<LRUCache<unknown>['getStats']>;
    guides: ReturnType<LRUCache<unknown>['getStats']>;
  } {
    return {
      questions: this.questionCache.getStats(),
      events: this.eventCache.getStats(),
      validations: this.validationCache.getStats(),
      guides: this.guideCache.getStats(),
    };
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    this.questionCache.clear();
    this.eventCache.clear();
    this.validationCache.clear();
    this.guideCache.clear();
  }
}

// 单例导出
export const aiCache = new AICacheManager();
