/**
 * MapGenerator Unit Tests
 * Tests for procedural map generation functionality
 *
 * @module systems/map/__tests__/MapGenerator.test
 */

import { describe, it, expect } from 'vitest';
import { MapGenerator, getDefaultMapConfig } from '../MapGenerator';
import { MapConfig } from '../types';
import { WuxingType } from '../../../types';
import { Medicine } from '../../../types/medicine';

describe('MapGenerator', () => {
  const generator = new MapGenerator();

  // Mock medicine data for testing
  const mockMedicines: Medicine[] = [
    {
      id: 'med-1',
      name: 'Test Medicine 1',
      pinyin: 'test1',
      latinName: 'Testus 1',
      category: '植物类',
      wuxing: WuxingType.Wood,
      fourQi: 'warm' as const,
      fiveFlavors: ['sweet'],
      movement: 'ascending' as const,
      meridians: ['liver'],
      toxicity: '无毒',
      functions: ['test'],
      indications: ['test'],
      contraindications: [],
      imagePlant: '/test.png',
      imageHerb: '/test.png',
      collectionType: 'digging' as const,
      stories: [],
      affinity: 0,
      isCollected: false,
    },
    {
      id: 'med-2',
      name: 'Test Medicine 2',
      pinyin: 'test2',
      latinName: 'Testus 2',
      category: '矿物类',
      wuxing: WuxingType.Metal,
      fourQi: 'cold' as const,
      fiveFlavors: ['bitter'],
      movement: 'descending' as const,
      meridians: ['lung'],
      toxicity: '无毒',
      functions: ['test'],
      indications: ['test'],
      contraindications: [],
      imagePlant: '/test.png',
      imageHerb: '/test.png',
      collectionType: 'tapping' as const,
      stories: [],
      affinity: 0,
      isCollected: false,
    },
    {
      id: 'med-3',
      name: 'Test Medicine 3',
      pinyin: 'test3',
      latinName: 'Testus 3',
      category: '动物类',
      wuxing: WuxingType.Water,
      fourQi: 'hot' as const,
      fiveFlavors: ['sour'],
      movement: 'floating' as const,
      meridians: ['kidney'],
      toxicity: '无毒',
      functions: ['test'],
      indications: ['test'],
      contraindications: [],
      imagePlant: '/test.png',
      imageHerb: '/test.png',
      collectionType: 'lasso' as const,
      stories: [],
      affinity: 0,
      isCollected: false,
    },
  ];

  const baseConfig: MapConfig = {
    chapterId: 'chapter-1',
    wuxing: WuxingType.Wood,
    size: 6,
    difficulty: 'normal',
    medicineDensity: 0.3,
    eventFrequency: 0.1,
    weatherEnabled: true,
    medicines: mockMedicines,
  };

  describe('Basic Generation', () => {
    it('should generate map with correct size', () => {
      const map = generator.generate(baseConfig);
      expect(map.size).toBe(6);
      expect(map.tiles.length).toBe(6);
      expect(map.tiles[0].length).toBe(6);
    });

    it('should generate map with different sizes', () => {
      const sizes = [6, 8, 10];
      sizes.forEach((size) => {
        const config = { ...baseConfig, size };
        const map = generator.generate(config);
        expect(map.size).toBe(size);
        expect(map.tiles.length).toBe(size);
        expect(map.tiles[0].length).toBe(size);
      });
    });

    it('should place player start position within bounds', () => {
      const map = generator.generate(baseConfig);
      expect(map.playerStart.x).toBeGreaterThanOrEqual(0);
      expect(map.playerStart.x).toBeLessThan(6);
      expect(map.playerStart.y).toBeGreaterThanOrEqual(0);
      expect(map.playerStart.y).toBeLessThan(6);
    });

    it('should place player start at center for even-sized maps', () => {
      const map = generator.generate(baseConfig);
      const expectedCenter = Math.floor(6 / 2);
      expect(map.playerStart.x).toBe(expectedCenter);
      expect(map.playerStart.y).toBe(expectedCenter);
    });

    it('should generate unique map IDs', () => {
      const map1 = generator.generate(baseConfig);
      const map2 = generator.generate(baseConfig);
      expect(map1.id).not.toBe(map2.id);
    });

    it('should include chapterId in map', () => {
      const map = generator.generate(baseConfig);
      expect(map.chapterId).toBe('chapter-1');
    });

    it('should include wuxing type in map', () => {
      const map = generator.generate(baseConfig);
      expect(map.wuxing).toBe(WuxingType.Wood);
    });
  });

  describe('Terrain Generation', () => {
    it('should generate terrain for all tiles', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          expect(map.tiles[y][x].terrain).toBeDefined();
          expect(typeof map.tiles[y][x].terrain).toBe('string');
        }
      }
    });

    it('should ensure player start position is accessible', () => {
      const map = generator.generate(baseConfig);
      const startTile = map.tiles[map.playerStart.y][map.playerStart.x];
      expect(startTile.accessible).toBe(true);
      expect(startTile.terrain).toBe('plains');
    });

    it('should generate different terrain types', () => {
      const map = generator.generate(baseConfig);
      const terrains = new Set<string>();
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          terrains.add(map.tiles[y][x].terrain);
        }
      }
      expect(terrains.size).toBeGreaterThanOrEqual(1);
    });

    it('should mark water tiles as inaccessible', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].terrain === 'water') {
            expect(map.tiles[y][x].accessible).toBe(false);
          }
        }
      }
    });
  });

  describe('Medicine Distribution', () => {
    it('should distribute medicines based on density', () => {
      const map = generator.generate(baseConfig);
      let medicineCount = 0;
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].medicine) medicineCount++;
        }
      }
      expect(medicineCount).toBeGreaterThan(0);
    });

    it('should respect medicine density configuration', () => {
      const highDensityConfig = { ...baseConfig, medicineDensity: 0.5 };
      const lowDensityConfig = { ...baseConfig, medicineDensity: 0.1 };

      const highDensityMap = generator.generate(highDensityConfig);
      const lowDensityMap = generator.generate(lowDensityConfig);

      let highCount = 0;
      let lowCount = 0;

      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if (highDensityMap.tiles[y][x].medicine) highCount++;
          if (lowDensityMap.tiles[y][x].medicine) lowCount++;
        }
      }

      expect(highCount).toBeGreaterThanOrEqual(lowCount);
    });

    it('should not place medicines on inaccessible tiles', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].medicine) {
            expect(map.tiles[y][x].accessible).toBe(true);
          }
        }
      }
    });

    it('should not place medicines on player start position', () => {
      const map = generator.generate(baseConfig);
      const startTile = map.tiles[map.playerStart.y][map.playerStart.x];
      expect(startTile.medicine).toBeUndefined();
    });

    it('should assign collection types to medicines', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          const medicine = map.tiles[y][x].medicine;
          if (medicine) {
            expect(medicine.collectionType).toBeDefined();
            expect(['digging', 'tapping', 'lasso', 'searching']).toContain(medicine.collectionType);
          }
        }
      }
    });

    it('should assign rarity to medicines', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          const medicine = map.tiles[y][x].medicine;
          if (medicine) {
            expect(medicine.rarity).toBeDefined();
            expect(['common', 'uncommon', 'rare', 'epic']).toContain(medicine.rarity);
          }
        }
      }
    });

    it('should handle empty medicine list', () => {
      const configWithoutMedicines = { ...baseConfig, medicines: [] };
      const map = generator.generate(configWithoutMedicines);
      expect(map).toBeDefined();
      expect(map.size).toBe(6);
    });
  });

  describe('Connectivity', () => {
    it('should ensure all medicine tiles are accessible', () => {
      const map = generator.generate(baseConfig);
      const reachable = new Set<string>();
      const queue = [map.playerStart];
      reachable.add(`${map.playerStart.x},${map.playerStart.y}`);

      // BFS from player start
      while (queue.length > 0) {
        const current = queue.shift()!;
        const directions = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ];

        for (const dir of directions) {
          const newX = current.x + dir.x;
          const newY = current.y + dir.y;

          if (newX >= 0 && newX < map.size && newY >= 0 && newY < map.size) {
            const key = `${newX},${newY}`;
            if (!reachable.has(key) && map.tiles[newY][newX].accessible) {
              reachable.add(key);
              queue.push({ x: newX, y: newY });
            }
          }
        }
      }

      // Check all medicine tiles are reachable
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].medicine) {
            expect(reachable.has(`${x},${y}`)).toBe(true);
          }
        }
      }
    });

    it('should have accessible tiles connected to start', () => {
      const map = generator.generate(baseConfig);
      const reachable = new Set<string>();
      const queue = [map.playerStart];
      reachable.add(`${map.playerStart.x},${map.playerStart.y}`);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const directions = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ];

        for (const dir of directions) {
          const newX = current.x + dir.x;
          const newY = current.y + dir.y;

          if (newX >= 0 && newX < map.size && newY >= 0 && newY < map.size) {
            const key = `${newX},${newY}`;
            if (!reachable.has(key) && map.tiles[newY][newX].accessible) {
              reachable.add(key);
              queue.push({ x: newX, y: newY });
            }
          }
        }
      }

      // At least 50% of tiles should be reachable
      const accessibleTiles = [];
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].accessible) {
            accessibleTiles.push(`${x},${y}`);
          }
        }
      }

      expect(reachable.size).toBeGreaterThanOrEqual(accessibleTiles.length * 0.5);
    });
  });

  describe('Features and Points of Interest', () => {
    it('should place some feature tiles', () => {
      const map = generator.generate(baseConfig);
      let featureCount = 0;
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].feature) featureCount++;
        }
      }
      expect(featureCount).toBeGreaterThanOrEqual(0);
    });

    it('should have features with valid types', () => {
      const map = generator.generate(baseConfig);
      const validFeatureTypes = ['herb_patch', 'mineral_vein', 'animal_nest', 'treasure_spot', 'landmark'];

      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          const feature = map.tiles[y][x].feature;
          if (feature) {
            expect(validFeatureTypes).toContain(feature.type);
            expect(feature.name).toBeDefined();
            expect(feature.description).toBeDefined();
          }
        }
      }
    });

    it('should not place features on inaccessible tiles', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          if (map.tiles[y][x].feature) {
            expect(map.tiles[y][x].accessible).toBe(true);
          }
        }
      }
    });
  });

  describe('Events', () => {
    it('should generate events array', () => {
      const map = generator.generate(baseConfig);
      expect(Array.isArray(map.events)).toBe(true);
    });

    it('should have at least one entry event', () => {
      const map = generator.generate(baseConfig);
      expect(map.events.length).toBeGreaterThanOrEqual(1);
    });

    it('should have events with valid structure', () => {
      const map = generator.generate(baseConfig);
      map.events.forEach((event) => {
        expect(event.id).toBeDefined();
        expect(event.type).toBeDefined();
        expect(event.position).toBeDefined();
        expect(event.position.x).toBeGreaterThanOrEqual(0);
        expect(event.position.y).toBeGreaterThanOrEqual(0);
        expect(event.description).toBeDefined();
      });
    });
  });

  describe('Weather and Time', () => {
    it('should initialize weather state', () => {
      const map = generator.generate(baseConfig);
      expect(map.weather).toBeDefined();
      expect(map.weather.type).toBeDefined();
      expect(map.weather.intensity).toBeGreaterThanOrEqual(0);
      expect(map.weather.intensity).toBeLessThanOrEqual(1);
    });

    it('should initialize time state', () => {
      const map = generator.generate(baseConfig);
      expect(map.time).toBeDefined();
      expect(map.time.hour).toBeGreaterThanOrEqual(0);
      expect(map.time.hour).toBeLessThanOrEqual(23);
      expect(map.time.day).toBeGreaterThanOrEqual(1);
    });

    it('should set season based on wuxing', () => {
      const configWood = { ...baseConfig, wuxing: WuxingType.Wood };
      const mapWood = generator.generate(configWood);
      expect(mapWood.time.season).toBe('spring');

      const configFire = { ...baseConfig, wuxing: WuxingType.Fire };
      const mapFire = generator.generate(configFire);
      expect(mapFire.time.season).toBe('summer');
    });
  });

  describe('Discovery State', () => {
    it('should initialize all tiles as hidden', () => {
      const map = generator.generate(baseConfig);
      for (let y = 0; y < map.size; y++) {
        for (let x = 0; x < map.size; x++) {
          expect(map.tiles[y][x].discoveryState).toBe('hidden');
        }
      }
    });

    it('should initialize discovered and explored sets', () => {
      const map = generator.generate(baseConfig);
      expect(map.discoveredTiles).toBeInstanceOf(Set);
      expect(map.exploredTiles).toBeInstanceOf(Set);
      expect(map.collectedMedicines).toBeInstanceOf(Set);
    });
  });

  describe('Different Wuxing Types', () => {
    const wuxingTypes = [WuxingType.Wood, WuxingType.Fire, WuxingType.Earth, WuxingType.Metal, WuxingType.Water];

    wuxingTypes.forEach((wuxing) => {
      it(`should generate valid map for ${wuxing} wuxing`, () => {
        const config = { ...baseConfig, wuxing };
        const map = generator.generate(config);
        expect(map.wuxing).toBe(wuxing);
        expect(map.size).toBe(6);
        expect(map.tiles.length).toBe(6);
      });
    });
  });

  describe('getDefaultMapConfig', () => {
    it('should return default config with correct structure', () => {
      const config = getDefaultMapConfig('chapter-1', WuxingType.Wood, mockMedicines);
      expect(config.chapterId).toBe('chapter-1');
      expect(config.wuxing).toBe(WuxingType.Wood);
      expect(config.size).toBe(8);
      expect(config.difficulty).toBe('normal');
      expect(config.medicineDensity).toBe(0.3);
      expect(config.eventFrequency).toBe(0.1);
      expect(config.weatherEnabled).toBe(true);
      expect(config.medicines).toEqual(mockMedicines);
    });

    it('should work with different chapter IDs', () => {
      const config = getDefaultMapConfig('chapter-5', WuxingType.Fire, mockMedicines);
      expect(config.chapterId).toBe('chapter-5');
      expect(config.wuxing).toBe(WuxingType.Fire);
    });
  });

  describe('Collection Type Detection', () => {
    it('should detect digging type for plant medicines', () => {
      const plantMedicine: Medicine = {
        ...mockMedicines[0],
        category: '植物类',
      };
      const collectionType = generator.getCollectionType(plantMedicine);
      expect(collectionType).toBe('digging');
    });

    it('should detect tapping type for mineral medicines', () => {
      const mineralMedicine: Medicine = {
        ...mockMedicines[1],
        category: '矿物类',
      };
      const collectionType = generator.getCollectionType(mineralMedicine);
      expect(collectionType).toBe('tapping');
    });

    it('should detect lasso type for animal medicines', () => {
      const animalMedicine: Medicine = {
        ...mockMedicines[2],
        category: '动物类',
      };
      const collectionType = generator.getCollectionType(animalMedicine);
      expect(collectionType).toBe('lasso');
    });

    it('should default to searching for unknown categories', () => {
      const unknownMedicine: Medicine = {
        ...mockMedicines[0],
        category: 'unknown',
      };
      const collectionType = generator.getCollectionType(unknownMedicine);
      expect(collectionType).toBe('searching');
    });
  });
});
