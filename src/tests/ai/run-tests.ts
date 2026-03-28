/**
 * AI端到端测试运行器
 * 运行所有专项测试并生成报告
 */

import { AITester, AITestReport } from './ai-tester';
import battleSyncTestCases from './battle-sync.test';
import memoryGameTestCases from './memory-game.test';
import formulaLearningTestCases from './formula-learning.test';

// 集成测试用例 - 覆盖完整流程
const integrationTestCases = [
  {
    id: 'INTEGRATION-001',
    name: '完整章节流程',
    description: '测试从章节开始到完成的完整流程',
    category: 'integration' as const,
    steps: [
      {
        id: 'step-1',
        action: 'navigate' as const,
        value: '/',
        description: '进入首页',
        expected: 'text:药灵山谷',
      },
      {
        id: 'step-2',
        action: 'click' as const,
        target: 'a[href*="chapter"], button:contains("开始")',
        description: '进入章节选择',
        expected: 'text:章节',
      },
      {
        id: 'step-3',
        action: 'click' as const,
        target: '[data-testid="chapter-1"], a[href*="ch1"]',
        description: '选择第一章',
        expected: 'url:chapter',
      },
    ],
    expectedResults: ['首页加载正常', '章节选择可用', '能进入指定章节'],
    successCriteria: [
      { type: 'functional', description: '导航正常', weight: 50 },
      { type: 'functional', description: '页面加载正确', weight: 50 },
    ],
  },

  {
    id: 'INTEGRATION-002',
    name: '阶段跳转测试',
    description: '测试StageManager的阶段跳转功能',
    category: 'integration' as const,
    steps: [
      {
        id: 'step-1',
        action: 'navigate' as const,
        value: '/#/chapter/ch1',
        description: '进入第一章',
        expected: '',
      },
      {
        id: 'step-2',
        action: 'evaluate' as const,
        value: `
          // 检查阶段指示器
          const stageIndicators = document.querySelectorAll('[class*="stage"], [class*="progress"]');
          return { stageCount: stageIndicators.length };
        `,
        description: '检查阶段指示器',
        expected: '',
      },
      {
        id: 'step-3',
        action: 'navigate' as const,
        value: '/#/chapter/ch1?stage=0',
        description: '跳转到阶段0（师导入门）',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'navigate' as const,
        value: '/#/chapter/ch1?stage=1',
        description: '跳转到阶段1（山谷采药）',
        expected: '',
      },
      {
        id: 'step-5',
        action: 'navigate' as const,
        value: '/#/chapter/ch1?stage=2',
        description: '跳转到阶段2（药灵守护）',
        expected: '',
      },
      {
        id: 'step-6',
        action: 'navigate' as const,
        value: '/#/chapter/ch1?stage=3',
        description: '跳转到阶段3（方剂学习）',
        expected: '',
      },
    ],
    expectedResults: ['各阶段URL参数正确', '阶段跳转正常', '阶段指示器更新'],
    successCriteria: [
      { type: 'functional', description: '阶段跳转正常', weight: 60 },
      { type: 'functional', description: '状态保持正确', weight: 40 },
    ],
  },
];

// 所有测试用例
const allTestCases = [
  ...battleSyncTestCases,
  ...memoryGameTestCases,
  ...formulaLearningTestCases,
  ...integrationTestCases,
];

/**
 * 运行所有AI端到端测试
 */
async function runAllTests(): Promise<AITestReport> {
  const tester = new AITester(process.env.TEST_BASE_URL || 'http://localhost:5173');

  console.log('='.repeat(70));
  console.log('药灵山谷v3.0 - AI端到端测试');
  console.log('='.repeat(70));
  console.log(`测试时间: ${new Date().toLocaleString()}`);
  console.log(`测试基础URL: ${tester['baseUrl']}`);
  console.log(`测试用例数: ${allTestCases.length}`);
  console.log('='.repeat(70));

  try {
    // 初始化浏览器
    await tester.init();
    console.log('[系统] 浏览器初始化完成\n');

    // 按类别分组运行测试
    const categories = ['battle', 'gathering', 'formula', 'integration'] as const;

    for (const category of categories) {
      const categoryTests = allTestCases.filter(t => t.category === category);
      if (categoryTests.length === 0) continue;

      console.log(`\n${'='.repeat(70)}`);
      console.log(`[类别] ${getCategoryName(category)}`);
      console.log('='.repeat(70));

      for (const testCase of categoryTests) {
        await tester.runTest(testCase);
      }
    }

    // 生成报告
    const report = tester.generateReport();

    // 输出报告
    console.log('\n' + '='.repeat(70));
    console.log('测试报告');
    console.log('='.repeat(70));
    console.log(`总体评分: ${report.overallScore}%`);
    console.log(`通过测试: ${report.passed}/${report.totalTests}`);
    console.log(`失败测试: ${report.failed}/${report.totalTests}`);
    console.log(`\n${report.summary}`);

    // 输出详细结果
    console.log('\n' + '-'.repeat(70));
    console.log('详细结果:');
    console.log('-'.repeat(70));

    for (const result of report.results) {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testCase.id}: ${result.testCase.name} (${result.score}%)`);

      if (!result.passed) {
        console.log(`   建议: ${result.recommendations.join(', ')}`);
      }
    }

    // 保存报告到文件
    const fs = await import('fs');
    const reportPath = './test-reports/ai-e2e-report.json';

    // 确保目录存在
    if (!fs.existsSync('./test-reports')) {
      fs.mkdirSync('./test-reports', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n[系统] 报告已保存到: ${reportPath}`);

    return report;

  } catch (error) {
    console.error('[错误] 测试执行失败:', error);
    throw error;

  } finally {
    await tester.close();
    console.log('[系统] 浏览器已关闭');
  }
}

/**
 * 获取类别中文名称
 */
function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    battle: '战斗系统测试',
    gathering: '采药游戏测试',
    formula: '方剂学习测试',
    integration: '集成测试',
  };
  return names[category] || category;
}

/**
 * 运行特定类别的测试
 */
async function runCategoryTests(category: string): Promise<void> {
  const tester = new AITester(process.env.TEST_BASE_URL || 'http://localhost:5173');

  const categoryTests = allTestCases.filter(t => t.category === category);

  if (categoryTests.length === 0) {
    console.log(`[错误] 没有找到类别 "${category}" 的测试用例`);
    return;
  }

  try {
    await tester.init();

    console.log(`\n[类别] ${getCategoryName(category)}`);
    console.log('='.repeat(70));

    for (const testCase of categoryTests) {
      await tester.runTest(testCase);
    }

    const report = tester.generateReport();

    console.log('\n' + '-'.repeat(70));
    console.log(`${getCategoryName(category)} 结果:`);
    console.log('-'.repeat(70));
    console.log(`通过: ${report.passed}/${report.totalTests}`);
    console.log(`评分: ${report.overallScore}%`);

  } finally {
    await tester.close();
  }
}

/**
 * 运行特定测试用例
 */
async function runSingleTest(testId: string): Promise<void> {
  const tester = new AITester(process.env.TEST_BASE_URL || 'http://localhost:5173');

  const testCase = allTestCases.find(t => t.id === testId);

  if (!testCase) {
    console.log(`[错误] 没有找到测试用例 "${testId}"`);
    console.log('可用测试:');
    allTestCases.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
    return;
  }

  try {
    await tester.init();
    const result = await tester.runTest(testCase);

    console.log('\n' + '-'.repeat(70));
    console.log('测试结果:');
    console.log('-'.repeat(70));
    console.log(`状态: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
    console.log(`得分: ${result.score}%`);
    console.log(`耗时: ${result.duration}ms`);

    if (result.recommendations.length > 0) {
      console.log('\n建议:');
      result.recommendations.forEach(r => console.log(`  - ${r}`));
    }

  } finally {
    await tester.close();
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
药灵山谷v3.0 - AI端到端测试工具

用法:
  npx tsx src/tests/ai/run-tests.ts [选项]

选项:
  --all, -a           运行所有测试 (默认)
  --category, -c      运行特定类别测试
  --test, -t          运行特定测试用例
  --list, -l          列出所有测试用例
  --help, -h          显示帮助

示例:
  npx tsx src/tests/ai/run-tests.ts --all
  npx tsx src/tests/ai/run-tests.ts --category battle
  npx tsx src/tests/ai/run-tests.ts --test BATTLE-001
  npx tsx src/tests/ai/run-tests.ts --list
`);
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  console.log('\n可用测试用例:');
  console.log('='.repeat(70));

  const categories = ['battle', 'gathering', 'formula', 'integration'] as const;

  for (const category of categories) {
    console.log(`\n${getCategoryName(category)}:`);
    const tests = allTestCases.filter(t => t.category === category);
    tests.forEach(t => console.log(`  ${t.id}: ${t.name}`));
  }

  process.exit(0);
}

// 主执行逻辑
async function main(): Promise<void> {
  const categoryIndex = args.findIndex(arg => arg === '--category' || arg === '-c');
  const testIndex = args.findIndex(arg => arg === '--test' || arg === '-t');

  if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    await runCategoryTests(args[categoryIndex + 1]);
  } else if (testIndex !== -1 && args[testIndex + 1]) {
    await runSingleTest(args[testIndex + 1]);
  } else {
    const report = await runAllTests();
    process.exit(report.overallScore >= 70 ? 0 : 1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('[致命错误]', error);
  process.exit(1);
});

export { allTestCases, runAllTests, runCategoryTests, runSingleTest };
