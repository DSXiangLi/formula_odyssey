# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**《方灵旅记》** (Fang Ling Travelogue / Medicine Spirit Journey) is an AI-native educational game for learning Traditional Chinese Medicine (TCM) herbal formulas and pharmacology.

**Current Version: v2.0 五行归元版** - 从"收集游戏"升级为"中医专业学习模拟器"

### v2.0 核心设计哲学
- 以**五行学说**为骨架：金木水火土对应五脏、五方、五色、五季
- 以**性味归经**为玩法：药图、四气、五味、归经、功效五种探查方式，策略性获取信息
- 以**方剂追缉**为目标：每日明确的方剂收集任务，学以致用
- 以**临床实习**为归宿：将所学知识应用于病案分析

---

## Current Status

**药灵山谷 v2.0** 已完成核心架构设计，正在进行功能开发。

### 已完成内容
- `design-output/药灵山谷v2.0_五行归元版设计.md` - 完整2.0设计文档
- `design-output/药灵数据配置v2.0.json` - 50味药完整数据（含五行、四气五味、归经等）
- `design-output/方剂数据配置.json` - 20个经典方剂数据
- `design-output/临床病案数据.json` - 20个临床病案
- `src/` - React + TypeScript项目架构（v2.0数据模型已实现）

### 用户体验修复 (2026-03-21)

1. **方剂追缉令入口** - Navigation添加"📜 追缉令"按钮
2. **探查命名** - 改为"药图"、"四气"、"五味"、"归经"、"功效"
3. **药图显示** - 查看药图后显示清晰药物图片
4. **背景路径** - 修复场景背景图片路径
5. **追缉令刷新** - 改为1小时刷新（保留已接受的）
6. **种子显示** - 实现分批解锁机制

---

## Commands

### 启动开发服务器
```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm install
npm run dev
```

### 构建生产版本
```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run build
```

### 代码格式化
```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run format
```

---

## Tech Stack

### Frontend
- Framework: React + TypeScript
- State Management: Zustand (with persistence)
- Animations: Framer Motion
- Styling: CSS with custom properties

### AI Services
- **GLM** (智谱): Text generation via Volces API
- **Qwen-VL** (通义): Image understanding via DashScope
- **Seedream** (豆包): Image generation via Volces

---

## v2.0 五行归元系统

### 五行架构

| 五行 | 脏腑 | 方位 | 季节 | 代表色 | 区域名称 | 专属机制 |
|------|------|------|------|--------|----------|----------|
| **木** | 肝 | 东 | 春 | 青 | 青木林 | 春季生发 - 探索时有几率额外获得线索 |
| **火** | 心 | 南 | 夏 | 赤 | 赤焰峰 | 心主神明 - 首次猜测免费 |
| **土** | 脾 | 中 | 长夏 | 黄 | 黄土丘 | 脾主运化 - 线索价格降低20% |
| **金** | 肺 | 西 | 秋 | 白 | 白金原 | 肺主肃降 - 可以快速跳过当前种子 |
| **水** | 肾 | 北 | 冬 | 黑 | 黑水潭 | 肾藏精 - 收集成功后奖励翻倍 |

### 性味归经探查玩法

| 探查方式 | 消耗钻石 | 获取信息 | 解锁条件 |
|------|----------|----------|----------|
| **药图** | 0💎（免费） | 药物原图 + 五行归属 | 初始解锁 |
| **四气** | 5💎 | 四气（寒热温凉） | 初始解锁 |
| **五味** | 10💎 | 五味 + 毒性 | 收集10味药解锁 |
| **归经** | 15💎 | 升降浮沉 + 归经 | 收集20味药解锁 |
| **功效** | 20💎 | 功效主治完整信息 | 收集30味药解锁 |

### 猜测奖励机制

| 使用线索 | 猜测正确奖励 | 成就称号 |
|----------|--------------|----------|
| 仅用"药图"（0💎） | 100💎 + 亲密度+20 | "慧眼识药" |
| 用"药图+四气"（5💎） | 80💎 + 亲密度+15 | "闻香识药" |
| 用"药图+四气+五味"（15💎） | 60💎 + 亲密度+10 | "循序渐进" |
| 用"药图+四气+五味+归经"（30💎） | 40💎 + 亲密度+5 | "稳扎稳打" |
| 查看答案 | 0💎，仅获得基础收集 | "求学若渴" |

---

## Core Game Loop v2.0

```
探索五行区域 → 发现药灵种子 → 性味归经探查猜药 → 收集药材
       ↑                                            ↓
       └──── 方剂追缉令 ← 临床实习 ← 方剂图鉴 ←────┘
```

---

## Data Models

### Medicine (药灵数据)
```typescript
interface Medicine {
  id: string;
  name: string;
  pinyin: string;
  latinName: string;
  category: string;          // 功效分类
  wuxing: WuxingType;        // 五行归属

  // 中药专业属性
  fourQi: FourQi;            // 四气
  fiveFlavors: FiveFlavors[]; // 五味
  movement: Movement;        // 升降浮沉
  meridians: string[];       // 归经
  toxicity: string;          // 毒性
  functions: string[];       // 功效
  indications: string[];     // 主治
  contraindications: string[]; // 禁忌

  // 两层图片系统（纯中医游戏，无需显微镜视角）
  imagePlant: string;        // 原植物/矿物图
  imageHerb: string;         // 饮片图

  // 亲密度
  stories: string[];
  affinity: number;
  collected: boolean;
}
```

### Formula (方剂数据)
```typescript
interface Formula {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'challenge';
  composition: {
    medicineId: string;
    amount: string;
    role: 'jun' | 'chen' | 'zuo' | 'shi'; // 君臣佐使
  }[];
  functions: string[];
  indications: string[];
  song?: string;            // 方歌
  proficiency: number;      // 熟练度 0-5
}
```

### ClinicalCase (临床病案)
```typescript
interface ClinicalCase {
  id: string;
  formulaId: string;
  patientInfo: string;
  symptoms: string[];
  tongue: string;
  pulse: string;
  correctTreatment: string;
  correctFormula: string;
  correctJun: string;
  explanation: string;
}
```

---

## Content Scope (v2.0)

- **50味药** 完整五行归属、四气五味、归经数据
- **20个经典方剂** (麻黄汤、桂枝汤、四君子汤、四物汤等)
- **20个临床病案** 对应方剂实习
- **两层图片系统** (原植物/饮片)
- **五行场景** 专属机制与粒子效果

---

## Art Style

**东方幻想 + 精致游戏美术 (Oriental Fantasy + Polished Game Art)**

### 风格定位
- **场景背景**: AAA级游戏概念美术，非水墨画风格
- **核心元素**: 水晶、魔法、发光植物、生物荧光
- **光影效果**: 电影级光影 + 景深效果 (cinematic lighting, depth of field)
- **整体质感**: 精致、吸引人、一眼抓住用户的游戏场景

### 五行场景风格

**青木林 (木)** - 水晶竹林、发光藤蔓、生物荧光花朵、魔法萤火虫

**赤焰峰 (火)** - 红色水晶、熔岩魔法玻璃、飘浮余烬、凤凰羽毛

**黄土丘 (土)** - 金色水晶麦田、发光石圈、漂浮大地微粒、巨型金色蘑菇

**白金原 (金)** - 银色水晶桦树、漂浮银叶、铂金矿脉、镜面冰池

**黑水潭 (水)** - 黑曜石深潭、生物发光水下植物、悬浮冰晶、极光光芒

### 五行色彩
```css
/* 木行 - 青木林 */
--wood-primary: #2E7D32;
--wood-light: #81C784;

/* 火行 - 赤焰峰 */
--fire-primary: #C62828;
--fire-light: #EF5350;

/* 土行 - 黄土丘 */
--earth-primary: #F9A825;
--earth-light: #FFD54F;

/* 金行 - 白金原 */
--metal-primary: #78909C;
--metal-light: #B0BEC5;

/* 水行 - 黑水潭 */
--water-primary: #1565C0;
--water-light: #42A5F5;
```

---

## File Structure

```
/home/lixiang/Desktop/zhongyi_game/
├── CLAUDE.md                     # 项目指南
├── PROGRESS.md                   # 进度管理
├── design-output/                # 设计输出
│   ├── 药灵山谷v2.0_五行归元版设计.md
│   ├── 药灵数据配置v2.0.json    # 50味药数据
│   ├── 方剂数据配置.json        # 20个方剂
│   ├── 临床病案数据.json        # 20个病案
│   ├── 核心玩法设计.md
│   ├── 美术规范指南.md
│   └── AI生图Prompt模板.md
├── design/                       # 设计文档
│   ├── 方灵旅记_完整设计文档.md
│   ├── 分阶段开发详细规划.md
│   └── 交互设计_里程碑1_药灵山谷.md
└── src/                          # 源代码
    ├── App.tsx
    ├── main.tsx
    ├── types/index.ts            # TypeScript类型定义
    ├── stores/gameStore.ts       # Zustand状态管理
    ├── components/
    │   ├── scene/                # 场景组件
    │   ├── seed/                 # 种子组件
    │   ├── collection/           # 图鉴组件
    │   ├── explore/              # 探索组件
    │   ├── formula/              # 方剂组件
    │   ├── clinical/             # 临床组件
    │   └── ui/                   # UI组件
    ├── services/                 # AI服务
    ├── styles/                   # 样式文件
    └── utils/                    # 工具函数
```

---

## Next Steps

See `PROGRESS.md` for detailed development tasks and current status.

---

## Development Team

**Team Name**: yaoling-valley-v2

| 角色 | 职责 | 当前任务 |
|------|------|----------|
| **game-designer** | 游戏策略兼美术设计 | AI生图Prompt设计、数值平衡、视觉规范 |
| **fullstack-dev** | 全栈开发工程师 | 性味归经探查玩法、方剂系统、自动化测试 |

### 团队工作流程
1. 美术设计师完成Prompt设计 → 开发工程师实现生图脚本
2. 开发工程师实现功能 → AI自动化测试验证
3. 团队通过TaskList协调任务分配

---

## AI-First Development Strategy

### AI生图全自动化
- 所有图片资源由AI生图模型生成（Seedream/豆包）
- 专业美术设计Prompt模板，确保中医药专业标准
- 批量自动化流水线，一键生成155+张图片
- AI自动验证图片质量（Qwen-VL审核）

### AI自动化测试
- 零传统单元测试，100% AI驱动端到端测试
- Playwright + Qwen-VL + GLM-4V 测试架构
- 模拟真实用户操作，验证功能和视觉效果
- 每次提交自动触发测试，生成测试报告

---

*Version: v2.0*
*Last Updated: 2026-03-21*
