/**
 * 方剂学习 - AI导师集成专项测试
 * 测试内容：
 * 1. AI导师对话框显示
 * 2. 方剂讲解流程
 * 3. 君臣佐使解析
 * 4. 互动问答功能
 * 5. 阶段完成流转
 */

import { AITestCase } from './ai-tester';

export const formulaLearningTestCases: AITestCase[] = [
  {
    id: 'FORMULA-001',
    name: 'AI导师对话框显示',
    description: '验证AI导师对话框正确加载和显示',
    category: 'formula',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=3',
        description: '导航到方剂学习阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 2000,
        description: '等待页面加载',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'screenshot',
        description: '记录初始界面',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查导师头像和对话框
          const hasAvatar = document.querySelector('[class*="MentorAvatar"], img[src*="mentor"]') !== null;
          const hasDialogue = document.querySelector('[class*="DialogueBox"], [class*="dialogue"]') !== null;
          const hasTitle = document.body.textContent?.includes('方剂学习');

          return {
            hasAvatar,
            hasDialogue,
            hasTitle,
            uiComplete: hasAvatar && hasDialogue && hasTitle
          };
        `,
        description: '验证UI元素',
        expected: 'text:uiComplete',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          // 检查青木先生名称
          const hasMentorName = document.body.textContent?.includes('青木先生');
          return { hasMentorName };
        `,
        description: '验证导师名称',
        expected: 'text:hasMentorName',
      },
      {
        id: 'step-6',
        action: 'evaluate',
        value: `
          // 检查初始讲解内容
          const content = document.body.textContent || '';
          const hasExplanation = content.includes('君臣佐使') ||
                                 content.includes('方剂') ||
                                 content.includes('学习');
          return { hasExplanation };
        `,
        description: '验证讲解内容',
        expected: 'text:hasExplanation',
      },
    ],
    expectedResults: [
      '显示青木先生头像',
      '显示对话区域',
      '标题显示"方剂学习"',
      '显示初始讲解内容',
    ],
    successCriteria: [
      { type: 'visual', description: '导师形象显示正确', weight: 30 },
      { type: 'functional', description: '对话框正常工作', weight: 40 },
      { type: 'visual', description: '界面布局美观', weight: 30 },
    ],
  },

  {
    id: 'FORMULA-002',
    name: '方剂讲解流程',
    description: '验证方剂讲解流程完整',
    category: 'formula',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=3',
        description: '导航到方剂学习阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 3000,
        description: '等待初始讲解加载',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'evaluate',
        value: `
          // 检查是否有方剂信息卡片
          const content = document.body.textContent || '';
          const hasFormula = content.includes('麻黄汤') ||
                            content.includes('桂枝汤') ||
                            content.includes('四君子汤') ||
                            content.includes('白虎汤');

          const hasFunctions = content.includes('功效') || content.includes('主治');
          const hasCategory = content.includes('解表剂') ||
                              content.includes('补益剂') ||
                              content.includes('清热剂');

          return {
            hasFormula,
            hasFunctions,
            hasCategory,
            infoComplete: hasFormula && hasFunctions
          };
        `,
        description: '验证方剂信息显示',
        expected: 'text:infoComplete',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查是否有方歌
          const content = document.body.textContent || '';
          const hasSong = content.includes('汤') && content.includes('，');
          return { hasSong };
        `,
        description: '验证方歌显示',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          // 检查进度指示
          const hasProgress = document.body.textContent?.includes('学习进度');
          return { hasProgress };
        `,
        description: '验证进度指示',
        expected: '',
      },
    ],
    expectedResults: [
      '显示方剂名称',
      '显示方剂分类',
      '显示功效主治',
      '显示方歌（如有）',
      '显示学习进度',
    ],
    successCriteria: [
      { type: 'functional', description: '方剂信息完整', weight: 50 },
      { type: 'visual', description: '信息展示清晰', weight: 30 },
      { type: 'functional', description: '进度指示正确', weight: 20 },
    ],
  },

  {
    id: 'FORMULA-003',
    name: '君臣佐使解析',
    description: '验证君臣佐使配伍解析正确显示',
    category: 'formula',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=3',
        description: '导航到方剂学习阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 4000,
        description: '等待讲解进行到配伍部分',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'evaluate',
        value: `
          // 检查君臣佐使相关内容
          const content = document.body.textContent || '';

          const hasJun = content.includes('君药');
          const hasChen = content.includes('臣药');
          const hasZuo = content.includes('佐药');
          const hasShi = content.includes('使药');

          return {
            hasJun,
            hasChen,
            hasZuo,
            hasShi,
            hasAllRoles: hasJun && hasChen && hasZuo && hasShi
          };
        `,
        description: '验证君臣佐使角色',
        expected: 'text:hasAllRoles',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查药材列表
          const content = document.body.textContent || '';
          const hasMedicines = content.includes('麻黄') ||
                              content.includes('桂枝') ||
                              content.includes('杏仁') ||
                              content.includes('甘草');

          return { hasMedicines };
        `,
        description: '验证药材组成',
        expected: 'text:hasMedicines',
      },
    ],
    expectedResults: [
      '显示君药及其作用',
      '显示臣药及其作用',
      '显示佐药及其作用',
      '显示使药及其作用',
      '药材组成列表清晰',
    ],
    successCriteria: [
      { type: 'functional', description: '君臣佐使解析完整', weight: 50 },
      { type: 'educational', description: '讲解内容易懂', weight: 30 },
      { type: 'visual', description: '层次分明', weight: 20 },
    ],
  },

  {
    id: 'FORMULA-004',
    name: '互动问答功能',
    description: '验证互动问答功能正常工作',
    category: 'formula',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=3',
        description: '导航到方剂学习阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 5000,
        description: '等待讲解进行到测验部分',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'evaluate',
        value: `
          // 检查是否进入测验界面
          const content = document.body.textContent || '';
          const hasQuiz = content.includes('随堂测验') ||
                          content.includes('是什么角色');

          const hasOptions = content.includes('君药') &&
                             content.includes('臣药') &&
                             content.includes('佐药') &&
                             content.includes('使药');

          return {
            hasQuiz,
            hasOptions,
            quizReady: hasQuiz || hasOptions
          };
        `,
        description: '验证测验界面',
        expected: 'text:quizReady',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查选项按钮
          const buttons = Array.from(document.querySelectorAll('button'));
          const roleButtons = buttons.filter(b =>
            b.textContent?.includes('君药') ||
            b.textContent?.includes('臣药') ||
            b.textContent?.includes('佐药') ||
            b.textContent?.includes('使药')
          );

          return {
            buttonCount: roleButtons.length,
            hasAllOptions: roleButtons.length >= 4
          };
        `,
        description: '验证选项按钮',
        expected: 'text:hasAllOptions',
      },
      {
        id: 'step-5',
        action: 'click',
        target: 'button:has-text("君药"), button:contains("君药")',
        description: '点击一个答案选项',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'wait',
        duration: 1000,
        description: '等待反馈',
        expected: '',
      },
      {
        id: 'step-7',
        action: 'evaluate',
        value: `
          // 检查是否有反馈
          const content = document.body.textContent || '';
          const hasFeedback = content.includes('正确') ||
                              content.includes('错误') ||
                              content.includes('回答');

          return { hasFeedback };
        `,
        description: '验证答案反馈',
        expected: 'text:hasFeedback',
      },
    ],
    expectedResults: [
      '显示测验题目',
      '显示四个角色选项',
      '点击后显示反馈',
      '答对加分，答错纠正',
      '解释说明清晰',
    ],
    successCriteria: [
      { type: 'functional', description: '问答功能正常', weight: 40 },
      { type: 'functional', description: '反馈正确', weight: 30 },
      { type: 'educational', description: '解释易懂', weight: 30 },
    ],
  },

  {
    id: 'FORMULA-005',
    name: '阶段完成流转',
    description: '验证学习完成后正确流转到下一阶段',
    category: 'formula',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/#/chapter/ch1?stage=3',
        description: '导航到方剂学习阶段',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 3000,
        description: '等待页面加载',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'evaluate',
        value: `
          // 检查是否有完成按钮或学习进度
          const buttons = Array.from(document.querySelectorAll('button'));
          const continueButton = buttons.find(b =>
            b.textContent?.includes('继续') ||
            b.textContent?.includes('完成') ||
            b.textContent?.includes('临床考核')
          );

          return {
            hasContinueButton: !!continueButton,
            buttonText: continueButton?.textContent
          };
        `,
        description: '检查完成按钮',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'evaluate',
        value: `
          // 检查分数显示
          const content = document.body.textContent || '';
          const hasScore = content.includes('分') && /\d+分/.test(content);
          const hasCompleteMessage = content.includes('完成') || content.includes('恭喜');

          return {
            hasScore,
            hasCompleteMessage
          };
        `,
        description: '验证完成状态',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'click',
        target: 'button:has-text("继续"), button:contains("继续"), button:has-text("完成")',
        description: '点击继续按钮',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'wait',
        duration: 2000,
        description: '等待页面跳转',
        expected: '',
      },
      {
        id: 'step-7',
        action: 'evaluate',
        value: `
          // 检查是否跳转或显示完成
          const content = document.body.textContent || '';
          const url = window.location.href;

          const isComplete = content.includes('完成') ||
                             content.includes('恭喜') ||
                             content.includes('临床');

          return {
            currentUrl: url,
            isComplete,
            flowCorrect: isComplete
          };
        `,
        description: '验证流转正确',
        expected: 'text:flowCorrect',
      },
    ],
    expectedResults: [
      '显示学习完成界面',
      '显示最终得分',
      '显示已学习方剂数量',
      '有继续按钮进入临床考核',
      '跳转流畅无错误',
    ],
    successCriteria: [
      { type: 'functional', description: '完成流程正常', weight: 50 },
      { type: 'functional', description: '数据保存正确', weight: 30 },
      { type: 'usability', description: '流转顺畅', weight: 20 },
    ],
  },
];

export default formulaLearningTestCases;
