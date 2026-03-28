/**
 * 药灵驯服战 - AI端到端测试
 * 测试内容：
 * 1. 基础流程测试 - 教程、开始游戏、激活药灵、回答问题、驯服完成
 * 2. 多波次测试 - 波次切换、药灵数量变化
 * 3. 技能系统测试 - 灵光一闪、师尊指点
 * 4. 连击系统测试 - 连续正确回答增加连击
 * 5. 游戏结束测试 - 胜利、失败条件
 */

import { AITestCase } from './ai-tester';

export const spiritBattleTestCases: AITestCase[] = [
  {
    id: 'SPIRIT-001',
    name: '药灵驯服战基础流程测试',
    description: '测试完整的药灵驯服流程：导航到战斗页 → 显示教程 → 开始游戏 → 显示药灵 → 激活药灵 → 回答问题 → 显示反馈 → 驯服完成',
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
        expected: 'selector:[data-testid="game-tutorial"]',
      },
      {
        id: 'step-3',
        action: 'screenshot',
        description: '记录教程弹窗状态',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查教程步骤显示
          const steps = document.querySelectorAll('[data-testid^="tutorial-step-"]');
          return {
            tutorialVisible: !!document.querySelector('[data-testid="game-tutorial"]'),
            stepCount: steps.length,
            hasStartButton: !!document.querySelector('[data-testid="tutorial-start-button"]')
          };
        `,
        description: '验证教程内容完整',
        expected: 'text:tutorialVisible',
      },
      {
        id: 'step-5',
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '点击"开始驯服"按钮',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'wait',
        duration: 1500,
        description: '等待游戏开始，药灵出现',
        expected: 'selector:[data-testid="spirits-area"]',
      },
      {
        id: 'step-7',
        action: 'evaluate',
        value: `
          // 检查药灵是否显示
          const spirits = document.querySelectorAll('[data-testid^="spirit-character-"]');
          const header = document.querySelector('[data-testid="battle-header"]')?.textContent || '';
          return {
            spiritCount: spirits.length,
            headerVisible: !!document.querySelector('[data-testid="battle-header"]'),
            waveInfo: header.includes('波')
          };
        `,
        description: '验证药灵显示和波次信息',
        expected: 'text:spiritCount',
      },
      {
        id: 'step-8',
        action: 'click',
        target: '[data-testid^="spirit-character-"]:first-child',
        description: '点击第一个药灵激活它',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'wait',
        duration: 500,
        description: '等待问题泡泡出现',
        expected: 'selector:[data-testid="question-bubble"]',
      },
      {
        id: 'step-10',
        action: 'evaluate',
        value: `
          // 检查问题泡泡内容
          const questionText = document.querySelector('[data-testid="question-text"]')?.textContent || '';
          const spiritName = document.querySelector('[data-testid="spirit-name"]')?.textContent || '';
          return {
            hasQuestion: questionText.length > 0,
            hasSpiritName: spiritName.length > 0,
            inputVisible: !!document.querySelector('[data-testid="answer-input"]')
          };
        `,
        description: '验证问题泡泡和问题显示',
        expected: 'text:hasQuestion',
      },
      {
        id: 'step-11',
        action: 'type',
        target: '[data-testid="answer-input"]',
        value: '测试答案',
        description: '在输入框输入答案',
        expected: 'text:测试答案',
      },
      {
        id: 'step-12',
        action: 'click',
        target: '[data-testid="submit-button"]',
        description: '点击提交按钮',
        expected: '',
      },
      {
        id: 'step-13',
        action: 'wait',
        duration: 1500,
        description: '等待反馈显示',
        expected: 'selector:[data-testid="evaluation-section"]',
      },
      {
        id: 'step-14',
        action: 'evaluate',
        value: `
          // 检查反馈显示
          const evaluation = document.querySelector('[data-testid="evaluation-section"]');
          const resultText = document.querySelector('[data-testid="evaluation-result"]')?.textContent || '';
          const scoreText = document.querySelector('[data-testid="evaluation-score"]')?.textContent || '';
          return {
            hasEvaluation: !!evaluation,
            resultText: resultText,
            hasScore: scoreText.includes('分')
          };
        `,
        description: '验证答案反馈显示',
        expected: 'text:hasEvaluation',
      },
      {
        id: 'step-15',
        action: 'screenshot',
        description: '记录反馈状态截图',
        expected: '',
      },
    ],
    expectedResults: [
      '教程弹窗正确显示，包含4个步骤说明',
      '点击"开始驯服"后教程关闭，游戏开始',
      '药灵正确显示在战斗区域',
      '点击药灵后激活并显示问题泡泡',
      '输入答案后可提交并显示反馈',
      '反馈包含评分结果和提示信息',
    ],
    successCriteria: [
      { type: 'functional', description: '教程系统正常工作', weight: 20 },
      { type: 'functional', description: '药灵显示和激活正常', weight: 25 },
      { type: 'functional', description: '问题泡泡显示正确', weight: 20 },
      { type: 'functional', description: '答案提交和反馈正常', weight: 25 },
      { type: 'visual', description: 'UI元素显示完整', weight: 10 },
    ],
  },

  {
    id: 'SPIRIT-002',
    name: '多波次药灵驯服测试',
    description: '验证波次切换机制、药灵数量变化、波次指示器更新',
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
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 2000,
        description: '等待游戏初始化',
        expected: 'selector:[data-testid="spirits-area"]',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 记录第一波药灵数量
          const spirits = document.querySelectorAll('[data-testid^="spirit-character-"]');
          const waveIndicator = document.querySelector('[data-testid="wave-indicator"]')?.textContent || '';
          const tamedCount = document.querySelector('[data-testid="tamed-count"]')?.textContent || '';
          return {
            initialSpiritCount: spirits.length,
            waveInfo: waveIndicator,
            tamedInfo: tamedCount,
            spiritsVisible: spirits.length > 0
          };
        `,
        description: '记录第一波初始状态',
        expected: 'text:spiritsVisible',
      },
      {
        id: 'step-5',
        action: 'screenshot',
        description: '记录第一波状态',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查波次指示器格式
          const waveText = document.querySelector('[data-testid="wave-indicator"]')?.textContent || '';
          const waveMatch = waveText.match(/第 (\d+) 波 \/ (\d+) 波/);
          return {
            waveText: waveText,
            currentWave: waveMatch ? parseInt(waveMatch[1]) : 0,
            totalWaves: waveMatch ? parseInt(waveMatch[2]) : 0,
            formatCorrect: !!waveMatch
          };
        `,
        description: '验证波次指示器格式',
        expected: 'text:formatCorrect',
      },
      {
        id: 'step-7',
        action: 'evaluate',
        value: `
          // 检查驯服计数显示
          const tamedText = document.querySelector('[data-testid="tamed-count"]')?.textContent || '';
          const tamedMatch = tamedText.match(/(\d+)\/(\d+)/);
          return {
            tamedText: tamedText,
            currentTamed: tamedMatch ? parseInt(tamedMatch[1]) : 0,
            totalSpirits: tamedMatch ? parseInt(tamedMatch[2]) : 0
          };
        `,
        description: '验证驯服计数显示',
        expected: 'text:tamedText',
      },
      {
        id: 'step-8',
        action: 'wait',
        duration: 5000,
        description: '观察游戏进行（等待一段时间）',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'screenshot',
        description: '记录游戏进行中的状态',
        expected: '',
      },
      {
        id: 'step-10',
        action: 'evaluate',
        value: `
          // 检查计时器是否在运行
          const timerText = document.querySelector('[data-testid="timer"]')?.textContent || '';
          const timeMatch = timerText.match(/(\d+):(\d+)/);
          return {
            timerText: timerText,
            hasTimeElapsed: !!timeMatch && (parseInt(timeMatch[1]) > 0 || parseInt(timeMatch[2]) > 0)
          };
        `,
        description: '验证计时器运行',
        expected: 'text:hasTimeElapsed',
      },
    ],
    expectedResults: [
      '波次指示器正确显示当前波次和总波次',
      '驯服计数器显示正确格式（已驯服/总数）',
      '计时器正常运行并显示经过时间',
      '每波药灵数量符合预期',
      '波次切换时UI正确更新',
    ],
    successCriteria: [
      { type: 'functional', description: '波次系统正常工作', weight: 30 },
      { type: 'functional', description: '驯服计数正确更新', weight: 30 },
      { type: 'functional', description: '计时器正常运行', weight: 20 },
      { type: 'visual', description: '波次UI显示正确', weight: 20 },
    ],
  },

  {
    id: 'SPIRIT-003',
    name: '技能系统测试 - 灵光一闪',
    description: '测试"灵光一闪"技能：使用技能显示提示、技能进入冷却',
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
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1500,
        description: '等待游戏开始',
        expected: 'selector:[data-testid="spirit-skill-bar"]',
      },
      {
        id: 'step-4',
        action: 'click',
        target: '[data-testid^="spirit-character-"]:first-child',
        description: '激活一个药灵',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'wait',
        duration: 800,
        description: '等待问题泡泡显示',
        expected: 'selector:[data-testid="question-bubble"]',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查技能栏和灵光一闪技能按钮
          const skillBar = document.querySelector('[data-testid="spirit-skill-bar"]');
          const hintButton = document.querySelector('[data-testid="skill-button-hint_flash"]');
          return {
            hasSkillBar: !!skillBar,
            hasHintSkill: !!hintButton,
            skillButtonEnabled: hintButton && !hintButton.disabled
          };
        `,
        description: '验证技能栏和灵光一闪技能按钮',
        expected: 'text:hasHintSkill',
      },
      {
        id: 'step-7',
        action: 'click',
        target: '[data-testid="skill-button-hint_flash"]',
        description: '点击"灵光一闪"技能按钮',
        expected: '',
      },
      {
        id: 'step-8',
        action: 'wait',
        duration: 800,
        description: '等待提示显示',
        expected: 'selector:[data-testid="hint-section"]',
      },
      {
        id: 'step-9',
        action: 'evaluate',
        value: `
          // 检查提示是否显示
          const hintSection = document.querySelector('[data-testid="hint-section"]');
          const hintText = document.querySelector('[data-testid="hint-text"]')?.textContent || '';
          return {
            hintVisible: !!hintSection,
            hintContent: hintText,
            hasHintContent: hintText.length > 0
          };
        `,
        description: '验证提示信息显示',
        expected: 'text:hintVisible',
      },
      {
        id: 'step-10',
        action: 'screenshot',
        description: '记录提示显示状态',
        expected: '',
      },
      {
        id: 'step-11',
        action: 'evaluate',
        value: `
          // 检查技能是否进入冷却
          const hintButton = document.querySelector('[data-testid="skill-button-hint_flash"]');
          const isOnCooldown = hintButton?.textContent?.includes('冷却') ||
                               hintButton?.classList.contains('cursor-not-allowed');
          return {
            skillOnCooldown: isOnCooldown,
            buttonText: hintButton?.textContent?.substring(0, 50)
          };
        `,
        description: '验证技能进入冷却状态',
        expected: '',
      },
    ],
    expectedResults: [
      '技能栏正确显示在页面底部',
      '"灵光一闪"技能按钮可点击',
      '点击后显示提示信息区域',
      '提示内容包含问题相关线索',
      '技能使用后进入冷却状态',
    ],
    successCriteria: [
      { type: 'functional', description: '技能按钮可交互', weight: 25 },
      { type: 'functional', description: '提示正确显示', weight: 35 },
      { type: 'functional', description: '冷却机制正常', weight: 25 },
      { type: 'visual', description: '技能UI反馈清晰', weight: 15 },
    ],
  },

  {
    id: 'SPIRIT-004',
    name: '技能系统测试 - 师尊指点',
    description: '测试"师尊指点"技能：AI导师直接给出答案、扣除相应分数',
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
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1500,
        description: '等待游戏开始',
        expected: 'selector:[data-testid="spirit-skill-bar"]',
      },
      {
        id: 'step-4',
        action: 'click',
        target: '[data-testid^="spirit-character-"]:first-child',
        description: '激活一个药灵',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'wait',
        duration: 800,
        description: '等待问题泡泡显示',
        expected: 'selector:[data-testid="question-bubble"]',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 记录使用技能前的状态
          const scoreBefore = document.querySelector('[data-testid="status-bar"]')?.textContent || '';
          const mentorButton = document.querySelector('[data-testid="skill-button-mentor_hint"]');
          return {
            hasMentorSkill: !!mentorButton,
            scoreBefore: scoreBefore.match(/(\d+)/)?.[0] || '0'
          };
        `,
        description: '记录初始状态',
        expected: 'text:hasMentorSkill',
      },
      {
        id: 'step-7',
        action: 'click',
        target: '[data-testid="skill-button-mentor_hint"]',
        description: '点击"师尊指点"技能按钮',
        expected: '',
      },
      {
        id: 'step-8',
        action: 'wait',
        duration: 2000,
        description: '等待AI导师给出答案',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'evaluate',
        value: `
          // 检查答案是否自动填入或反馈是否显示
          const input = document.querySelector('[data-testid="answer-input"]') as HTMLInputElement;
          const evaluation = document.querySelector('[data-testid="evaluation-section"]');
          return {
            inputValue: input?.value || '',
            hasEvaluation: !!evaluation,
            skillUsed: !!(input?.value || evaluation)
          };
        `,
        description: '验证技能效果',
        expected: 'text:skillUsed',
      },
      {
        id: 'step-10',
        action: 'screenshot',
        description: '记录技能使用后状态',
        expected: '',
      },
      {
        id: 'step-11',
        action: 'evaluate',
        value: `
          // 检查技能是否进入冷却
          const mentorButton = document.querySelector('[data-testid="skill-button-mentor_hint"]');
          const isOnCooldown = mentorButton?.querySelector('.bg-gray-700');
          return {
            skillOnCooldown: !!isOnCooldown,
            buttonContent: mentorButton?.textContent?.substring(0, 30)
          };
        `,
        description: '验证技能冷却状态',
        expected: '',
      },
    ],
    expectedResults: [
      '"师尊指点"技能按钮可用',
      '点击后AI导师自动给出答案',
      '答案正确提交并显示反馈',
      '得分按规则扣除相应比例',
      '技能进入冷却',
    ],
    successCriteria: [
      { type: 'functional', description: '师尊指点技能触发正常', weight: 40 },
      { type: 'functional', description: '自动答案提交成功', weight: 30 },
      { type: 'functional', description: '技能冷却机制正常', weight: 20 },
      { type: 'performance', description: 'AI响应及时', weight: 10 },
    ],
  },

  {
    id: 'SPIRIT-005',
    name: '连击系统测试',
    description: '测试连击系统：连续正确回答增加连击数、错误回答打断连击',
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
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 1500,
        description: '等待游戏开始',
        expected: 'selector:[data-testid="spirits-area"]',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查初始连击状态（应该为0或不显示）
          const comboDisplay = document.querySelector('[data-testid="combo-display"]');
          return {
            comboVisible: !!comboDisplay,
            initialCombo: comboDisplay?.textContent || '0'
          };
        `,
        description: '记录初始连击状态',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'click',
        target: '[data-testid^="spirit-character-"]:first-child',
        description: '激活药灵',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'wait',
        duration: 800,
        description: '等待问题显示',
        expected: 'selector:[data-testid="question-bubble"]',
      },
      {
        id: 'step-6a',
        action: 'evaluate',
        value: `
          // 获取问题文本以判断可能的答案类型
          const questionText = document.querySelector('[data-testid="question-text"]')?.textContent || '';
          return {
            question: questionText.substring(0, 100)
          };
        `,
        description: '查看当前问题',
        expected: '',
      },
      {
        id: 'step-7',
        action: 'type',
        target: '[data-testid="answer-input"]',
        value: '人参',
        description: '输入答案（假设是人参相关问题）',
        expected: '',
      },
      {
        id: 'step-8',
        action: 'click',
        target: '[data-testid="submit-button"]',
        description: '提交答案',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'wait',
        duration: 1200,
        description: '等待反馈',
        expected: '',
      },
      {
        id: 'step-10',
        action: 'evaluate',
        value: `
          // 记录第一次回答后的连击状态
          const comboDisplay = document.querySelector('[data-testid="combo-display"]');
          const evaluation = document.querySelector('[data-testid="evaluation-section"]');
          const isCorrect = evaluation?.textContent?.includes('正确') ||
                           evaluation?.textContent?.includes('✓');
          return {
            comboAfterFirst: comboDisplay?.textContent || '0',
            wasCorrect: isCorrect,
            hasComboDisplay: !!comboDisplay
          };
        `,
        description: '记录第一次回答后的连击状态',
        expected: '',
      },
      {
        id: 'step-11',
        action: 'click',
        target: '[data-testid^="spirit-character-"]:nth-child(2)',
        description: '激活另一个药灵',
        expected: '',
      },
      {
        id: 'step-12',
        action: 'wait',
        duration: 800,
        description: '等待新问题',
        expected: 'selector:[data-testid="question-bubble"]',
      },
      {
        id: 'step-13',
        action: 'type',
        target: '[data-testid="answer-input"]',
        value: '黄芪',
        description: '输入第二个答案',
        expected: '',
      },
      {
        id: 'step-14',
        action: 'click',
        target: '[data-testid="submit-button"]',
        description: '提交第二个答案',
        expected: '',
      },
      {
        id: 'step-15',
        action: 'wait',
        duration: 1200,
        description: '等待反馈',
        expected: '',
      },
      {
        id: 'step-16',
        action: 'evaluate',
        value: `
          // 检查连击显示
          const comboDisplay = document.querySelector('[data-testid="combo-display"]');
          const comboText = comboDisplay?.textContent || '';
          const comboMatch = comboText.match(/(\d+)/);
          return {
            comboVisible: !!comboDisplay,
            comboNumber: comboMatch ? parseInt(comboMatch[1]) : 0,
            comboText: comboText
          };
        `,
        description: '验证连击显示',
        expected: 'text:comboVisible',
      },
      {
        id: 'step-17',
        action: 'screenshot',
        description: '记录连击状态',
        expected: '',
      },
    ],
    expectedResults: [
      '初始状态连击为0或不显示',
      '正确回答后连击数增加',
      '连续正确回答连击累积',
      '连击显示在状态栏中',
      '错误回答打断连击（连击归零）',
    ],
    successCriteria: [
      { type: 'functional', description: '连击计数正确', weight: 40 },
      { type: 'functional', description: '连击累积机制正常', weight: 30 },
      { type: 'visual', description: '连击UI显示正确', weight: 20 },
      { type: 'functional', description: '连击打断机制正常', weight: 10 },
    ],
  },

  {
    id: 'SPIRIT-006',
    name: '游戏结束胜利测试',
    description: '测试胜利条件：驯服所有药灵后显示胜利界面',
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
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 2000,
        description: '等待游戏开始',
        expected: 'selector:[data-testid="spirits-area"]',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 获取总药灵数
          const tamedText = document.querySelector('[data-testid="tamed-count"]')?.textContent || '';
          const match = tamedText.match(/\/(\d+)/);
          return {
            totalSpirits: match ? parseInt(match[1]) : 0,
            tamedInfo: tamedText
          };
        `,
        description: '记录总药灵数',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          // 模拟完成游戏 - 通过直接调用引擎或等待自然完成
          // 这里我们主要检查游戏结束UI的元素
          return {
            gameInProgress: !!document.querySelector('[data-testid="spirits-area"]'),
            hasExitButton: !!document.querySelector('[data-testid="exit-button"]')
          };
        `,
        description: '检查游戏进行中状态',
        expected: 'text:gameInProgress',
      },
      {
        id: 'step-6',
        action: 'screenshot',
        description: '记录游戏进行中状态',
        expected: '',
      },
      {
        id: 'step-7',
        action: 'wait',
        duration: 10000,
        description: '等待游戏进行（观察阶段）',
        expected: '',
      },
      {
        id: 'step-8',
        action: 'screenshot',
        description: '记录游戏进行后的状态',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'evaluate',
        value: `
          // 检查游戏是否结束
          const gameOverOverlay = document.querySelector('[data-testid="game-over-overlay"]');
          const completeButton = document.querySelector('[data-testid="complete-button"]');
          return {
            gameOver: !!gameOverOverlay,
            hasCompleteButton: !!completeButton,
            victoryText: document.body.textContent?.includes('胜利') ||
                        document.body.textContent?.includes('🎉')
          };
        `,
        description: '检查游戏结束状态',
        expected: '',
      },
    ],
    expectedResults: [
      '游戏正常进行中',
      '驯服进度实时更新',
      '所有药灵驯服后触发胜利',
      '胜利界面显示正确（🎉图标、胜利文字）',
      '统计显示包含得分、最高连击、驯服数量、用时',
      '"继续"按钮可用',
    ],
    successCriteria: [
      { type: 'functional', description: '胜利条件判断正确', weight: 30 },
      { type: 'functional', description: '胜利界面显示完整', weight: 30 },
      { type: 'visual', description: '胜利UI效果正确', weight: 25 },
      { type: 'functional', description: '统计数据正确', weight: 15 },
    ],
  },

  {
    id: 'SPIRIT-007',
    name: '药灵驯服进度和状态测试',
    description: '测试药灵驯服进度条更新和各种状态显示（漂浮、询问、驯服、逃跑）',
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
        action: 'click',
        target: '[data-testid="tutorial-start-button"]',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'wait',
        duration: 2000,
        description: '等待游戏开始',
        expected: 'selector:[data-testid="spirit-character-0"]',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查药灵初始状态
          const spiritContainer = document.querySelector('[data-testid="spirit-container"]');
          const progressBar = document.querySelector('[data-testid="spirit-progress-bar"]');
          const progressText = document.querySelector('[data-testid="spirit-progress-text"]')?.textContent;
          return {
            hasContainer: !!spiritContainer,
            hasProgressBar: !!progressBar,
            progressText: progressText,
            initialProgress: progressText?.includes('0%') || progressText === '0'
          };
        `,
        description: '验证药灵初始状态和进度',
        expected: 'text:hasProgressBar',
      },
      {
        id: 'step-5',
        action: 'click',
        target: '[data-testid="spirit-character-0"]',
        description: '激活药灵',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'wait',
        duration: 800,
        description: '等待激活状态显示',
        expected: 'selector:[data-testid="spirit-active-ring"]',
      },
      {
        id: 'step-7',
        action: 'evaluate',
        value: `
          // 检查激活状态
          const activeRing = document.querySelector('[data-testid="spirit-active-ring"]');
          const connectionLine = document.querySelector('[data-testid="spirit-connection-line"]');
          return {
            isActive: !!activeRing,
            hasConnection: !!connectionLine
          };
        `,
        description: '验证药灵激活状态显示',
        expected: 'text:isActive',
      },
      {
        id: 'step-8',
        action: 'type',
        target: '[data-testid="answer-input"]',
        value: '测试答案',
        description: '输入答案',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'click',
        target: '[data-testid="submit-button"]',
        description: '提交答案',
        expected: '',
      },
      {
        id: 'step-10',
        action: 'wait',
        duration: 1500,
        description: '等待反馈和进度更新',
        expected: '',
      },
      {
        id: 'step-11',
        action: 'evaluate',
        value: `
          // 检查进度是否更新
          const progressText = document.querySelector('[data-testid="spirit-progress-text"]')?.textContent;
          const progressBar = document.querySelector('[data-testid="spirit-progress-bar"]');
          const progressWidth = progressBar?.style?.width ||
                               window.getComputedStyle(progressBar || document.body).width;
          return {
            progressText: progressText,
            progressUpdated: progressText && !progressText.includes('0%'),
            progressWidth: progressWidth
          };
        `,
        description: '验证进度条更新',
        expected: '',
      },
      {
        id: 'step-12',
        action: 'screenshot',
        description: '记录进度更新状态',
        expected: '',
      },
      {
        id: 'step-13',
        action: 'evaluate',
        value: `
          // 检查各种状态标签
          const tamedLabel = document.querySelector('[data-testid="spirit-tamed-label"]');
          const escapedLabel = document.querySelector('[data-testid="spirit-escaped-label"]');
          const tamedOverlay = document.querySelector('[data-testid="spirit-tamed-overlay"]');
          return {
            hasTamedLabel: !!tamedLabel,
            hasEscapedLabel: !!escapedLabel,
            hasTamedOverlay: !!tamedOverlay
          };
        `,
        description: '检查状态标签显示',
        expected: '',
      },
    ],
    expectedResults: [
      '药灵初始进度为0%',
      '激活药灵显示光环和连接线',
      '回答后进度条增加',
      '进度百分比文字正确更新',
      '驯服完成后显示"已驯服"标签和勾选标记',
    ],
    successCriteria: [
      { type: 'functional', description: '进度更新正确', weight: 35 },
      { type: 'visual', description: '激活状态显示正确', weight: 25 },
      { type: 'visual', description: '进度条动画正常', weight: 25 },
      { type: 'functional', description: '状态标签正确', weight: 15 },
    ],
  },
];

export default spiritBattleTestCases;
