# Phase 5: 开放世界 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现区域解锁系统、每日事件、技能系统、开放探索

**Architecture:** 章节解锁驱动 + 事件驱动 + 技能树系统

**Tech Stack:** React, TypeScript, Zustand

---

## 文件结构规划

```
src/
├── systems/
│   └── openworld/
│       ├── RegionManager.ts      # 区域管理
│       ├── EventManager.ts       # 事件管理
│       ├── SkillTree.ts          # 技能树
│       └── DailyQuest.ts         # 每日任务
├── components/
│   └── openworld/
│       ├── WorldMap.tsx          # 世界地图
│       ├── RegionCard.tsx        # 区域卡片
│       ├── EventPanel.tsx        # 事件面板
│       ├── SkillTree.tsx         # 技能树UI
│       └── DailyQuestList.tsx    # 每日任务列表
├── hooks/
│   └── useOpenWorld.ts           # 开放世界Hook
└── pages/
    └── OpenWorld.tsx             # 开放世界页面
```

---

## Task 1: 区域解锁系统

**参考文档:** `design-output/v3.0-specs/gameplay/04-open-world.md`

**Files:**
- Create: `src/systems/openworld/RegionManager.ts`
- Create: `src/systems/openworld/types.ts`

---

### Step 1.1: 创建区域类型

**File:** `src/systems/openworld/types.ts`

```typescript
import { WuxingType } from '../../types';

export interface Region {
  id: string;
  name: string;
  wuxing: WuxingType;
  description: string;
  unlockRequirement: {
    chapterId?: string;
    masteryScore?: number;
    reputation?: number;
  };
  isUnlocked: boolean;
  isExplored: boolean;
  specialFeatures: RegionFeature[];
  dailyEvents: string[];
}

export interface RegionFeature {
  id: string;
  name: string;
  description: string;
  type: 'herb_rich' | 'rare_spawn' | 'special_npc' | 'training_ground';
}

export interface ExplorationProgress {
  regionId: string;
  visitedTiles: Set<string>;
  discoveredSecrets: string[];
  completedEvents: string[];
  lastVisit: number;
}
```

---

### Step 1.2: 实现区域管理器

**File:** `src/systems/openworld/RegionManager.ts`

```typescript
import { Region, ExplorationProgress, RegionFeature } from './types';
import { WuxingType } from '../../types';

const regions: Region[] = [
  {
    id: 'region-wood',
    name: '青木林深处',
    wuxing: WuxingType.Wood,
    description: '木行药材的丰饶之地',
    unlockRequirement: { chapterId: 'chapter-4', masteryScore: 60 },
    isUnlocked: false,
    isExplored: false,
    specialFeatures: [
      { id: 'wood_herb', name: '千年古树', description: '稀有木行药材刷新率+50%', type: 'herb_rich' },
    ],
    dailyEvents: ['find_rare_wood', 'meet_herbalist'],
  },
  {
    id: 'region-fire',
    name: '赤焰峰顶',
    wuxing: WuxingType.Fire,
    description: '火行药材的灼热之地',
    unlockRequirement: { chapterId: 'chapter-8', masteryScore: 60 },
    isUnlocked: false,
    isExplored: false,
    specialFeatures: [
      { id: 'fire_rare', name: '熔岩洞穴', description: '稀有火行药材刷新率+50%', type: 'rare_spawn' },
    ],
    dailyEvents: ['volcano_event', 'fire_spirit'],
  },
  {
    id: 'region-earth',
    name: '黄土丘腹地',
    wuxing: WuxingType.Earth,
    description: '土行药材的厚重之地',
    unlockRequirement: { chapterId: 'chapter-12', masteryScore: 60 },
    isUnlocked: false,
    isExplored: false,
    specialFeatures: [
      { id: 'earth_training', name: '土行试炼场', description: '训练技能效果+20%', type: 'training_ground' },
    ],
    dailyEvents: ['earthquake', 'treasure_hunt'],
  },
  {
    id: 'region-metal',
    name: '白金原秘境',
    wuxing: WuxingType.Metal,
    description: '金行药材的肃杀之地',
    unlockRequirement: { chapterId: 'chapter-16', masteryScore: 60 },
    isUnlocked: false,
    isExplored: false,
    specialFeatures: [
      { id: 'metal_npc', name: '隐世高人', description: '学习高级技能', type: 'special_npc' },
    ],
    dailyEvents: ['blizzard', 'ice_cave'],
  },
  {
    id: 'region-water',
    name: '黑水潭深渊',
    wuxing: WuxingType.Water,
    description: '水行药材的幽深之地',
    unlockRequirement: { chapterId: 'chapter-20', masteryScore: 80 },
    isUnlocked: false,
    isExplored: false,
    specialFeatures: [
      { id: 'water_mystery', name: '龙宫遗迹', description: '发现传说级药材', type: 'rare_spawn' },
    ],
    dailyEvents: ['flood', 'underwater_cave'],
  },
];

export class RegionManager {
  private regions: Map<string, Region> = new Map();
  private progress: Map<string, ExplorationProgress> = new Map();

  constructor() {
    regions.forEach(r => this.regions.set(r.id, r));
  }

  checkUnlocks(completedChapters: string[], masteryScores: Record<string, number>): string[] {
    const unlocked: string[] = [];

    for (const [id, region] of this.regions) {
      if (region.isUnlocked) continue;

      const req = region.unlockRequirement;
      let shouldUnlock = true;

      if (req.chapterId && !completedChapters.includes(req.chapterId)) {
        shouldUnlock = false;
      }

      if (req.masteryScore) {
        const chapterScore = masteryScores[req.chapterId || ''] || 0;
        if (chapterScore < req.masteryScore) {
          shouldUnlock = false;
        }
      }

      if (shouldUnlock) {
        region.isUnlocked = true;
        unlocked.push(id);
      }
    }

    return unlocked;
  }

  getRegion(id: string): Region | undefined {
    return this.regions.get(id);
  }

  getAllRegions(): Region[] {
    return Array.from(this.regions.values());
  }

  getUnlockedRegions(): Region[] {
    return Array.from(this.regions.values()).filter(r => r.isUnlocked);
  }

  exploreRegion(regionId: string): void {
    const region = this.regions.get(regionId);
    if (region && region.isUnlocked) {
      region.isExplored = true;

      if (!this.progress.has(regionId)) {
        this.progress.set(regionId, {
          regionId,
          visitedTiles: new Set(),
          discoveredSecrets: [],
          completedEvents: [],
          lastVisit: Date.now(),
        });
      }
    }
  }
}

export const regionManager = new RegionManager();
```

---

### Step 1.3: Commit

```bash
git add src/systems/openworld/
git commit -m "feat(openworld): implement region unlock system with 5 areas"
```

---

## Task 2: 每日事件系统

**Files:**
- Create: `src/systems/openworld/EventManager.ts`
- Create: `src/systems/openworld/DailyQuest.ts`

---

### Step 2.1: 实现事件管理器

**File:** `src/systems/openworld/EventManager.ts`

```typescript
export interface GameEvent {
  id: string;
  type: 'find_herb' | 'meet_npc' | 'special_battle' | 'treasure' | 'weather';
  title: string;
  description: string;
  requirements: {
    regionId?: string;
    timeOfDay?: string;
    weather?: string;
  };
  rewards: {
    currency?: number;
    experience?: number;
    reputation?: number;
    items?: string[];
  };
  isActive: boolean;
  expiresAt: number;
}

export class EventManager {
  private activeEvents: Map<string, GameEvent> = new Map();
  private completedEvents: Set<string> = new Set();

  constructor() {
    this.generateDailyEvents();
  }

  generateDailyEvents(): void {
    this.activeEvents.clear();

    const now = Date.now();
    const dayEnd = now + 24 * 60 * 60 * 1000;

    // Generate 3 random daily events
    const eventTemplates = [
      {
        type: 'find_herb' as const,
        titles: ['稀有药材现世', '草药商人的请求', '采药奇遇'],
        descriptions: ['发现了一株稀有药材', '草药商人需要你的帮助', '采药时遇到了意外收获'],
      },
      {
        type: 'meet_npc' as const,
        titles: ['隐士高人', '行脚商人', '迷路药童'],
        descriptions: ['遇到了一位神秘人物', '遇到了行脚商人', '帮助迷路的药童'],
      },
      {
        type: 'special_battle' as const,
        titles: ['邪灵入侵', '守护药田', '挑战试炼'],
        descriptions: ['邪灵正在破坏药田', '保护珍贵药材', '接受特殊挑战'],
      },
    ];

    for (let i = 0; i < 3; i++) {
      const template = eventTemplates[i];
      const titleIndex = Math.floor(Math.random() * template.titles.length);

      const event: GameEvent = {
        id: `daily_${now}_${i}`,
        type: template.type,
        title: template.titles[titleIndex],
        description: template.descriptions[titleIndex],
        requirements: {},
        rewards: {
          currency: 50 + Math.floor(Math.random() * 50),
          experience: 100 + Math.floor(Math.random() * 100),
        },
        isActive: true,
        expiresAt: dayEnd,
      };

      this.activeEvents.set(event.id, event);
    }
  }

  getActiveEvents(): GameEvent[] {
    const now = Date.now();
    return Array.from(this.activeEvents.values()).filter(e =>
      e.isActive && e.expiresAt > now && !this.completedEvents.has(e.id)
    );
  }

  completeEvent(eventId: string): GameEvent | null {
    const event = this.activeEvents.get(eventId);
    if (event && !this.completedEvents.has(eventId)) {
      this.completedEvents.add(eventId);
      return event;
    }
    return null;
  }

  hasCompleted(eventId: string): boolean {
    return this.completedEvents.has(eventId);
  }
}

export const eventManager = new EventManager();
```

---

### Step 2.2: 实现每日任务

**File:** `src/systems/openworld/DailyQuest.ts`

```typescript
export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'battle' | 'explore' | 'craft';
  target: {
    amount: number;
    item?: string;
    region?: string;
  };
  progress: number;
  isCompleted: boolean;
  rewards: {
    currency: number;
    experience: number;
    reputation: number;
  };
}

export class DailyQuestManager {
  private quests: DailyQuest[] = [];
  private lastRefresh: number = 0;

  constructor() {
    this.refreshQuests();
  }

  refreshQuests(): void {
    const now = Date.now();
    const dayStart = new Date().setHours(0, 0, 0, 0);

    if (this.lastRefresh < dayStart) {
      this.generateNewQuests();
      this.lastRefresh = now;
    }
  }

  private generateNewQuests(): void {
    const questTemplates = [
      {
        type: 'collect' as const,
        title: '采集药材',
        description: '在开放世界中采集{amount}味药材',
        targetAmount: 5,
        rewards: { currency: 100, experience: 200, reputation: 10 },
      },
      {
        type: 'battle' as const,
        title: '击退邪灵',
        description: '在药灵守护战中击退{amount}个邪灵',
        targetAmount: 10,
        rewards: { currency: 150, experience: 300, reputation: 15 },
      },
      {
        type: 'explore' as const,
        title: '探索新区域',
        description: '探索{amount}个新区域',
        targetAmount: 1,
        rewards: { currency: 200, experience: 400, reputation: 20 },
      },
    ];

    this.quests = questTemplates.map((template, index) => ({
      id: `quest_${Date.now()}_${index}`,
      title: template.title,
      description: template.description.replace('{amount}', String(template.targetAmount)),
      type: template.type,
      target: { amount: template.targetAmount },
      progress: 0,
      isCompleted: false,
      rewards: template.rewards,
    }));
  }

  getQuests(): DailyQuest[] {
    this.refreshQuests();
    return this.quests;
  }

  updateProgress(questId: string, amount: number): void {
    const quest = this.quests.find(q => q.id === questId);
    if (quest && !quest.isCompleted) {
      quest.progress = Math.min(quest.progress + amount, quest.target.amount);
      if (quest.progress >= quest.target.amount) {
        quest.isCompleted = true;
      }
    }
  }

  claimReward(questId: string): DailyQuest['rewards'] | null {
    const quest = this.quests.find(q => q.id === questId);
    if (quest && quest.isCompleted) {
      return quest.rewards;
    }
    return null;
  }
}

export const dailyQuestManager = new DailyQuestManager();
```

---

### Step 2.3: Commit

```bash
git add src/systems/openworld/EventManager.ts src/systems/openworld/DailyQuest.ts
git commit -m "feat(openworld): add daily events and quest system"
```

---

## Task 3: 技能系统

**Files:**
- Create: `src/systems/openworld/SkillTree.ts`
- Create: `src/components/openworld/SkillTree.tsx`

---

### Step 3.1: 实现技能树

**File:** `src/systems/openworld/SkillTree.ts`

```typescript
import { WuxingType } from '../../types';

export interface Skill {
  id: string;
  name: string;
  description: string;
  wuxing: WuxingType;
  tier: 1 | 2 | 3;
  prerequisites: string[];
  effects: SkillEffect[];
  isUnlocked: boolean;
  isActive: boolean;
}

export interface SkillEffect {
  type: 'map_visibility' | 'collection_bonus' | 'battle_damage' | 'exp_bonus';
  value: number;
  description: string;
}

const skills: Skill[] = [
  // Tier 1 - Basic skills
  { id: 'wood_sight', name: '木行感知', description: '青木林视野+1', wuxing: WuxingType.Wood, tier: 1, prerequisites: [], effects: [{ type: 'map_visibility', value: 1, description: '青木林视野+1' }], isUnlocked: false, isActive: false },
  { id: 'fire_power', name: '火行之力', description: '战斗伤害+10%', wuxing: WuxingType.Fire, tier: 1, prerequisites: [], effects: [{ type: 'battle_damage', value: 0.1, description: '战斗伤害+10%' }], isUnlocked: false, isActive: false },
  { id: 'earth_harvest', name: '土行丰收', description: '采集奖励+15%', wuxing: WuxingType.Earth, tier: 1, prerequisites: [], effects: [{ type: 'collection_bonus', value: 0.15, description: '采集奖励+15%' }], isUnlocked: false, isActive: false },
  { id: 'metal_precision', name: '金行精准', description: '敲击游戏判定+20%', wuxing: WuxingType.Metal, tier: 1, prerequisites: [], effects: [{ type: 'collection_bonus', value: 0.2, description: '敲击判定+20%' }], isUnlocked: false, isActive: false },
  { id: 'water_wisdom', name: '水行智慧', description: '学习经验+10%', wuxing: WuxingType.Water, tier: 1, prerequisites: [], effects: [{ type: 'exp_bonus', value: 0.1, description: '经验+10%' }], isUnlocked: false, isActive: false },

  // Tier 2 - Advanced skills
  { id: 'wood_mastery', name: '木行精通', description: '青木林特殊事件+20%', wuxing: WuxingType.Wood, tier: 2, prerequisites: ['wood_sight'], effects: [{ type: 'collection_bonus', value: 0.2, description: '木行采集+20%' }], isUnlocked: false, isActive: false },
  { id: 'fire_mastery', name: '火行精通', description: '连击倍率+0.2', wuxing: WuxingType.Fire, tier: 2, prerequisites: ['fire_power'], effects: [{ type: 'battle_damage', value: 0.2, description: '连击倍率+0.2' }], isUnlocked: false, isActive: false },

  // Tier 3 - Master skills
  { id: 'five_elements', name: '五行归元', description: '所有技能效果+25%', wuxing: WuxingType.Wood, tier: 3, prerequisites: ['wood_mastery', 'fire_mastery'], effects: [{ type: 'exp_bonus', value: 0.25, description: '全效果+25%' }], isUnlocked: false, isActive: false },
];

export class SkillTree {
  private skills: Map<string, Skill> = new Map();

  constructor() {
    skills.forEach(s => this.skills.set(s.id, s));
  }

  unlockSkill(skillId: string, unlockedSkills: string[]): boolean {
    const skill = this.skills.get(skillId);
    if (!skill || skill.isUnlocked) return false;

    // Check prerequisites
    const prereqsMet = skill.prerequisites.every(prereq =>
      unlockedSkills.includes(prereq)
    );

    if (prereqsMet) {
      skill.isUnlocked = true;
      return true;
    }

    return false;
  }

  activateSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (skill && skill.isUnlocked) {
      skill.isActive = true;
      return true;
    }
    return false;
  }

  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getUnlockedSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(s => s.isUnlocked);
  }

  getActiveEffects(): SkillEffect[] {
    return Array.from(this.skills.values())
      .filter(s => s.isUnlocked && s.isActive)
      .flatMap(s => s.effects);
  }
}

export const skillTree = new SkillTree();
```

---

### Step 3.2: Commit

```bash
git add src/systems/openworld/SkillTree.ts
git commit -m "feat(openworld): implement skill tree with 5 elements and 3 tiers"
```

---

## Task 4: 开放世界页面

**Files:**
- Create: `src/pages/OpenWorld.tsx`
- Modify: `src/App.tsx`

---

### Step 4.1: 创建开放世界页面

**File:** `src/pages/OpenWorld.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { usePlayerStore, useChapterStore } from '../stores';
import { regionManager } from '../systems/openworld/RegionManager';
import { eventManager } from '../systems/openworld/EventManager';
import { dailyQuestManager } from '../systems/openworld/DailyQuest';
import { skillTree } from '../systems/openworld/SkillTree';
import { Region, GameEvent, DailyQuest, Skill } from '../systems/openworld/types';

export const OpenWorld: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const { completedChapters, wuxingAffinity } = usePlayerStore();
  const { progress } = useChapterStore();

  useEffect(() => {
    // Check region unlocks
    const masteryScores: Record<string, number> = {};
    Object.values(progress).forEach(p => {
      // Calculate mastery score from progress
      masteryScores[p.chapterId] = 80; // Simplified
    });

    regionManager.checkUnlocks(completedChapters, masteryScores);
    setRegions(regionManager.getAllRegions());

    // Get daily events
    setEvents(eventManager.getActiveEvents());

    // Get quests
    setQuests(dailyQuestManager.getQuests());

    // Get skills
    setSkills(skillTree.getAllSkills());
  }, [completedChapters, progress]);

  const handleExploreRegion = (region: Region) => {
    regionManager.exploreRegion(region.id);
    setSelectedRegion(regionManager.getRegion(region.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">开放世界</h1>
        <p className="text-gray-600">探索五行山谷，完成每日任务</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regions */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-bold mb-4">探索区域</h2>
          <div className="space-y-3">
            {regions.map(region => (
              <div
                key={region.id}
                className={`p-3 rounded-lg border-2 ${
                  region.isUnlocked
                    ? 'border-green-500 cursor-pointer hover:bg-green-50'
                    : 'border-gray-300 opacity-50'
                }`}
                onClick={() => region.isUnlocked && handleExploreRegion(region)}
              >
                <h3 className="font-medium">{region.name}</h3>
                <p className="text-sm text-gray-600">{region.description}</p>
                {!region.isUnlocked && (
                  <p className="text-xs text-red-500 mt-1">未解锁</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Events & Quests */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold mb-4">今日事件</h2>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-amber-600">+{event.rewards.currency}💎</span>
                    <span className="text-purple-600">+{event.rewards.experience}XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-bold mb-4">每日任务</h2>
            <div className="space-y-3">
              {quests.map(quest => (
                <div key={quest.id} className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{quest.title}</h3>
                      <p className="text-sm text-gray-600">{quest.description}</p>
                    </div>
                    {quest.isCompleted && <span className="text-green-500">✓</span>}
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(quest.progress / quest.target.amount) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {quest.progress}/{quest.target.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-xl font-bold mb-4">技能树</h2>
          <div className="space-y-2">
            {skills.map(skill => (
              <div
                key={skill.id}
                className={`p-3 rounded-lg border ${
                  skill.isUnlocked
                    ? skill.isActive
                      ? 'bg-green-50 border-green-500'
                      : 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{skill.name}</h3>
                    <p className="text-sm text-gray-600">{skill.description}</p>
                  </div>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    T{skill.tier}
                  </span>
                </div>
                {!skill.isUnlocked && skill.prerequisites.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    需要: {skill.prerequisites.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### Step 4.2: Update App.tsx

**File:** `src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChapterSelect } from './pages/ChapterSelect';
import { ChapterEntry } from './pages/ChapterEntry';
import { GatheringStage } from './pages/GatheringStage';
import { BattleStage } from './pages/BattleStage';
import { OpenWorld } from './pages/OpenWorld';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChapterSelect />} />
        <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
        <Route path="/chapter/:chapterId/gathering" element={<GatheringStage />} />
        <Route path="/chapter/:chapterId/battle" element={<BattleStage />} />
        <Route path="/openworld" element={<OpenWorld />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

---

### Step 4.3: Commit

```bash
git add src/pages/OpenWorld.tsx src/App.tsx
git commit -m "feat(pages): add open world with regions, events, quests, and skills"
```

---

## Task 5: 测试与验证

---

### Step 5.1: 运行验证

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run type-check
npm run build
```

**Expected:** All PASS

---

### Step 5.2: Final Commit

```bash
git commit -m "feat(phase5): complete open world with unlock system, events, and skill tree"
```

---

## Phase 5 完成标准

- [x] 5个区域解锁系统
- [x] 每日事件生成
- [x] 每日任务系统
- [x] 技能树（3层）
- [x] 开放世界页面
- [x] 区域解锁检查
- [x] 任务进度追踪
- [x] TypeScript 0错误
- [x] Build成功

**下一阶段:** Phase 6 - Polish与测试验收
