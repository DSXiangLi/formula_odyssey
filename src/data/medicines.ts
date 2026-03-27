// 药灵数据访问函数
// 基于药灵数据配置v2.0.json

import medicineDataJson from '../../design-output/药灵数据配置v2.0.json';

export interface MedicineData {
  id: string;
  name: string;
  pinyin: string;
  latinName?: string;
  category: string;
  wuxing: string;
  fourQi: string;
  fiveFlavors: string[];
  movement?: string;
  meridians: string[];
  toxicity?: string;
  functions: string[];
  indications: string[];
  contraindications: string[];
  imagePlant?: string;
  imageHerb?: string;
  collectionType?: string;
  stories?: string[];
  affinity?: number;
  collected?: boolean;
}

// 药材数据缓存
let medicinesCache: MedicineData[] | null = null;

/**
 * 获取所有药材数据
 */
export function getAllMedicines(): MedicineData[] {
  if (!medicinesCache) {
    try {
      medicinesCache = (medicineDataJson.medicines || []) as MedicineData[];
    } catch (e) {
      console.error('Failed to load medicine data:', e);
      medicinesCache = [];
    }
  }
  return medicinesCache || [];
}

/**
 * 通过ID获取药材
 */
export function getMedicineById(id: string): MedicineData | undefined {
  const medicines = getAllMedicines();
  return medicines.find(m => m.id === id);
}

/**
 * 通过名称获取药材
 */
export function getMedicineByName(name: string): MedicineData | undefined {
  const medicines = getAllMedicines();
  return medicines.find(m => m.name === name);
}

/**
 * 通过五行获取药材
 */
export function getMedicinesByWuxing(wuxing: string): MedicineData[] {
  const medicines = getAllMedicines();
  return medicines.filter(m => m.wuxing === wuxing);
}

/**
 * 通过分类获取药材
 */
export function getMedicinesByCategory(category: string): MedicineData[] {
  const medicines = getAllMedicines();
  return medicines.filter(m => m.category === category);
}

/**
 * 获取已收集的药材（需要根据玩家进度）
 */
export function getCollectedMedicines(collectedIds: string[]): MedicineData[] {
  const medicines = getAllMedicines();
  return medicines.filter(m => collectedIds.includes(m.id));
}

/**
 * 搜索药材
 */
export function searchMedicines(query: string): MedicineData[] {
  const medicines = getAllMedicines();
  const lowerQuery = query.toLowerCase();
  return medicines.filter(m =>
    m.name.includes(query) ||
    m.pinyin.toLowerCase().includes(lowerQuery) ||
    m.category.includes(query) ||
    m.functions.some(f => f.includes(query))
  );
}

export default {
  getAllMedicines,
  getMedicineById,
  getMedicineByName,
  getMedicinesByWuxing,
  getMedicinesByCategory,
  getCollectedMedicines,
  searchMedicines,
};
