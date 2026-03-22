#!/usr/bin/env node

/**
 * AI游戏体验官 - 快速启动脚本
 * 运行：node run-experience-officer.js
 */

const { ExperienceOptimizationDialogue } = require('./optimizationDialogue');
const { ExperienceOfficerCLI } = require('./cli');

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'cli';

  console.log('🎮 药灵山谷 v3.0 - AI游戏体验官');
  console.log('─'.repeat(50));
  console.log();

  if (mode === 'auto') {
    // 自动优化模式
    console.log('模式: 自动优化循环');
    console.log('目标: 达到90分发布标准');
    console.log();

    const dialogue = new ExperienceOptimizationDialogue();
    await dialogue.startOptimization();
  } else {
    // 交互式CLI模式
    console.log('模式: 交互式命令行');
    console.log('输入 "exit" 退出');
    console.log();

    const cli = new ExperienceOfficerCLI();
    await cli.start();
  }
}

main().catch(error => {
  console.error('❌ 运行失败:', error);
  process.exit(1);
});
