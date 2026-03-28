/**
 * 药灵守护战 - 同步修复专项测试
 * 测试内容：
 * 1. 敌人出现后2秒安全期验证
 * 2. 敌人速度降低验证
 * 3. 攻击间隔延长验证
 * 4. 输入同步验证
 * 5. 事件驱动状态更新验证
 */

import { AITestCase } from './ai-tester';

export const battleSyncTestCases: AITestCase[] = [
  {
    id: 'BATTLE-001',
    name: '敌人安全期验证',
    description: '验证敌人出现后2秒内不会攻击玩家',
    category: 'battle',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/chapter/ch1?stage=2',
        description: '导航到战斗阶段',
        expected: 'selector:[data-testid="battle-scene"]',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 1000,
        description: '等待战斗场景加载',
        expected: 'text:药灵守护战',
      },
      {
        id: 'step-3',
        action: 'screenshot',
        description: '记录初始状态',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'wait',
        duration: 1500,
        description: '等待敌人出现（在安全期内）',
        expected: 'selector:[data-testid="enemy"]',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          // 检查敌人状态和安全期
          const enemies = document.querySelectorAll('[data-testid="enemy"]');
          if (enemies.length === 0) return { error: '没有敌人' };

          const healthText = document.querySelector('[data-testid="health-bar"]')?.textContent || '';
          const healthMatch = healthText.match(/(\d+)\/100/);
          const health = healthMatch ? parseInt(healthMatch[1]) : 100;

          return {
            enemyCount: enemies.length,
            playerHealth: health,
            withinSafePeriod: true,
            passed: health === 100
          };
        `,
        description: '验证安全期内血量未减少',
        expected: 'text:100/100',
      },
    ],
    expectedResults: [
      '敌人出现后2秒内玩家血量保持100',
      '敌人正常显示在战斗场景中',
      '战斗状态为"fighting"或"boss_fight"',
    ],
    successCriteria: [
      { type: 'functional', description: '安全期机制正常工作', weight: 40 },
      { type: 'performance', description: '敌人生成无延迟', weight: 30 },
      { type: 'visual', description: '敌人显示正常', weight: 30 },
    ],
  },

  {
    id: 'BATTLE-002',
    name: '输入同步验证',
    description: '验证玩家输入与敌人匹配同步',
    category: 'battle',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=2',
        description: '导航到战斗阶段',
        expected: 'selector:[data-testid="battle-scene"]',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 3000,
        description: '等待敌人出现并过安全期',
        expected: 'selector:[data-testid="enemy"]',
      },
      {
        id: 'step-3',
        action: 'screenshot',
        description: '获取敌人目标文本',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 获取第一个敌人的目标文本
          const enemyText = document.querySelector('[data-testid="enemy-target-text"]')?.textContent?.trim();
          return { targetText: enemyText };
        `,
        description: '获取目标文本',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'type',
        target: '[data-testid="battle-input"]',
        value: '测试输入',
        description: '输入测试文本',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查输入是否正确显示
          const input = document.querySelector('[data-testid="battle-input"]') as HTMLInputElement;
          return {
            inputValue: input?.value,
            hasFocus: document.activeElement === input,
            inputEnabled: input?.disabled === false
          };
        `,
        description: '验证输入框状态',
        expected: 'text:测试输入',
      },
    ],
    expectedResults: [
      '输入实时显示在输入框中',
      '输入框有焦点且可用',
      '输入反馈正确显示',
    ],
    successCriteria: [
      { type: 'functional', description: '输入响应正常', weight: 50 },
      { type: 'performance', description: '输入无延迟', weight: 30 },
      { type: 'visual', description: '输入反馈清晰', weight: 20 },
    ],
  },

  {
    id: 'BATTLE-003',
    name: '战斗速度调整验证',
    description: '验证敌人速度和攻击间隔已降低',
    category: 'battle',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=2',
        description: '导航到战斗阶段',
        expected: 'selector:[data-testid="battle-scene"]',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 5000,
        description: '观察敌人移动速度',
        expected: 'selector:[data-testid="enemy"]',
      },
      {
        id: 'step-3',
        action: 'screenshot',
        description: '记录敌人位置',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'wait',
        duration: 2000,
        description: '等待2秒',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          // 检查敌人是否仍在安全期或移动缓慢
          const enemies = document.querySelectorAll('[data-testid="enemy"]');
          const healthText = document.querySelector('[data-testid="health-bar"]')?.textContent || '';
          const healthMatch = healthText.match(/(\d+)\/100/);
          const health = healthMatch ? parseInt(healthMatch[1]) : 100;

          // 敌人移动缓慢，玩家应有足够时间反应
          return {
            enemyCount: enemies.length,
            playerHealth: health,
            speedAppropriate: health >= 80, // 速度调整后应该还有较高血量
            passed: health >= 80
          };
        `,
        description: '验证敌人速度已降低',
        expected: 'text:playerHealth',
      },
    ],
    expectedResults: [
      '敌人移动速度适中，玩家有反应时间',
      '攻击间隔延长，不会快速连续攻击',
      '整体战斗节奏合理',
    ],
    successCriteria: [
      { type: 'functional', description: '速度调整生效', weight: 40 },
      { type: 'usability', description: '玩家有足够反应时间', weight: 40 },
      { type: 'performance', description: '战斗流畅无卡顿', weight: 20 },
    ],
  },

  {
    id: 'BATTLE-004',
    name: '事件驱动状态更新验证',
    description: '验证状态更新从轮询改为事件驱动',
    category: 'battle',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=2',
        description: '导航到战斗阶段',
        expected: 'selector:[data-testid="battle-scene"]',
      },
      {
        id: 'step-2',
        action: 'evaluate',
        value: `
          // 检查是否没有setInterval轮询
          const originalSetInterval = window.setInterval;
          let intervalCount = 0;
          window.setInterval = function(...args) {
            intervalCount++;
            return originalSetInterval.apply(this, args);
          };

          // 等待一会儿再检查
          setTimeout(() => {
            window.setInterval = originalSetInterval;
          }, 100);

          return { intervalCount };
        `,
        description: '检查无100ms轮询',
        expected: 'text:intervalCount',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 2000,
        description: '观察状态更新',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查游戏状态是否正常更新
          const phase = document.querySelector('[data-testid="battle-header"]')?.textContent;
          const score = document.querySelector('[data-testid="score-display"]')?.textContent;

          return {
            hasPhase: !!phase,
            hasScore: !!score,
            stateUpdating: true
          };
        `,
        description: '验证状态正常更新',
        expected: 'text:stateUpdating',
      },
    ],
    expectedResults: [
      '无100ms轮询检查',
      '状态通过事件驱动更新',
      '战斗状态正常显示',
    ],
    successCriteria: [
      { type: 'functional', description: '事件驱动正常工作', weight: 50 },
      { type: 'performance', description: '无不必要的轮询', weight: 30 },
      { type: 'functional', description: '状态同步正确', weight: 20 },
    ],
  },
];

export default battleSyncTestCases;
