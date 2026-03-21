# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**《方灵旅记》** (Fang Ling Travelogue / Medicine Spirit Journey) is an AI-native educational game for learning Traditional Chinese Medicine (TCM) herbal formulas and pharmacology. The project is currently in the **design documentation phase** - no code implementation exists yet.

The game features:
- Players collect "medicine spirits" (药灵) in a fantasy valley
- Combine herbs into classical TCM formulas
- Card-based trials to learn herb characteristics
- AI-powered case studies for practical application

## Current Status

**药灵山谷独立游戏**已完成设计和基础架构搭建，可进入开发阶段。

### 已完成的文档
- `design/方灵旅记_完整设计文档.md` - 完整游戏设计
- `design/分阶段开发详细规划.md` - 分阶段开发计划
- `design/交互设计_里程碑1_药灵山谷.md` - 里程碑1交互设计

### 已完成的开发基础
- `design-output/核心玩法设计.md` - 药灵山谷核心玩法
- `design-output/美术规范指南.md` - 视觉设计规范
- `design-output/AI生图Prompt模板.md` - AI生图模板
- `design-output/药灵数据配置.json` - 50味药数据配置
- `src/` - React + TypeScript项目架构

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

### Frontend (Planned)
- Framework: React + TypeScript
- Stat  }e Management: Zustand
- Animations: Framer Motion + Canvas API
- Styling: CSS with custom properties

### Backend (Planned)
- Options: Node.js or Python FastAPI
- Database: PostgreSQL + Redis
- AI Services: Claude API / Local models

## Development Phases

**Phase 1 (MVP, 10 weeks):** Core game loop
- Week 1-2: Medicine Spirit Valley (collection/exploration)
- Week 3-4: Combination Workshop (herb mixing)
- Week 5-7: Card Trials (knowledge testing)
- Week 8-10: AI Case Clinic (practical application)

**Phase 2:** Strategy expansion (病机推演沙盘, 方剂创世工坊, etc.)

**Phase 3:** Complete闭环 (医圣之境, 成就系统, etc.)

## AI Services Configuration

API keys are configured in `.env`:
- **GLM** (智谱): Text generation via Volces API
- **Qwen-VL** (通义): Image understanding via DashScope
- **Seedream** (豆包): Image generation via Volces

## Core Game Loop

```
Explore Valley → Collect Seeds → Combine Herbs → Card Trials
     ↑                                                    ↓
     └────────── Apply Skills to Cases ←──────────────────┘
```

## Key Data Models

See design docs for full TypeScript interfaces:
- `MedicineSpirit` - Herb data with seed/herb/spirit images
- `MedicineTrial` - Card trial configuration
- `Formula` - Classical TCM formulas
- `Player` - Progress and collection state

## Content Scope (MVP)

- **50 herbs** across 17 TCM categories (解表药, 清热药, 补益药, etc.)
- **20-30 classical formulas** (麻黄汤, 桂枝汤, 四君子汤, etc.)
- **Affinity system** - Relationship building with medicine spirits
- **Skill tree** - Unlock abilities by mastering formulas

## Art Style

**New Chinese Style + Oriental Fantasy:**
- Colors: Ink black, vermillion red, gold foil, indigo
- Background: Rice paper texture + ink wash effects
- Three-stage visuals: Seeds → Real herbs → Anthropomorphized spirits

## Next Steps for Implementation

When beginning development:
1. Initialize React + TypeScript project
2. Set up design system with CSS custom properties
3. Implement Milestone 1: Medicine Spirit Valley scene
4. Configure AI service integrations for dynamic content
