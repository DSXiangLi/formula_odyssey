# 药灵山谷 (Medicine Spirit Valley)

《方灵旅记》独立体验版本 - 一个东方幻想风格的中医方剂学习收集游戏。

## 游戏特色

- 🏔️ **五大探索区域**：高山、林间、花田、溪边、岩壁
- 🌿 **50味中药收集**：每味药都有详细的性味、功效、故事
- 💎 **水晶种子系统**：收集药灵种子，解锁药灵图鉴
- ❤️ **亲密度系统**：与药灵建立羁绊，解锁更多内容
- 🤖 **AI问答探索**：通过答题学习中医知识，获得奖励

## 技术栈

- React 18 + TypeScript
- Zustand (状态管理)
- Framer Motion (动画)
- Tailwind CSS (样式)
- Vite (构建工具)

## 快速开始

```bash
# 安装依赖
cd src
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 游戏玩法

1. **探索山谷**：在五大区域中点击水晶种子进行收集
2. **AI问答**：点击"探索"按钮回答问题，获得随机种子
3. **查看图鉴**：点击右上角图鉴按钮查看已收集的药灵
4. **培养亲密度**：与药灵互动，提升亲密度等级
5. **每日登录**：每天登录可获得种子和方灵点数奖励

## 亲密度等级

- ⭐ 初识 (0-20)
- ⭐⭐ 相识 (21-40)
- ⭐⭐⭐ 熟悉 (41-60) - 解锁药灵形象
- ⭐⭐⭐⭐ 亲密 (61-80) - 解锁记忆碎片
- ⭐⭐⭐⭐⭐ 知己 (81-100) - 解锁专属故事

## 项目结构

```
src/
├── components/
│   ├── ui/           # UI组件（导航、按钮等）
│   ├── scene/        # 场景组件（山谷、粒子效果）
│   ├── seed/         # 种子组件
│   ├── explore/      # 探索系统
│   └── collection/   # 图鉴系统
├── stores/           # Zustand状态管理
├── services/         # AI服务集成
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
└── styles/           # 全局样式
```

## 设计文档

- `design-output/核心玩法设计.md` - 游戏玩法设计
- `design-output/美术规范指南.md` - 视觉设计规范
- `design-output/AI生图Prompt模板.md` - AI生图模板
- `design-output/药灵数据配置.json` - 50味药数据

## 环境变量

如需使用AI生成功能，请在项目根目录创建 `.env.local` 文件：

```env
VITE_GLM_API_BASE=your_api_base
VITE_GLM_API_KEY=your_api_key
VITE_GLM_MODEL_NAME=glm-4
```

未配置API时，游戏将使用本地题库。

## 开发团队

- 策划 & 美术：团队负责人
- 全栈开发：团队负责人

## License

MIT
