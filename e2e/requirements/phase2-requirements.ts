import { DesignRequirement } from '../types';

/**
 * Phase 2 地图系统验收标准
 */

export const mapGenerationRequirements: DesignRequirement = {
  name: '地图生成系统验收',
  criteria: [
    '地图应显示为6x6等角网格布局',
    '地图应根据章节五行属性显示对应主题色调',
    '地图中心应显示玩家起始位置标记',
    '地形类型应与五行偏好匹配（木-森林/火-山地/土-平原/金-洞穴/水-水域）',
    '应支持玩家点击相邻地块移动',
    '移动时应有平滑动画过渡',
  ],
  expectedElements: ['地图', '玩家', '地块', '移动'],
};

export const isometricRenderingRequirements: DesignRequirement = {
  name: '等角视角渲染验收',
  criteria: [
    'Canvas渲染应保持60fps流畅',
    '等角投影计算应准确（屏幕坐标与世界坐标转换正确）',
    '地形颜色应符合五行主题色调（木-青绿/火-赤红/土-黄褐/金-灰白/水-蓝黑）',
    '迷雾效果应正确覆盖未探索区域',
    '已访问地块应有视觉区分',
    '地块点击区域应准确响应',
  ],
  expectedElements: ['Canvas', '等角投影', '迷雾', '地形'],
};

/**
 * Phase 2 小游戏验收标准
 */

export const diggingMinigameRequirements: DesignRequirement = {
  name: '挖掘小游戏验收',
  criteria: [
    '应显示多层土壤结构（3-5层）',
    '力量条应在40%-60%区间有完美击打标记',
    '击打时应有视觉反馈（裂缝增加）',
    '完美击打应显示"完美"特效',
    '完成所有层后应显示采集结果',
    '稀有度应影响层数和难度',
  ],
  expectedElements: ['土壤', '力量条', '击打', '完美'],
};

export const tappingMinigameRequirements: DesignRequirement = {
  name: '敲击小游戏验收',
  criteria: [
    '应显示节奏节拍指示器',
    '应在正确时机显示击打提示',
    '连击时应有连击数显示',
    '完美击打应获得更高分数',
    '节奏应与药材稀有度匹配',
    '完成应显示评分和收集数量',
  ],
  expectedElements: ['节奏', '节拍', '连击', '评分'],
};

export const lassoMinigameRequirements: DesignRequirement = {
  name: '套索小游戏验收',
  criteria: [
    '应显示移动目标（动物/昆虫）',
    '套索应有投掷动画',
    '套中目标后应有拉取动画',
    '连续命中应增加分数',
    '达到目标分数应完成游戏',
    '稀有度应影响目标速度和分数要求',
  ],
  expectedElements: ['套索', '目标', '投掷', '分数'],
};

/**
 * 完整采集流程验收
 */
export const gatheringFlowRequirements: DesignRequirement = {
  name: '山谷采药完整流程验收',
  criteria: [
    '从章节入口应能进入采集关卡',
    '地图加载应在3秒内完成',
    '点击相邻地块应触发移动',
    '到达药材地块应触发小游戏',
    '完成小游戏应获得药材和货币',
    '采集状态应保存到localStorage',
    '收集足够药材应解锁下一阶段',
  ],
  expectedElements: ['采集', '地图', '小游戏', '药材'],
};
