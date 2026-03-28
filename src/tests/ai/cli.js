#!/usr/bin/env node

/**
 * AI端到端测试命令行入口
 * 简化版，用于快速运行测试
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printHelp() {
  console.log(`
${colors.bright}药灵山谷v3.0 - AI端到端测试工具${colors.reset}

${colors.cyan}用法:${colors.reset}
  npm run test:ai [-- <选项>]

${colors.cyan}选项:${colors.reset}
  --all, -a           运行所有测试 (默认)
  --category, -c <名> 运行特定类别 (battle|gathering|formula|integration)
  --test, -t <ID>     运行特定测试用例
  --list, -l          列出所有测试用例
  --help, -h          显示帮助

${colors.cyan}示例:${colors.reset}
  npm run test:ai
  npm run test:ai -- --category battle
  npm run test:ai -- --test BATTLE-001
  npm run test:ai -- --list

${colors.cyan}环境变量:${colors.reset}
  TEST_BASE_URL       测试基础URL (默认: http://localhost:5173)
  HEADLESS            是否无头模式 (默认: true)
`);
}

function printTestList() {
  console.log(`
${colors.bright}可用测试用例:${colors.reset}

${colors.yellow}战斗系统测试 (battle):${colors.reset}
  BATTLE-001: 敌人安全期验证
  BATTLE-002: 输入同步验证
  BATTLE-003: 战斗速度调整验证
  BATTLE-004: 事件驱动状态更新验证

${colors.yellow}采药游戏测试 (gathering):${colors.reset}
  MEMORY-001: 游戏界面和布局验证
  MEMORY-002: 卡牌翻转和匹配逻辑
  MEMORY-003: 计分和连击系统
  MEMORY-004: 计时器功能验证
  MEMORY-005: 游戏完成流程

${colors.yellow}方剂学习测试 (formula):${colors.reset}
  FORMULA-001: AI导师对话框显示
  FORMULA-002: 方剂讲解流程
  FORMULA-003: 君臣佐使解析
  FORMULA-004: 互动问答功能
  FORMULA-005: 阶段完成流转

${colors.yellow}集成测试 (integration):${colors.reset}
  INTEGRATION-001: 完整章节流程
  INTEGRATION-002: 阶段跳转测试
`);
}

function main() {
  const args = process.argv.slice(2);

  // 检查是否需要帮助
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  // 检查是否列出测试
  if (args.includes('--list') || args.includes('-l')) {
    printTestList();
    process.exit(0);
  }

  // 构建命令
  let command = 'npx tsx src/tests/ai/run-tests.ts';

  const categoryIndex = args.findIndex(arg => arg === '--category' || arg === '-c');
  const testIndex = args.findIndex(arg => arg === '--test' || arg === '-t');

  if (categoryIndex !== -1 && args[categoryIndex + 1]) {
    command += ` --category ${args[categoryIndex + 1]}`;
  } else if (testIndex !== -1 && args[testIndex + 1]) {
    command += ` --test ${args[testIndex + 1]}`;
  } else {
    command += ' --all';
  }

  console.log(`${colors.cyan}[AI测试]${colors.reset} 启动端到端测试...\n`);

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
  } catch (error) {
    console.error(`\n${colors.red}[错误] 测试执行失败${colors.reset}`);
    process.exit(1);
  }
}

main();
