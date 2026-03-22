// v3.0 游戏状态管理 - 统一导出

export { useGameStore } from './gameStore';
export type {
  GameStore,
  GameSession,
  GameActions,
  Chapter,
  ChapterProgress,
  ChapterRun,
  Skill,
  SkillEffect,
  SkillEffectType,
  SkillCategory,
  Question,
  ConversationTurn,
  SocraticResponse,
  GeneratedEvent,
  EventType,
  RunRecord,
  OpenWorldState,
  QuestionContext,
  GuideContext,
  EventContext,
  DEFAULT_SKILLS,
  DEFAULT_CHAPTERS,
} from './types';

export {
  createInitialChapterProgress,
  createInitialChapterRun,
  createInitialOpenWorldState,
  createInitialGameSession,
} from './types';

export {
  performMigration,
  clearAllGameData,
  getMigrationStatus,
  hasV2Data,
  hasV3Data,
  migrateFromV2,
} from './migrate';

export {
  usePlayerResources,
  useCollectionProgress,
  useChapters,
  useCurrentChapter,
  useSkills,
  useSkill,
  useOpenWorld,
  useUIState,
  useUIActions,
  useChapterSelectData,
  useSkillTreeData,
  useOpenWorldData,
  useAIDialogData,
} from './hooks';
