# 数据模型详细设计

## 1. 核心实体关系

```
┌─────────────────────────────────────────────────────────────┐
│                      实体关系图                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌────────────┐        ┌────────────┐                    │
│   │   Player   │◄──────►│   Chapter  │                    │
│   │   (玩家)   │   *    │   (章节)   │                    │
│   └──────┬─────┘        └──────┬─────┘                    │
│          │                     │                            │
│          │              ┌──────┴──────┐                    │
│          │              │             │                     │
│   ┌──────┴──────┐  ┌────┴────┐  ┌────┴────┐               │
│   │   Medicine  │  │ Formula │  │ Clinical │               │
│   │   (药材)    │  │ (方剂)  │  │  Case    │               │
│   └─────────────┘  └─────────┘  └──────────┘               │
│          │                                                    │
│          │              ┌────────────┐                      │
│          └─────────────►│ AIMentor   │                      │
│                         │ (AI导师)   │                      │
│                         └────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 2. 详细数据模型

### 2.1 玩家数据 (Player)

```typescript
// models/player.ts
interface Player {
  // 基础信息
  id: string;                    // 唯一ID
  name: string;                  // 玩家昵称
  avatar?: string;               // 头像URL
  createdAt: Date;               // 创建时间
  lastLoginAt: Date;             // 最后登录时间

  // 资源
  diamonds: number;              // 方灵石（货币）
  reputation: number;            // 声望值

  // 等级系统
  level: number;                 // 医者等级 1-50
  exp: number;                   // 当前经验
  title: string;                 // 当前称号

  // 统计
  stats: PlayerStats;
}

interface PlayerStats {
  totalPlayTime: number;         // 总游戏时长（分钟）
  totalQuestions: number;        // 总答题数
  correctAnswers: number;        // 正确答题数
  collectedMedicines: number;    // 收集药材数
  completedChapters: number;     // 完成章节数
  savedPatients: number;         // 救治患者数
  maxCombo: number;              // 最高连击
  typingSpeed: number;           // 平均打字速度（WPM）
}
```

### 2.2 章节数据 (Chapter)

```typescript
// models/chapter.ts
interface Chapter {
  // 基础信息
  id: string;                    // 章节ID (ch-001)
  sequence: number;              // 章节序号 1-20
  name: string;                  // 章节名称
  subtitle: string;              // 副标题

  // 五行关联
  wuxing: WuxingType;            // 五行归属
  regionName: string;            // 区域名称

  // 内容
  medicines: string[];           // 本章药材ID列表 (4个)
  formulas: string[];            // 本章方剂ID列表 (2个)
  bossCases: string[];           // 考核病案ID列表 (2-3个)

  // 解锁条件
  prerequisites: {
    chapters?: string[];         // 必须完成的先修章节
    minLevel?: number;           // 最低等级
  };

  // 奖励
  rewards: {
    diamonds: number;            // 方灵石
    exp: number;                 // 经验值
    skill?: string;              // 解锁技能ID
    title?: string;              // 解锁称号
  };
}

// 章节进度
interface ChapterProgress {
  chapterId: string;
  status: ChapterStatus;         // locked | available | in_progress | completed

  // 阶段进度
  currentStage: number;          // 当前阶段 1-6
  completedStages: number[];     // 已完成阶段

  // 药材收集
  collectedMedicines: string[];  // 已收集药材

  // 学习统计
  startTime?: Date;              // 开始时间
  completeTime?: Date;           // 完成时间
  totalTime: number;             // 总用时（分钟）

  // 战斗记录
  battleAttempts: number;        // 战斗尝试次数
  bestBattleScore: number;       // 最高战斗分数

  // 掌握度
  masteryLevel: number;          // 0-100
}

type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed';
type WuxingType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
```

### 2.3 药材数据 (Medicine)

```typescript
// models/medicine.ts
interface Medicine {
  // 基础信息
  id: string;                    // 药材ID (mahuang)
  name: string;                  // 药名
  pinyin: string;                // 拼音
  latinName: string;             // 拉丁学名

  // 分类
  category: MedicineCategory;    // 功效分类
  wuxing: WuxingType;            // 五行归属

  // 中药属性
  fourQi: FourQi;                // 四气
  fiveFlavors: FiveFlavor[];     // 五味
  movement: Movement;            // 升降浮沉
  meridians: string[];           // 归经
  toxicity: ToxicityLevel;       // 毒性等级

  // 功效主治
  functions: string[];           // 功效列表
  indications: string[];         // 主治列表
  contraindications: string[];   // 禁忌

  // 采集信息
  gathering: GatheringInfo;      // 采集相关信息

  // 图片
  images: MedicineImages;

  // 故事
  stories: string[];             // 药材故事

  // 战斗相关
  battleKeywords: string[];      // 战斗中使用的关键词
}

interface GatheringInfo {
  type: 'plant' | 'mineral' | 'animal';  // 药材类型
  habitats: string[];            // 生长环境
  bestSeason: string;            // 最佳采集季节
  bestTime: string;              // 最佳采集时辰
  difficulty: number;            // 采集难度 1-5
  miniGame: MiniGameType;        // 对应小游戏类型
}

type MedicineCategory =
  | '解表药' | '清热药' | '泻下药' | '祛风湿药'
  | '化湿药' | '利水渗湿药' | '温里药' | '理气药'
  | '消食药' | '驱虫药' | '止血药' | '活血化瘀药'
  | '化痰止咳平喘药' | '安神药' | '平肝息风药'
  | '开窍药' | '补益药' | '收涩药';

type FourQi = '寒' | '热' | '温' | '凉' | '平';
type FiveFlavor = '酸' | '苦' | '甘' | '辛' | '咸' | '淡' | '涩';
type Movement = '升浮' | '沉降' | '双向' | '平和';
type ToxicityLevel = '无毒' | '小毒' | '有毒' | '大毒';
type MiniGameType = 'digging' | 'rhythm' | 'lasso';

interface MedicineImages {
  plant?: string;                // 原植物图
  herb: string;                  // 饮片图
  detail?: string;               // 细节图
}
```

### 2.4 方剂数据 (Formula)

```typescript
// models/formula.ts
interface Formula {
  id: string;                    // 方剂ID
  name: string;                  // 方名
  pinyin: string;                // 拼音
  category: FormulaCategory;     // 方剂分类

  // 组成
  composition: FormulaComponent[];

  // 功效主治
  functions: string[];
  indications: string[];

  // 方歌
  song?: string;

  // 用法
  usage?: string;

  // 相关章节
  chapterId: string;             // 所属章节
}

interface FormulaComponent {
  medicineId: string;            // 药材ID
  amount: string;                // 用量
  role: JunChenZuoShi;           // 君臣佐使
  preparation?: string;          // 炮制方法
}

type FormulaCategory =
  | '解表剂' | '泻下剂' | '和解剂' | '清热剂'
  | '祛暑剂' | '温里剂' | '表里双解剂' | '补益剂'
  | '固涩剂' | '安神剂' | '开窍剂' | '理气剂'
  | '理血剂' | '治风剂' | '治燥剂' | '祛湿剂'
  | '祛痰剂' | '消导化积剂' | '驱虫剂';

type JunChenZuoShi = 'jun' | 'chen' | 'zuo' | 'shi';
```

### 2.5 病案数据 (ClinicalCase)

```typescript
// models/clinicalCase.ts
interface ClinicalCase {
  id: string;
  chapterId: string;             // 所属章节

  // 患者信息
  patientInfo: PatientInfo;

  // 症状
  symptoms: string[];
  tongue: string;                // 舌象
  pulse: string;                 // 脉象

  // 正确答案
  correctAnswer: ClinicalAnswer;

  // 解析
  explanation: string;

  // 难度
  difficulty: number;            // 1-5
}

interface PatientInfo {
  name?: string;
  gender: 'male' | 'female';
  age: number;
  occupation?: string;
}

interface ClinicalAnswer {
  treatment: string;             // 治法
  formula: string;               // 方剂
  junMedicine: string;           // 君药
}
```

### 2.6 AI导师数据 (AIMentor)

```typescript
// models/aiMentor.ts
interface AIMentor {
  id: string;
  name: string;                  // 青木先生
  title: string;                 // 药灵山谷守谷人

  // 形象
  avatar: MentorAvatar;

  // 性格配置
  personality: MentorPersonality;

  // 对话风格
  dialogueStyle: DialogueStyle;
}

interface MentorAvatar {
  base: string;                  // 基础立绘
  expressions: {
    default: string;             // 微笑
    thinking: string;            // 思考
    nodding: string;             // 点头
    surprised: string;           // 惊讶
    celebrating: string;         // 庆祝
    concerned: string;           // 关切
  };
  outfits: {
    wood: string;                // 木行服装
    fire: string;                // 火行服装
    earth: string;               // 土行服装
    metal: string;               // 金行服装
    water: string;               // 水行服装
  };
}

interface MentorPersonality {
  traits: string[];              // 性格特点
  speechStyle: string;           // 说话风格
  humorLevel: number;            // 幽默程度 1-5
  strictness: number;            // 严厉程度 1-5
  patience: number;              // 耐心程度 1-5
}

interface DialogueStyle {
  greeting: string[];            // 开场白模板
  encouragement: string[];       // 鼓励话语模板
  correction: string[];          // 纠正话语模板
  celebration: string[];         // 庆祝话语模板
}
```

### 2.7 采药地图数据 (GatheringMap)

```typescript
// models/gatheringMap.ts
interface GatheringMap {
  id: string;
  chapterId: string;             // 所属章节
  wuxing: WuxingType;

  // 地图网格
  grid: Tile[][];                // 6x6 或 8x8 网格

  // 玩家起始位置
  startPosition: Position;

  // 特殊事件点
  eventPoints: EventPoint[];
}

interface Tile {
  position: Position;
  type: TileType;                // 地块类型
  isExplored: boolean;           // 是否已探索
  medicine?: string;             // 隐藏的药材ID
  event?: string;                // 隐藏的事件ID
  weatherBonus?: WeatherEffect;  // 天气加成
}

interface Position {
  x: number;
  y: number;
}

interface EventPoint {
  position: Position;
  eventType: EventType;
  triggerCondition: TriggerCondition;
}

type TileType =
  | 'empty'      // 空地
  | 'grass'      // 草地
  | 'forest'     // 树林
  | 'water'      // 水域
  | 'rock'       // 岩石
  | 'cave'       // 洞穴
  | 'special';   // 特殊

type EventType =
  | 'elder'      // 采药老人
  | 'trap'       // 陷阱
  | 'treasure'   // 宝藏
  | 'weather';   // 天气变化
```

### 2.8 战斗系统数据 (Battle)

```typescript
// models/battle.ts
interface BattleState {
  // 基础信息
  id: string;
  chapterId: string;
  medicineIds: string[];         // 本次战斗涉及的药材

  // 状态
  status: BattleStatus;
  currentWave: number;           // 当前波次 1-4
  timeRemaining: number;         // 剩余时间（秒）

  // 玩家状态
  playerHealth: number;          // 玩家生命 0-100
  combo: number;                 // 当前连击
  maxCombo: number;              // 最高连击
  score: number;                 // 当前分数

  // 敌人
  enemies: BattleEnemy[];

  // 输入
  currentInput: string;          // 当前输入
  targetText: string;            // 目标文本

  // 技能
  availableSkills: string[];     // 可用技能
  skillCharge: number;           // 技能充能 0-100
}

interface BattleEnemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  position: Position;            // 在战场上的位置
  speed: number;                 // 移动速度
  targetText: string;            // 需要输入的文本来击退
  isDefeated: boolean;
}

type BattleStatus =
  | 'preparing'    // 准备中
  | 'wave1'        // 第一波
  | 'wave2'        // 第二波
  | 'wave3'        // 第三波
  | 'boss'         // Boss战
  | 'victory'      // 胜利
  | 'defeat';      // 失败

type EnemyType =
  | 'normal'       // 普通邪灵
  | 'elite'        // 精英邪灵
  | 'boss';        // 邪灵王

interface BattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  accuracy: number;              // 准确率
  timeUsed: number;              // 用时
  rewards: BattleReward;
}

interface BattleReward {
  diamonds: number;
  exp: number;
  affinityBonus?: Record<string, number>;
}
```

### 2.9 技能数据 (Skill)

```typescript
// models/skill.ts
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;

  // 分类
  category: SkillCategory;

  // 效果
  effects: SkillEffect[];

  // 解锁条件
  unlockCondition: UnlockCondition;

  // 等级
  maxLevel: number;
  currentLevel: number;
}

type SkillCategory =
  | 'explore'      // 探索类
  | 'gather'       // 采集类
  | 'battle'       // 战斗类
  | 'chapter'      // 章节专属
  | 'general';     // 通用

interface SkillEffect {
  type: EffectType;
  target?: string;
  value: number;
}

type EffectType =
  | 'discount'         // 价格折扣
  | 'bonus'            // 奖励加成
  | 'free_attempt'     // 免费尝试
  | 'time_extension'   // 时间延长
  | 'damage_boost'     // 伤害加成
  | 'health_regen';    // 生命恢复

interface UnlockCondition {
  chapter?: string;              // 完成指定章节
  level?: number;                // 达到等级
  medicines?: number;            // 收集药材数
  battles?: number;              // 完成战斗数
}
```

### 2.10 对话历史 (Conversation)

```typescript
// models/conversation.ts
interface Conversation {
  id: string;
  chapterId: string;
  stage: number;                 // 所属阶段

  // 对话轮次
  turns: ConversationTurn[];

  // 元信息
  startTime: Date;
  endTime?: Date;
  totalTurns: number;
}

interface ConversationTurn {
  id: string;
  role: 'mentor' | 'user';
  type: TurnType;
  content: string;
  timestamp: Date;

  // 元数据
  metadata?: TurnMetadata;
}

type TurnType =
  | 'greeting'       // 问候
  | 'question'       // 提问
  | 'answer'         // 回答
  | 'feedback'       // 反馈
  | 'hint'           // 提示
  | 'socratic'       // 苏格拉底引导
  | 'celebration';   // 庆祝

interface TurnMetadata {
  questionId?: string;
  isCorrect?: boolean;
  expectedKeywords?: string[];
  difficulty?: number;
}
```

## 3. 数据验证 Schema

### 3.1 Zod Schema 示例

```typescript
// validation/playerSchema.ts
import { z } from 'zod';

export const PlayerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(20),
  diamonds: z.number().min(0).max(999999),
  level: z.number().int().min(1).max(50),
  stats: z.object({
    totalPlayTime: z.number().min(0),
    totalQuestions: z.number().min(0),
    correctAnswers: z.number().min(0),
    collectedMedicines: z.number().min(0).max(50),
    completedChapters: z.number().min(0).max(20),
  }),
});

export const ChapterProgressSchema = z.object({
  chapterId: z.string(),
  status: z.enum(['locked', 'available', 'in_progress', 'completed']),
  currentStage: z.number().int().min(1).max(6),
  completedStages: z.array(z.number().int()),
  collectedMedicines: z.array(z.string()),
  masteryLevel: z.number().min(0).max(100),
});
```

## 4. 数据迁移策略

### 4.1 v2.0 到 v3.0 迁移

```typescript
// migration/v2ToV3.ts
function migrateV2ToV3(v2Data: V2PlayerData): V3PlayerData {
  return {
    // 基础信息保留
    id: v2Data.id,
    name: v2Data.name,
    diamonds: v2Data.currency,
    reputation: v2Data.reputation || 0,

    // 新字段初始化
    level: calculateLevel(v2Data),
    exp: calculateExp(v2Data),
    title: getTitleByReputation(v2Data.reputation),

    // 进度迁移
    chapterProgress: migrateProgress(v2Data),

    // 统计迁移
    stats: {
      totalPlayTime: v2Data.totalPlayTime || 0,
      totalQuestions: v2Data.totalQuestions || 0,
      correctAnswers: v2Data.correctAnswers || 0,
      collectedMedicines: v2Data.collectedMedicines.length,
      completedChapters: 0, // 新系统，需要重新计算
      savedPatients: 0,
      maxCombo: 0,
      typingSpeed: 0,
    },
  };
}
```

## 5. 性能优化

### 5.1 索引设计

```typescript
// 需要索引的查询
const indexes = {
  'player.id': 'unique',
  'chapterProgress.chapterId': 'index',
  'chapterProgress.status': 'index',
  'medicine.category': 'index',
  'medicine.wuxing': 'index',
  'conversation.chapterId': 'index',
  'battle.chapterId': 'index',
};
```

### 5.2 数据分页

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

## 6. 待确认问题

1. **药材数据量**：50味药是否足够？是否需要扩展到100味？
2. **方剂数据**：20个方剂是否足够支撑20章？
3. **病案数据**：是否需要AI动态生成病案？
4. **对话历史**：是否需要长期保存？还是只保留最近N条？
5. **战斗数据**：是否需要保存战斗回放？
6. **离线支持**：是否需要完全离线可用？数据如何同步？

---

*文档状态: 详细设计*
*待确认: 数据量规划、离线策略*
