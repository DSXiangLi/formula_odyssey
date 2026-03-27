import React from 'react';

export type StageId =
  | 'mentor-intro'
  | 'gathering'
  | 'battle'
  | 'formula'
  | 'clinical'
  | 'open-world';

export interface StageConfig {
  id: StageId;
  index: number; // 0-5
  title: string;
  component: React.ComponentType<StageProps>;
}

export interface StageProps {
  chapterId: string;
  onComplete: (result?: unknown) => void;
  onExit?: () => void;
  initialData?: unknown; // 用于断点续玩
}

export interface StageState {
  type: 'loading' | 'playing' | 'completed';
  stageIndex: number; // 0-5
  progress?: unknown;
}

// GatheringStage 特定的结果类型
export interface GatheringResult {
  medicines: string[]; // 收集的药材ID
  quality: Record<string, 'normal' | 'good' | 'excellent' | 'legendary'>;
  exploredTiles: number;
}

// 阶段进度（保存在 chapterStore）
export interface StageProgress {
  mentorIntro?: { completed: boolean };
  gathering?: {
    medicinesCollected: string[];
    medicineQuality: Record<string, string>;
    exploredTiles: Array<{ x: number; y: number }>;
    completed: boolean;
  };
  battle?: {
    score: number;
    maxCombo: number;
    completed: boolean;
  };
  formula?: {
    completedFormulas: string[];
    completed: boolean;
  };
  clinical?: {
    score: number;
    attempts: number;
    completed: boolean;
  };
}
