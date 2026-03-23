/**
 * Services Index
 * 药灵山谷v3.0 服务层统一导出
 */

// AI Services
export * from './ai';

// Storage Services
export * from './storage';

// Legacy services (for backward compatibility)
export { generateImage, generateImages, generateRegionBackgrounds, generateSeedImages, generateMedicineSpirits, generateUIElements } from './imageGeneration';
export { validateImage, validateImages, generateValidationReport } from './imageValidation';
export { soundManager, useSound } from './soundService';
export { OPEN_WORLD_REGIONS, getEventTypeConfig, getDifficultyLabel, getDifficultyColor, generateDailyEvents, checkOpenWorldUnlock, getUnlockedRegions } from './openWorldService';
