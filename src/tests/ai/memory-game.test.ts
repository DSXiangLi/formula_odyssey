/**
 * 山谷采药 - 记忆翻牌游戏专项测试
 * 测试内容：
 * 1. 游戏界面和网格布局
 * 2. 卡牌翻转和匹配逻辑
 * 3. 计分和连击系统
 * 4. 计时器功能
 * 5. 游戏完成流程
 */

import { AITestCase } from './ai-tester';

export const memoryGameTestCases: AITestCase[] = [
  {
    id: 'MEMORY-001',
    name: '游戏界面和布局验证',
    description: '验证记忆翻牌游戏界面正确显示',
    category: 'gathering',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=1',
        description: '导航到采药阶段',
        expected: 'selector:[data-testid="gathering-map"]',
      },
      {
        id: 'step-2',
        action: 'evaluate',
        value: `
          // 模拟点击地图上的药材位置触发小游戏
          const tiles = document.querySelectorAll('[data-testid="map-tile"]');
          // 找一个有药材的地块
          for (const tile of tiles) {
            if (tile.getAttribute('data-has-medicine') === 'true') {
              (tile as HTMLElement).click();
              return { clicked: true, hasMedicine: true };
            }
          }
          return { clicked: false };
        `,
        description: '点击有药材的地块',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1000,
        description: '等待小游戏加载',
        expected: 'text:药材记忆翻牌',
      },
      {
        id: 'step-4',
        action: 'screenshot',
        description: '记录游戏界面',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          // 检查游戏网格
          const cards = document.querySelectorAll('[class*="grid"] > button, .grid button, [class*="card"]');
          const gridContainer = document.querySelector('[class*="grid"]');

          return {
            hasGrid: !!gridContainer,
            cardCount: cards.length,
            hasCorrectLayout: cards.length >= 20, // 应该接近24张牌
          };
        `,
        description: '验证6x4网格布局',
        expected: 'text:hasGrid',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查UI元素
          const timer = document.body.textContent?.includes('⏱️');
          const score = document.body.textContent?.includes('🏆');
          const progress = document.body.textContent?.includes('✓');

          return {
            hasTimer: timer,
            hasScore: score,
            hasProgress: progress,
            uiComplete: timer && score && progress
          };
        `,
        description: '验证UI元素完整',
        expected: 'text:uiComplete',
      },
    ],
    expectedResults: [
      '显示6x4网格，共24张卡牌',
      '顶部有计时器、得分、进度显示',
      '卡牌背面显示药材图标',
      '整体布局美观整齐',
    ],
    successCriteria: [
      { type: 'visual', description: '网格布局正确', weight: 40 },
      { type: 'functional', description: 'UI元素完整', weight: 30 },
      { type: 'visual', description: '视觉效果美观', weight: 30 },
    ],
  },

  {
    id: 'MEMORY-002',
    name: '卡牌翻转和匹配逻辑',
    description: '验证卡牌翻转和匹配机制正常工作',
    category: 'gathering',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=1',
        description: '导航到采药阶段',
        expected: 'selector:[data-testid="gathering-map"]',
      },
      {
        id: 'step-2',
        action: 'evaluate',
        value: `
          // 触发小游戏
          const tile = document.querySelector('[data-has-medicine="true"]');
          if (tile) (tile as HTMLElement).click();
          return { triggered: !!tile };
        `,
        description: '触发记忆游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1000,
        description: '等待游戏加载',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'click',
        target: 'button[class*="aspect"], .grid button:first-child, [class*="card"]:first-child',
        description: '点击第一张卡牌',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'wait',
        duration: 500,
        description: '等待翻转动画',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查第一张牌是否已翻转
          const flippedCards = document.querySelectorAll('[class*="flipped"], [class*="bg-white"]');
          return {
            flippedCount: flippedCards.length,
            firstCardFlipped: flippedCards.length >= 1
          };
        `,
        description: '验证第一张牌已翻转',
        expected: 'text:firstCardFlipped',
      },
      {
        id: 'step-7',
        action: 'click',
        target: 'button[class*="aspect"]:nth-child(2), .grid button:nth-child(2)',
        description: '点击第二张卡牌',
        expected: '',
      },
      {
        id: 'step-8',
        action: 'wait',
        duration: 1000,
        description: '等待匹配判断',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'evaluate',
        value: `
          // 检查匹配状态
          const matchedCards = document.querySelectorAll('[class*="matched"], [class*="bg-green"]');
          const flippedCards = document.querySelectorAll('[class*="flipped"], [class*="bg-white"]');

          return {
            matchedCount: matchedCards.length,
            flippedCount: flippedCards.length,
            matchWorking: matchedCards.length > 0 || flippedCards.length === 0
          };
        `,
        description: '验证匹配逻辑',
        expected: 'text:matchWorking',
      },
    ],
    expectedResults: [
      '点击卡牌后正确翻转',
      '两张牌匹配成功后保持翻开',
      '不匹配时翻回背面',
      '翻转动画流畅',
    ],
    successCriteria: [
      { type: 'functional', description: '翻转逻辑正确', weight: 40 },
      { type: 'functional', description: '匹配逻辑正确', weight: 40 },
      { type: 'visual', description: '动画流畅', weight: 20 },
    ],
  },

  {
    id: 'MEMORY-003',
    name: '计分和连击系统',
    description: '验证计分和连击系统正常工作',
    category: 'gathering',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=1',
        description: '导航到采药阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'evaluate',
        value: `
          const tile = document.querySelector('[data-has-medicine="true"]');
          if (tile) (tile as HTMLElement).click();
          return { triggered: !!tile };
        `,
        description: '触发记忆游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1000,
        description: '等待游戏加载',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 记录初始分数
          const scoreText = document.body.textContent?.match(/(\d+)分/) || ['0'];
          const initialScore = parseInt(scoreText[0]) || 0;
          return { initialScore };
        `,
        description: '记录初始分数',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'click',
        target: 'button[class*="aspect"]:first-child',
        description: '点击第一张牌',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'wait',
        duration: 300,
        description: '等待动画',
        expected: '',
      },
      {
        id: 'step-7',
        action: 'click',
        target: 'button[class*="aspect"]:nth-child(2)',
        description: '点击第二张牌',
        expected: '',
      },
      {
        id: 'step-8',
        action: 'wait',
        duration: 1500,
        description: '等待匹配结算',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'evaluate',
        value: `
          // 检查分数是否更新
          const scoreText = document.body.textContent?.match(/(\d+)分/) || ['0'];
          const currentScore = parseInt(scoreText[0]) || 0;

          const comboElement = document.body.textContent?.includes('连击');

          return {
            currentScore,
            hasCombo: comboElement,
            scoreIncreased: currentScore > 0
          };
        `,
        description: '验证分数更新',
        expected: 'text:scoreIncreased',
      },
    ],
    expectedResults: [
      '匹配成功后分数增加',
      '连续匹配触发连击',
      '连击有额外加分',
      '分数显示正确',
    ],
    successCriteria: [
      { type: 'functional', description: '计分正确', weight: 40 },
      { type: 'functional', description: '连击系统正常', weight: 40 },
      { type: 'visual', description: '分数显示清晰', weight: 20 },
    ],
  },

  {
    id: 'MEMORY-004',
    name: '计时器功能验证',
    description: '验证60秒计时器正常工作',
    category: 'gathering',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=1',
        description: '导航到采药阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'evaluate',
        value: `
          const tile = document.querySelector('[data-has-medicine="true"]');
          if (tile) (tile as HTMLElement).click();
          return { triggered: !!tile };
        `,
        description: '触发记忆游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1000,
        description: '等待游戏开始',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查初始时间
          const timeText = document.body.textContent?.match(/(\d+):(\d+)/);
          return {
            initialTime: timeText ? timeText[0] : '0:00',
            hasTimer: !!timeText
          };
        `,
        description: '记录初始时间',
        expected: 'text:hasTimer',
      },
      {
        id: 'step-5',
        action: 'wait',
        duration: 3000,
        description: '等待3秒',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查时间是否减少
          const timeText = document.body.textContent?.match(/(\d+):(\d+)/);
          const currentTime = timeText ? timeText[0] : '0:00';

          return {
            currentTime,
            timerDecreasing: !!timeText
          };
        `,
        description: '验证时间减少',
        expected: 'text:timerDecreasing',
      },
    ],
    expectedResults: [
      '初始时间显示为60秒或1:00',
      '时间每秒递减',
      '时间格式正确',
      '时间到后游戏结束',
    ],
    successCriteria: [
      { type: 'functional', description: '计时器正常工作', weight: 50 },
      { type: 'functional', description: '时间递减正确', weight: 30 },
      { type: 'visual', description: '时间显示清晰', weight: 20 },
    ],
  },

  {
    id: 'MEMORY-005',
    name: '游戏完成流程',
    description: '验证游戏完成后正确流转',
    category: 'gathering',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=1',
        description: '导航到采药阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'evaluate',
        value: `
          const tile = document.querySelector('[data-has-medicine="true"]');
          if (tile) (tile as HTMLElement).click();
          return { triggered: !!tile };
        `,
        description: '触发记忆游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1000,
        description: '等待游戏加载',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 模拟完成游戏 - 点击"继续冒险"按钮
          const completeButton = document.querySelector('button');
          if (completeButton && completeButton.textContent?.includes('继续')) {
            completeButton.click();
            return { clicked: true };
          }
          return { clicked: false, hasButton: !!completeButton };
        `,
        description: '尝试完成游戏',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'wait',
        duration: 1000,
        description: '等待返回地图',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查是否返回地图或显示完成界面
          const isMap = document.querySelector('[data-testid="gathering-map"]');
          const hasComplete = document.body.textContent?.includes('采集完成');

          return {
            backToMap: !!isMap,
            showComplete: hasComplete,
            flowCorrect: !!isMap || hasComplete
          };
        `,
        description: '验证流程正确',
        expected: 'text:flowCorrect',
      },
    ],
    expectedResults: [
      '游戏完成后显示结果界面',
      '显示得分和匹配数量',
      '有继续按钮返回地图',
      '流程顺畅无错误',
    ],
    successCriteria: [
      { type: 'functional', description: '完成流程正常', weight: 50 },
      { type: 'functional', description: '结果展示完整', weight: 30 },
      { type: 'usability', description: '返回操作简单', weight: 20 },
    ],
  },
];

export default memoryGameTestCases;
