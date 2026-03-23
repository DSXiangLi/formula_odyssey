# UI/UX 设计规范

## 1. 设计原则

### 1.1 核心原则

1. **中医文化底蕴** - 传统与现代结合
2. **游戏化学习** - 有趣不枯燥
3. **清晰易懂** - 降低认知负担
4. **沉浸体验** - 五行世界观贯穿

### 1.2 设计关键词

- 东方、古典、神秘、自然、和谐
- 精致、现代、流畅、反馈、愉悦

## 2. 色彩系统

### 2.1 五行色彩

```css
/* 青木林 - 木行 */
--wood-primary: #2E7D32;      /* 深青 */
--wood-secondary: #81C784;    /* 浅绿 */
--wood-accent: #1B5E20;       /* 墨绿 */
--wood-light: #E8F5E9;        /* 嫩绿背景 */

/* 赤焰峰 - 火行 */
--fire-primary: #C62828;      /* 赤红 */
--fire-secondary: #EF5350;    /* 浅红 */
--fire-accent: #8B0000;       /* 深红 */
--fire-light: #FFEBEE;        /* 粉红背景 */

/* 黄土丘 - 土行 */
--earth-primary: #F9A825;     /* 金黄 */
--earth-secondary: #FFD54F;   /* 浅黄 */
--earth-accent: #F57F17;      /* 橙黄 */
--earth-light: #FFF8E1;       /* 米黄背景 */

/* 白金原 - 金行 */
--metal-primary: #78909C;     /* 银灰 */
--metal-secondary: #B0BEC5;   /* 浅灰 */
--metal-accent: #546E7A;      /* 深灰 */
--metal-light: #ECEFF1;       /* 灰白背景 */

/* 黑水潭 - 水行 */
--water-primary: #1565C0;     /* 深蓝 */
--water-secondary: #42A5F5;   /* 浅蓝 */
--water-accent: #0D47A1;      /* 墨蓝 */
--water-light: #E3F2FD;       /* 淡蓝背景 */

/* 通用 */
--text-primary: #212121;      /* 主文字 */
--text-secondary: #757575;    /* 次要文字 */
--background: #FAFAFA;        /* 背景色 */
--surface: #FFFFFF;           /* 卡片背景 */
--border: #E0E0E0;            /* 边框 */
```

### 2.2 功能色彩

```css
/* 成功/错误 */
--success: #4CAF50;
--error: #F44336;
--warning: #FF9800;
--info: #2196F3;

/* 货币 */
--diamond: #FFD700;           /* 方灵石金色 */
--reputation: #9C27B0;        /* 声望紫色 */

/* 品质 */
--quality-legendary: #FF6D00; /* 极品橙 */
--quality-epic: #9C27B0;      /* 上品紫 */
--quality-rare: #2196F3;      /* 中品蓝 */
--quality-common: #9E9E9E;    /* 下品灰 */
```

## 3. 字体规范

### 3.1 字体选择

```css
/* 标题 - 书法风格 */
--font-display: 'Ma Shan Zheng', 'ZCOOL XiaoWei', cursive;

/* 正文 - 清晰可读 */
--font-body: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 英文/数字 */
--font-mono: 'SF Mono', 'Fira Code', monospace;
```

### 3.2 字体层级

| 层级 | 大小 | 字重 | 用途 |
|------|------|------|------|
| H1 | 32px | 700 | 章节标题 |
| H2 | 24px | 600 | 页面标题 |
| H3 | 20px | 600 | 卡片标题 |
| Body | 16px | 400 | 正文 |
| Small | 14px | 400 | 辅助文字 |
| Caption | 12px | 400 | 标签 |

## 4. 间距系统

### 4.1 基础间距

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-xxl: 48px;
```

### 4.2 布局间距

- 页面边距：24px
- 卡片间距：16px
- 按钮间距：12px
- 列表项间距：8px

## 5. 组件规范

### 5.1 按钮

```css
/* 主按钮 */
.btn-primary {
  background: var(--wood-primary);  /* 根据当前五行变化 */
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.btn-primary:active {
  transform: translateY(0);
}

/* 次要按钮 */
.btn-secondary {
  background: transparent;
  border: 2px solid var(--wood-primary);
  color: var(--wood-primary);
}

/* 禁用状态 */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 5.2 卡片

```css
.card {
  background: var(--surface);
  border-radius: 12px;
  padding: var(--space-lg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid var(--border);
}

.card-hover:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}
```

### 5.3 输入框

```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--wood-primary);
  outline: none;
}

.input-error {
  border-color: var(--error);
}
```

### 5.4 对话框

```
┌─────────────────────────────────┐
│  ┌────┐                         │
│  │ 👤 │ 青木先生                │
│  └────┘                         │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   对话框内容              │  │
│  │                           │  │
│  └───────────────────────────┘  │
│       [选项A] [选项B] [选项C]   │
└─────────────────────────────────┘
```

## 6. 页面布局

### 6.1 章节选择页

```
┌─────────────────────────────────────────────┐
│  🔙 返回    药灵山谷    💎 1234  👤 头像    │
├─────────────────────────────────────────────┤
│                                             │
│  【入门篇】  【基础篇】  【进阶篇】          │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 第1章  │ │ 第5章  │ │ 第9章  │          │
│  │  🟢   │ │  🔒   │ │  🔒   │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 第2章  │ │ 第6章  │ │ 第10章 │          │
│  │  ⚪   │ │  🔒   │ │  🔒   │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 第3章  │ │ 第7章  │ │ 第11章 │          │
│  │  ⚪   │ │  🔒   │ │  🔒   │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 第4章  │ │ 第8章  │ │ 第12章 │          │
│  │  🔵   │ │  🔒   │ │  🔒   │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### 6.2 战斗界面

```
┌─────────────────────────────────────────────┐
│  第3波/4  │  ⏱️ 00:23  │  ❤️ ██████░░ 80% │
├─────────────────────────────────────────────┤
│                                             │
│              👹 👹 👹 👹 👹                  │
│               ↓  ↓  ↓  ↓  ↓                 │
│                                             │
│   ╔═════════════════════════════════════╗   │
│   ║                                     ║   │
│   ║         🧙‍♂️ 药灵炼制中             ║   │
│   ║                                     ║   │
│   ╚═════════════════════════════════════╝   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  输入"发汗解表"击退前方邪灵！       │   │
│  │                                     │   │
│  │  [发________]                       │   │
│  │  fa han jie biao                    │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⚡ 连击: x15  🎯 准确率: 95%               │
│                                             │
└─────────────────────────────────────────────┘
```

## 7. 动画规范

### 7.1 过渡动画

```css
/* 页面切换 */
.page-transition {
  animation: fadeIn 0.3s ease;
}

/* 卡片悬停 */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 按钮点击 */
.btn-active {
  transition: transform 0.1s ease;
}
```

### 7.2 时长规范

- 微交互：100-200ms
- 页面切换：300ms
- 弹窗出现：200ms
- 加载动画：持续循环

## 8. 响应式设计

### 8.1 断点

```css
/* 移动端 */
@media (max-width: 768px) {
  /* 单列布局 */
  /* 底部导航 */
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 双列布局 */
}

/* 桌面 */
@media (min-width: 1025px) {
  /* 最优体验 */
}
```

### 8.2 移动端适配

- 底部固定导航栏
- 全屏战斗界面
- 触摸友好的按钮大小（最小44px）
- 横屏支持

## 9. 图标规范

### 9.1 图标库

- 主要：Remix Icon / Phosphor Icons
- 风格：线性、简洁、统一
- 大小：24px（标准）、20px（小）、32px（大）

### 9.2 图标示例

| 功能 | 图标 |
|------|------|
| 返回 | ← |
| 设置 | ⚙️ |
| 钻石 | 💎 |
| 生命 | ❤️ |
| 连击 | ⚡ |
| 时间 | ⏱️ |
| 地图 | 🗺️ |
| 背包 | 🎒 |

## 10. 反馈设计

### 10.1 操作反馈

```
点击按钮 → 缩放0.95 → 恢复
输入正确 → 绿色闪烁 + ✓
输入错误 → 红色抖动 + ✗
加载中 → 旋转动画
成功 → 粒子效果
```

### 10.2 提示设计

```
Toast提示：顶部出现，3秒消失
确认弹窗：重要操作二次确认
引导提示：首次使用引导
帮助按钮：随时查看说明
```

---

*文档状态: 详细设计*
*核心: 中医美学 + 现代交互 + 游戏反馈*
