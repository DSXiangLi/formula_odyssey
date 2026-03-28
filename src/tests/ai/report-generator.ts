/**
 * 测试报告生成器
 * 将AI端到端测试结果转换为可读报告
 */

import { AITestReport, TestResult } from './ai-tester';

export interface ReportOptions {
  format: 'markdown' | 'html' | 'json';
  includeScreenshots?: boolean;
  detailLevel: 'summary' | 'standard' | 'detailed';
}

export class ReportGenerator {
  /**
   * 生成Markdown格式报告
   */
  static generateMarkdown(report: AITestReport, options: ReportOptions): string {
    const { detailLevel } = options;

    let md = `# AI端到端测试报告\n\n`;
    md += `**生成时间**: ${new Date(report.timestamp).toLocaleString()}\n\n`;

    // 执行摘要
    md += `## 执行摘要\n\n`;
    md += `- **总体评分**: ${report.overallScore}%\n`;
    md += `- **测试总数**: ${report.totalTests}\n`;
    md += `- **通过**: ${report.passed} ✅\n`;
    md += `- **失败**: ${report.failed} ❌\n`;
    md += `- **评估**: ${this.getGrade(report.overallScore)}\n\n`;
    md += `> ${report.summary}\n\n`;

    // 分类统计
    md += `## 分类统计\n\n`;
    md += this.generateCategoryStats(report);

    if (detailLevel === 'summary') {
      return md;
    }

    // 详细结果
    md += `## 详细结果\n\n`;

    // 失败的测试
    const failedTests = report.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      md += `### ❌ 失败的测试\n\n`;
      failedTests.forEach(result => {
        md += this.generateTestDetail(result, detailLevel);
      });
    }

    // 通过的测试
    if (detailLevel === 'detailed') {
      const passedTests = report.results.filter(r => r.passed);
      md += `### ✅ 通过的测试\n\n`;
      passedTests.forEach(result => {
        md += this.generateTestDetail(result, detailLevel);
      });
    }

    // 改进建议
    md += `## 改进建议\n\n`;
    md += this.generateRecommendations(report);

    return md;
  }

  /**
   * 生成HTML格式报告
   */
  static generateHTML(report: AITestReport, options: ReportOptions): string {
    const grade = this.getGrade(report.overallScore);
    const gradeColor = this.getGradeColor(report.overallScore);

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI端到端测试报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .header h1 { font-size: 2em; margin-bottom: 10px; }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h3 { color: #666; font-size: 0.9em; margin-bottom: 5px; }
    .card .value { font-size: 2em; font-weight: bold; color: #333; }
    .grade { font-size: 3em; font-weight: bold; color: ${gradeColor}; }
    .test-list { background: white; border-radius: 8px; overflow: hidden; }
    .test-item {
      padding: 15px 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .test-item:last-child { border-bottom: none; }
    .test-item.passed { background: #f0fff0; }
    .test-item.failed { background: #fff0f0; }
    .status-icon { font-size: 1.5em; }
    .test-info { flex: 1; }
    .test-id { font-size: 0.85em; color: #666; }
    .test-name { font-weight: 500; }
    .test-score { font-size: 1.2em; font-weight: bold; }
    .recommendations {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .recommendations h2 { margin-bottom: 15px; }
    .recommendations ul { padding-left: 20px; }
    .recommendations li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 药灵山谷v3.0 - AI端到端测试报告</h1>
      <p>生成时间: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary-cards">
      <div class="card">
        <h3>总体评分</h3>
        <div class="grade">${grade}</div>
        <div>${report.overallScore}%</div>
      </div>
      <div class="card">
        <h3>测试总数</h3>
        <div class="value">${report.totalTests}</div>
      </div>
      <div class="card">
        <h3>通过</h3>
        <div class="value" style="color: #4caf50;">${report.passed} ✅</div>
      </div>
      <div class="card">
        <h3>失败</h3>
        <div class="value" style="color: #f44336;">${report.failed} ❌</div>
      </div>
    </div>

    <div class="test-list">
      <h2 style="padding: 20px; background: #f8f8f8; border-bottom: 1px solid #eee;">测试结果</h2>
      ${report.results.map(r => `
        <div class="test-item ${r.passed ? 'passed' : 'failed'}">
          <span class="status-icon">${r.passed ? '✅' : '❌'}</span>
          <div class="test-info">
            <div class="test-id">${r.testCase.id}</div>
            <div class="test-name">${r.testCase.name}</div>
          </div>
          <div class="test-score" style="color: ${r.passed ? '#4caf50' : '#f44336'};">${r.score}%</div>
        </div>
      `).join('')}
    </div>

    <div class="recommendations">
      <h2>💡 改进建议</h2>
      <ul>
        ${this.generateRecommendationsList(report).map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 生成分类统计
   */
  private static generateCategoryStats(report: AITestReport): string {
    const categories = ['battle', 'gathering', 'formula', 'integration'] as const;
    let md = '';

    md += '| 类别 | 测试数 | 通过 | 失败 | 平均得分 |\n';
    md += '|------|--------|------|------|----------|\n';

    for (const category of categories) {
      const tests = report.results.filter(r => r.testCase.category === category);
      if (tests.length === 0) continue;

      const passed = tests.filter(t => t.passed).length;
      const failed = tests.length - passed;
      const avgScore = Math.round(tests.reduce((sum, t) => sum + t.score, 0) / tests.length);

      md += `| ${this.getCategoryName(category)} | ${tests.length} | ${passed} ✅ | ${failed} ❌ | ${avgScore}% |\n`;
    }

    md += '\n';
    return md;
  }

  /**
   * 生成测试详情
   */
  private static generateTestDetail(result: TestResult, detailLevel: string): string {
    let md = `#### ${result.passed ? '✅' : '❌'} ${result.testCase.id}: ${result.testCase.name}\n\n`;
    md += `- **得分**: ${result.score}%\n`;
    md += `- **耗时**: ${result.duration}ms\n`;
    md += `- **描述**: ${result.testCase.description}\n\n`;

    if (detailLevel === 'detailed') {
      md += '**步骤结果**:\n\n';
      result.steps.forEach((step, index) => {
        md += `${index + 1}. ${step.success ? '✅' : '❌'} ${step.step.description}\n`;
        if (step.issues.length > 0) {
          md += `   - 问题: ${step.issues.join(', ')}\n`;
        }
      });
      md += '\n';
    }

    if (result.recommendations.length > 0) {
      md += '**建议**:\n';
      result.recommendations.forEach(r => {
        md += `- ${r}\n`;
      });
      md += '\n';
    }

    return md;
  }

  /**
   * 生成改进建议
   */
  private static generateRecommendations(report: AITestReport): string {
    const allRecommendations: string[] = [];

    report.results.forEach(r => {
      allRecommendations.push(...r.recommendations);
    });

    // 去重并统计
    const recommendationCounts = allRecommendations.reduce((acc, rec) => {
      acc[rec] = (acc[rec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按出现次数排序
    const sorted = Object.entries(recommendationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sorted.length === 0) {
      return '所有测试通过，暂无改进建议。\n';
    }

    let md = '';
    sorted.forEach(([rec, count]) => {
      md += `${count > 1 ? '🔴' : '🟡'} **${rec}** (${count}次)\n\n`;
    });

    return md;
  }

  /**
   * 生成建议列表
   */
  private static generateRecommendationsList(report: AITestReport): string[] {
    const allRecommendations: string[] = [];

    report.results.forEach(r => {
      allRecommendations.push(...r.recommendations);
    });

    // 去重
    return [...new Set(allRecommendations)].slice(0, 10);
  }

  /**
   * 获取评分等级
   */
  private static getGrade(score: number): string {
    if (score >= 95) return 'S (优秀)';
    if (score >= 85) return 'A (良好)';
    if (score >= 70) return 'B (及格)';
    if (score >= 60) return 'C (不及格)';
    return 'F (不可用)';
  }

  /**
   * 获取等级颜色
   */
  private static getGradeColor(score: number): string {
    if (score >= 95) return '#4caf50';
    if (score >= 85) return '#8bc34a';
    if (score >= 70) return '#ffc107';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }

  /**
   * 获取类别名称
   */
  private static getCategoryName(category: string): string {
    const names: Record<string, string> = {
      battle: '战斗系统',
      gathering: '采药游戏',
      formula: '方剂学习',
      integration: '集成测试',
    };
    return names[category] || category;
  }
}

export default ReportGenerator;
