# Phase 3: 药灵守护战斗系统 - AI端到端测试

## 测试概述

本测试套件覆盖Phase 3（药灵守护战斗系统）的端到端AI测试，使用Playwright + Qwen-VL进行自动化测试和视觉验收。

## 测试文件结构

```
e2e/
├── tests/phase3/
│   └── battle-system.spec.ts    # 主要测试文件
├── helpers/
│   └── battle-helper.ts         # 战斗系统测试工具
├── requirements/
│   └── phase3-requirements.ts   # AI验收标准
└── fixtures/
    └── game-fixtures.ts         # 测试固件（已更新）
```

## 测试用例覆盖

### 1. 战斗场景加载
- ✅ 正确加载战斗场景并显示所有UI元素
- ✅ 显示正确的初始状态（血量、得分、波次）

### 2. 四波次系统
- ✅ 正确显示四波次进度
- ✅ 第1波显示药名辨识敌人
- ✅ 击败敌人后推进到下一波

### 3. 输入系统
- ✅ 支持中文输入击败敌人
- ✅ 支持拼音输入击败敌人
- ✅ 错误输入允许重新输入
- ✅ 输入视觉反馈AI验收

### 4. 技能系统
- ✅ 显示5个技能图标
- ✅ 使用回春术恢复血量
- ✅ 技能系统AI视觉验收

### 5. 连击系统
- ✅ 连续正确输入增加连击数
- ✅ 错误输入重置连击

### 6. 战斗结算
- ✅ 战斗胜利显示结算界面
- ✅ 战斗结果正确统计

### 7. AI视觉验收
- ✅ 战斗系统整体视觉验收
- ✅ 四波次系统视觉验收

## 运行测试

### 运行所有Phase 3测试
```bash
npx playwright test e2e/tests/phase3/battle-system.spec.ts
```

### 运行特定测试组
```bash
# 仅运行输入系统测试
npx playwright test e2e/tests/phase3/battle-system.spec.ts --grep "输入系统"

# 仅运行技能系统测试
npx playwright test e2e/tests/phase3/battle-system.spec.ts --grep "技能系统"

# 仅运行AI视觉验收
npx playwright test e2e/tests/phase3/battle-system.spec.ts --grep "AI视觉验收"
```

### 调试模式运行
```bash
npx playwright test e2e/tests/phase3/battle-system.spec.ts --debug
```

### 查看测试报告
```bash
npx playwright show-report
```

## AI验收标准

根据`e2e/requirements/phase3-requirements.ts`中的定义：

### 战斗系统验收 (battleSystemRequirements)
- 4波次进度指示器显示
- 敌人从上方出现并向底部移动
- 目标文本可见
- 输入框支持中文和拼音
- 正确输入后敌人被击退
- 连击系统显示倍率
- 技能栏显示5个技能
- 玩家血量显示
- 战斗胜利后结算界面

### 四波次系统验收 (battleWaveRequirements)
- 第1波（药名辨识）：5个普通敌人
- 第2波（性味归经）：5个普通敌人
- 第3波（功效主治）：3个精英敌人
- 第4波（方剂对决）：1个BOSS敌人
- 每波之间过渡动画
- 波次难度递增

### 输入系统验收 (battleInputRequirements)
- 精确中文匹配
- 拼音全拼匹配
- 拼音首字母匹配
- 实时视觉反馈
- 错误输入处理
- 攻击动画触发

### 技能系统验收 (battleSkillRequirements)
- 定身术：减缓敌人50%速度
- 群体净化：清除3个敌人
- 回春术：恢复30点生命
- 护盾术：5秒无敌
- 灵光一现：显示答案3秒

### 连击系统验收 (battleComboRequirements)
- 连续正确输入增加连击
- 连击数实时显示
- 每10连击增加0.1倍率
- 错误输入重置连击
- 最高连击数统计
- 连击视觉特效

## 评分标准

根据`06-testing-strategy.md`：

| 等级 | 分数 | 说明 |
|------|------|------|
| S | 95+ | 优秀，可直接发布 |
| A | 85-94 | 良好，小优化后发布 |
| B | 70-84 | 及格，需要改进 |
| C | 60-69 | 不及格，需大修 |
| F | <60 | 不可用 |

**Phase 3通过标准：总分 ≥ 85分（A级）**

## 已知问题

1. 单元测试中存在1个MapGenerator测试失败（与Phase 3无关）
2. TypeScript类型检查有一些既有错误（在stores/hooks.ts中）

## 下一步

1. 运行测试并收集AI评分
2. 根据AI反馈修复问题
3. 优化战斗系统直到达到A级标准
4. 集成到CI/CD流程

## 相关文档

- [测试策略文档](../../design-output/v3.0-specs/tech/06-testing-strategy.md)
- [Phase 3 实施计划](../../docs/superpowers/plans/2026-03-25-phase3-knowledge-battle.md)
