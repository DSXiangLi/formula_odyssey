import type { FullConfig, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { qwenVL, glm4v } from '../../ai-services';

/**
 * AI增强的测试报告器
 * 自动生成AI测试分析和建议
 */
export default class AITestReporter implements Reporter {
  private results: Array<{
    test: TestCase;
    result: TestResult;
    aiAnalysis?: {
      visualCheck?: any;
      logicCheck?: any;
    };
  }> = [];

  private startTime: number = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log('\n🤖 AI自动化测试开始\n');
    console.log(`运行 ${suite.allTests().length} 个测试用例\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({ test, result });

    const status = result.status === 'passed' ? '✅' :
                   result.status === 'failed' ? '❌' : '⏭️';
    console.log(`${status} ${test.title}`);
  }

  async onEnd(result: { status: 'passed' | 'failed' | 'timedout' | 'interrupted' }) {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.result.status === 'passed').length;
    const failed = this.results.filter(r => r.result.status === 'failed').length;
    const skipped = this.results.filter(r => r.result.status === 'skipped').length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 测试总结');
    console.log('='.repeat(50));
    console.log(`总用例: ${this.results.length}`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⏭️ 跳过: ${skipped}`);
    console.log(`⏱️ 耗时: ${this.formatDuration(duration)}`);
    console.log(`📈 通过率: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n' + '='.repeat(50));
      console.log('🔍 AI失败分析');
      console.log('='.repeat(50));
      await this.analyzeFailures();
    }

    // 生成AI测试报告
    await this.generateAIReport();

    console.log('\n📝 完整报告已生成: reports/ai-test-report.html\n');
  }

  private async analyzeFailures() {
    const failures = this.results.filter(r => r.result.status === 'failed');

    for (const failure of failures) {
      console.log(`\n❌ ${failure.test.title}`);
      console.log(`   错误: ${failure.result.error?.message || 'Unknown error'}`);

      // 如果有截图，使用AI分析
      if (failure.result.attachments) {
        const screenshots = failure.result.attachments
          .filter(a => a.contentType === 'image/png' && a.path)
          .map(a => a.path!);

        if (screenshots.length > 0) {
          try {
            const analysis = await glm4v.analyzeFailure(
              screenshots,
              [failure.test.title],
              failure.result.error?.message || 'Test failed'
            );

            console.log(`   🔎 AI分析: ${analysis.rootCause}`);
            console.log(`   🎯 严重程度: ${analysis.severity}`);
            console.log(`   💡 修复建议: ${analysis.fixSuggestion}`);

            if (analysis.relatedComponents.length > 0) {
              console.log(`   📦 相关组件: ${analysis.relatedComponents.join(', ')}`);
            }
          } catch (error) {
            console.log(`   ⚠️ AI分析失败: ${error}`);
          }
        }
      }
    }
  }

  private async generateAIReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.result.status === 'passed').length,
        failed: this.results.filter(r => r.result.status === 'failed').length,
        skipped: this.results.filter(r => r.result.status === 'skipped').length,
        duration: Date.now() - this.startTime,
      },
      testCases: this.results.map(r => ({
        title: r.test.title,
        status: r.result.status,
        duration: r.result.duration,
        error: r.result.error?.message,
        retries: r.result.retry,
      })),
      aiInsights: await this.generateAIInsights(),
    };

    // 保存JSON报告
    const fs = await import('fs/promises');
    await fs.mkdir('reports', { recursive: true });
    await fs.writeFile('reports/ai-test-report.json', JSON.stringify(report, null, 2));

    // 生成HTML报告
    const htmlReport = this.generateHTMLReport(report);
    await fs.writeFile('reports/ai-test-report.html', htmlReport);
  }

  private async generateAIInsights(): Promise<{
    coverage: string;
    recommendations: string[];
    riskAreas: string[];
  }> {
    // 基于测试结果生成AI洞察
    const testTitles = this.results.map(r => r.test.title);
    const failedTests = this.results.filter(r => r.result.status === 'failed');

    const insights = {
      coverage: this.calculateCoverage(testTitles),
      recommendations: [],
      riskAreas: [],
    };

    // 根据失败模式识别风险区域
    if (failedTests.some(t => t.test.title.includes('性味归经'))) {
      insights.riskAreas.push('性味归经探查玩法');
      insights.recommendations.push('建议加强性味归经界面的稳定性测试');
    }

    if (failedTests.some(t => t.test.title.includes('方剂'))) {
      insights.riskAreas.push('方剂追缉系统');
      insights.recommendations.push('建议检查追缉令进度更新逻辑');
    }

    if (failedTests.some(t => t.test.title.includes('临床'))) {
      insights.riskAreas.push('临床实习系统');
      insights.recommendations.push('建议验证评分算法边界情况');
    }

    if (failedTests.length === 0) {
      insights.recommendations.push('✅ 当前测试覆盖率良好，建议增加边界条件测试');
    }

    return insights;
  }

  private calculateCoverage(testTitles: string[]): string {
    const scenarios = ['登录', '性味归经', '方剂', '临床', '图鉴', '场景'];
    const covered = scenarios.filter(s =>
      testTitles.some(t => t.toLowerCase().includes(s))
    );
    return `${covered.length}/${scenarios.length} 核心场景`;
  }

  private generateHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI测试报告 - 药灵山谷</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #f5f5f5;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #2d5a4a 0%, #1a1a1a 100%);
      padding: 2rem;
      text-align: center;
    }
    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      color: #b0b0b0;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .stat-card {
      background: #2d2d2d;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }
    .stat-card h3 {
      color: #b0b0b0;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .stat-card .value {
      font-size: 2.5rem;
      font-weight: bold;
    }
    .stat-card.passed .value { color: #4a7c59; }
    .stat-card.failed .value { color: #8b3a3a; }
    .stat-card.total .value { color: #c9a961; }
    .insights {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem;
    }
    .insight-card {
      background: #2d2d2d;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .insight-card h3 {
      color: #c9a961;
      margin-bottom: 1rem;
    }
    .insight-card ul {
      list-style: none;
      padding: 0;
    }
    .insight-card li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #3d3d3d;
    }
    .insight-card li:last-child {
      border-bottom: none;
    }
    .test-list {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem;
    }
    .test-item {
      background: #2d2d2d;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .test-item.passed { border-left: 4px solid #4a7c59; }
    .test-item.failed { border-left: 4px solid #8b3a3a; }
    .test-item.skipped { border-left: 4px solid #707070; }
    .status-icon {
      font-size: 1.25rem;
    }
    .test-title {
      flex: 1;
    }
    .test-duration {
      color: #707070;
      font-size: 0.875rem;
    }
    .footer {
      text-align: center;
      padding: 2rem;
      color: #707070;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 AI自动化测试报告</h1>
    <p>药灵山谷 v2.0 | ${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
  </div>

  <div class="summary">
    <div class="stat-card total">
      <h3>总用例</h3>
      <div class="value">${report.summary.total}</div>
    </div>
    <div class="stat-card passed">
      <h3>通过</h3>
      <div class="value">${report.summary.passed}</div>
    </div>
    <div class="stat-card failed">
      <h3>失败</h3>
      <div class="value">${report.summary.failed}</div>
    </div>
    <div class="stat-card">
      <h3>通过率</h3>
      <div class="value" style="color: ${report.summary.passed === report.summary.total ? '#4a7c59' : '#c9a961'}">
        ${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%
      </div>
    </div>
  </div>

  <div class="insights">
    <div class="insight-card">
      <h3>📊 测试覆盖</h3>
      <p>${report.aiInsights.coverage}</p>
    </div>

    ${report.aiInsights.riskAreas.length > 0 ? `
    <div class="insight-card">
      <h3>⚠️ 风险区域</h3>
      <ul>
        ${report.aiInsights.riskAreas.map((r: string) => `<li>🔴 ${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="insight-card">
      <h3>💡 AI建议</h3>
      <ul>
        ${report.aiInsights.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="test-list">
    <h2 style="margin-bottom: 1rem;">测试详情</h2>
    ${report.testCases.map((tc: any) => `
      <div class="test-item ${tc.status}">
        <span class="status-icon">
          ${tc.status === 'passed' ? '✅' : tc.status === 'failed' ? '❌' : '⏭️'}
        </span>
        <span class="test-title">${tc.title}</span>
        <span class="test-duration">${(tc.duration / 1000).toFixed(2)}s</span>
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>由 Playwright + Qwen-VL + GLM-4V 驱动</p>
    <p>药灵山谷自动化测试系统</p>
  </div>
</body>
</html>
    `;
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
