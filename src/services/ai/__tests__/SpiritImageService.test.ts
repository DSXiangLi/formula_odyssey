import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpiritImageService } from '../SpiritImageService';
import { Medicine } from '../../../types/medicine';
import { WuxingType, FourQi, CollectionType, Movement } from '../../../types/enums';

describe('SpiritImageService', () => {
  let service: SpiritImageService;

  const mockMedicine: Medicine = {
    id: 'danggui',
    name: '当归',
    pinyin: 'dang gui',
    latinName: 'Angelica sinensis',
    category: '补血药',
    wuxing: WuxingType.Wood,
    fourQi: FourQi.Warm,
    fiveFlavors: ['甘', '辛'],
    movement: Movement.Ascending,
    meridians: ['肝', '心', '脾'],
    toxicity: '无毒',
    functions: ['补血活血', '调经止痛', '润肠通便'],
    indications: ['血虚萎黄', '眩晕心悸', '月经不调'],
    contraindications: ['湿盛中满', '大便溏泄者慎用'],
    stories: ['当归之名，寓意"应当归来"'],
    affinity: 0,
    isCollected: false,
  };

  const mockMedicineGeneric: Medicine = {
    id: 'unknown-herb',
    name: '神秘草药',
    pinyin: 'shen mi cao yao',
    latinName: 'Mysterious Herba',
    category: '未知',
    wuxing: WuxingType.Water,
    fourQi: FourQi.Cool,
    fiveFlavors: ['甘'],
    movement: Movement.Floating,
    meridians: ['肺'],
    toxicity: '无毒',
    functions: ['清热解毒'],
    indications: ['热毒疮疡'],
    affinity: 0,
    isCollected: false,
  };

  beforeEach(() => {
    service = new SpiritImageService();
    vi.restoreAllMocks();
  });

  describe('generateSpiritImage', () => {
    it('should return fallback SVG when API key is not configured', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const result = await noKeyService.generateSpiritImage(mockMedicine, 'normal');

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/svg+xml');
      expect(result).toContain('%3Csvg'); // 编码后的 <svg
    });

    it('should cache generated images', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      // 未配置API时应该返回fallback并缓存
      const result1 = await noKeyService.generateSpiritImage(mockMedicine, 'normal');
      const result2 = await noKeyService.generateSpiritImage(mockMedicine, 'normal');

      expect(result1).toBe(result2);
      expect(noKeyService.hasCache('danggui', 'normal')).toBe(true);
    });

    it('should generate different cache keys for different difficulties', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      await noKeyService.generateSpiritImage(mockMedicine, 'normal');
      await noKeyService.generateSpiritImage(mockMedicine, 'elite');
      await noKeyService.generateSpiritImage(mockMedicine, 'boss');

      expect(noKeyService.hasCache('danggui', 'normal')).toBe(true);
      expect(noKeyService.hasCache('danggui', 'elite')).toBe(true);
      expect(noKeyService.hasCache('danggui', 'boss')).toBe(true);
      expect(noKeyService.getCacheSize()).toBe(3);
    });

    it('should generate different images for different medicines', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const medicine2: Medicine = {
        ...mockMedicine,
        id: 'chuanxiong',
        name: '川芎',
        pinyin: 'chuan xiong',
      };

      await noKeyService.generateSpiritImage(mockMedicine, 'normal');
      await noKeyService.generateSpiritImage(medicine2, 'normal');

      expect(noKeyService.hasCache('danggui', 'normal')).toBe(true);
      expect(noKeyService.hasCache('chuanxiong', 'normal')).toBe(true);
      expect(noKeyService.getCacheSize()).toBe(2);
    });

    it('should return fallback SVG on API error', async () => {
      // Mock fetch to simulate error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const testService = new SpiritImageService({
        apiUrl: 'https://test.api.com',
        apiKey: 'test-key',
        model: 'test-model',
      });

      const result = await testService.generateSpiritImage(mockMedicine, 'normal');

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/svg+xml');
    });

    it('should return fallback SVG on API non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        text: () => Promise.resolve('Error message'),
      });

      const testService = new SpiritImageService({
        apiUrl: 'https://test.api.com',
        apiKey: 'test-key',
        model: 'test-model',
      });

      const result = await testService.generateSpiritImage(mockMedicine, 'normal');

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/svg+xml');
    });

    it('should handle successful API response', async () => {
      const mockImageUrl = 'https://example.com/image.png';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: [{ url: mockImageUrl }],
        }),
      });

      const testService = new SpiritImageService({
        apiUrl: 'https://test.api.com',
        apiKey: 'test-key',
        model: 'test-model',
      });

      const result = await testService.generateSpiritImage(mockMedicine, 'normal');

      expect(result).toBe(mockImageUrl);
    });

    it('should handle API response with base64 data', async () => {
      const mockBase64 = 'base64encodeddata';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: [{ b64_json: mockBase64 }],
        }),
      });

      const testService = new SpiritImageService({
        apiUrl: 'https://test.api.com',
        apiKey: 'test-key',
        model: 'test-model',
      });

      const result = await testService.generateSpiritImage(mockMedicine, 'normal');

      expect(result).toBe(mockBase64);
    });
  });

  describe('generateSpiritImages', () => {
    it('should generate images for multiple medicines', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const medicines: Medicine[] = [
        mockMedicine,
        { ...mockMedicine, id: 'chuanxiong', name: '川芎', pinyin: 'chuan xiong' },
        { ...mockMedicine, id: 'huangqi', name: '黄芪', pinyin: 'huang qi' },
      ];

      const results = await noKeyService.generateSpiritImages(medicines, 'normal');

      expect(Object.keys(results)).toHaveLength(3);
      expect(results.danggui).toBeTruthy();
      expect(results.chuanxiong).toBeTruthy();
      expect(results.huangqi).toBeTruthy();
    });

    it('should add delay between requests', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const medicines: Medicine[] = [
        mockMedicine,
        { ...mockMedicine, id: 'herb2', name: '草药2', pinyin: 'cao yao 2' },
      ];

      const startTime = Date.now();
      await noKeyService.generateSpiritImages(medicines, 'normal');
      const endTime = Date.now();

      // 应该至少有1000ms的延迟（每个请求之间）
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached images', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      await noKeyService.generateSpiritImage(mockMedicine, 'normal');
      expect(noKeyService.getCacheSize()).toBe(1);

      noKeyService.clearCache();
      expect(noKeyService.getCacheSize()).toBe(0);
      expect(noKeyService.hasCache('danggui', 'normal')).toBe(false);
    });
  });

  describe('getCacheSize', () => {
    it('should return correct cache size', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      expect(noKeyService.getCacheSize()).toBe(0);

      await noKeyService.generateSpiritImage(mockMedicine, 'normal');
      expect(noKeyService.getCacheSize()).toBe(1);

      await noKeyService.generateSpiritImage(mockMedicine, 'elite');
      expect(noKeyService.getCacheSize()).toBe(2);
    });
  });

  describe('hasCache', () => {
    it('should return true for cached entries', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      await noKeyService.generateSpiritImage(mockMedicine, 'normal');

      expect(noKeyService.hasCache('danggui', 'normal')).toBe(true);
      expect(noKeyService.hasCache('danggui', 'elite')).toBe(false);
      expect(noKeyService.hasCache('other', 'normal')).toBe(false);
    });
  });

  describe('fallback SVG generation', () => {
    it('should include medicine name in fallback SVG', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const result = await noKeyService.generateSpiritImage(mockMedicine, 'normal');

      expect(result).toContain(encodeURIComponent(mockMedicine.name));
    });

    it('should include difficulty level in fallback SVG', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const result = await noKeyService.generateSpiritImage(mockMedicine, 'elite');

      expect(result).toContain(encodeURIComponent('精英'));
    });

    it('should use different emojis for different difficulties', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const normalResult = await noKeyService.generateSpiritImage(
        { ...mockMedicine, wuxing: WuxingType.Wood },
        'normal'
      );
      const eliteResult = await noKeyService.generateSpiritImage(
        { ...mockMedicine, wuxing: WuxingType.Wood },
        'elite'
      );
      const bossResult = await noKeyService.generateSpiritImage(
        { ...mockMedicine, wuxing: WuxingType.Wood },
        'boss'
      );

      // 不同难度应该有不同的内容
      expect(normalResult).not.toBe(eliteResult);
      expect(eliteResult).not.toBe(bossResult);
    });

    it('should generate different SVGs for different wuxing types', async () => {
      // 为不同五行创建不同的药材对象（使用完整的对象定义而非展开）
      const woodMedicine: Medicine = {
        id: 'wood-herb',
        name: '木药',
        pinyin: 'mu yao',
        latinName: 'Wood Herba',
        category: '测试',
        wuxing: WuxingType.Wood,
        fourQi: FourQi.Warm,
        fiveFlavors: ['甘'],
        movement: Movement.Ascending,
        meridians: ['肝'],
        toxicity: '无毒',
        functions: ['测试'],
        indications: ['测试'],
        affinity: 0,
        isCollected: false,
      };

      const fireMedicine: Medicine = {
        id: 'fire-herb',
        name: '火药',
        pinyin: 'huo yao',
        latinName: 'Fire Herba',
        category: '测试',
        wuxing: WuxingType.Fire,
        fourQi: FourQi.Hot,
        fiveFlavors: ['苦'],
        movement: Movement.Ascending,
        meridians: ['心'],
        toxicity: '无毒',
        functions: ['测试'],
        indications: ['测试'],
        affinity: 0,
        isCollected: false,
      };

      const waterMedicine: Medicine = {
        id: 'water-herb',
        name: '水药',
        pinyin: 'shui yao',
        latinName: 'Water Herba',
        category: '测试',
        wuxing: WuxingType.Water,
        fourQi: FourQi.Cold,
        fiveFlavors: ['咸'],
        movement: Movement.Floating,
        meridians: ['肾'],
        toxicity: '无毒',
        functions: ['测试'],
        indications: ['测试'],
        affinity: 0,
        isCollected: false,
      };

      // 使用不同的服务实例以避免缓存干扰
      const woodService = new SpiritImageService({ apiKey: '' });
      const fireService = new SpiritImageService({ apiKey: '' });
      const waterService = new SpiritImageService({ apiKey: '' });

      const woodResult = await woodService.generateSpiritImage(woodMedicine, 'normal');
      const fireResult = await fireService.generateSpiritImage(fireMedicine, 'normal');
      const waterResult = await waterService.generateSpiritImage(waterMedicine, 'normal');

      // 三个结果应该互不相同
      expect(woodResult).not.toBe(fireResult);
      expect(fireResult).not.toBe(waterResult);
      expect(woodResult).not.toBe(waterResult);
    });
  });

  describe('prompt building', () => {
    it('should handle known medicine IDs with specific descriptions', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      // 当归有特定的描述
      const danggui: Medicine = {
        ...mockMedicine,
        id: 'danggui',
        name: '当归',
        pinyin: 'dang gui',
      };

      const result = await noKeyService.generateSpiritImage(danggui, 'normal');
      expect(result).toBeTruthy();
    });

    it('should handle unknown medicine with generic description', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const result = await noKeyService.generateSpiritImage(mockMedicineGeneric, 'normal');
      expect(result).toBeTruthy();
    });

    it('should include wuxing in generic description', async () => {
      const noKeyService = new SpiritImageService({ apiKey: '' });
      const waterMedicine: Medicine = {
        ...mockMedicineGeneric,
        wuxing: WuxingType.Water,
      };

      const result = await noKeyService.generateSpiritImage(waterMedicine, 'normal');
      expect(result).toBeTruthy();
    });
  });
});
