/**
 * 生成AI测试报告
 * 从JSON报告生成HTML/Markdown报告
 */

import * as fs from 'fs';
import * as path from 'path';
import { ReportGenerator } from './report-generator';

// 读取测试结果
const reportPath = path.resolve(process.cwd(), 'test-reports/ai-e2e-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('错误: 未找到测试报告。请先运行测试。');
  console.log('运行: npm run test:ai:e2e');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// 生成报告
const format = process.argv[2] || 'html';

if (format === 'html') {
  const html = ReportGenerator.generateHTML(report, {
    format: 'html',
    detailLevel: 'standard',
  });

  const outputPath = path.resolve(process.cwd(), 'test-reports/ai-e2e-report.html');
  fs.writeFileSync(outputPath, html);
  console.log(`HTML报告已生成: ${outputPath}`);
} else if (format === 'md' || format === 'markdown') {
  const md = ReportGenerator.generateMarkdown(report, {
    format: 'markdown',
    detailLevel: 'detailed',
  });

  const outputPath = path.resolve(process.cwd(), 'test-reports/ai-e2e-report.md');
  fs.writeFileSync(outputPath, md);
  console.log(`Markdown报告已生成: ${outputPath}`);
} else {
  console.log('用法: tsx src/tests/ai/generate-report.ts [html|md]');
  console.log('默认生成HTML报告');
}

console.log(`\n总体评分: ${report.overallScore}%`);
console.log(`通过: ${report.passed}/${report.totalTests}`);
console.log(`失败: ${report.failed}/${report.totalTests}`);
