import * as fs from 'fs';
import * as path from 'path';
import { TestReport, AIVisionResult } from '../types';

export class ReportGenerator {
  private reports: TestReport[] = [];
  private reportDir: string;

  constructor() {
    this.reportDir = path.join('e2e', 'reports');
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  addReport(report: TestReport): void {
    this.reports.push(report);
  }

  generateHTMLReport(): string {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>药灵山谷AI验收报告</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; }
    .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .stat { background: #f8f9fa; padding: 15px; border-radius: 8px; flex: 1; }
    .stat.pass { border-left: 4px solid #28a745; }
    .stat.fail { border-left: 4px solid #dc3545; }
    .test-case { background: white; border: 1px solid #dee2e6; border-radius: 8px; margin: 10px 0; padding: 15px; }
    .test-case.pass { border-left: 4px solid #28a745; }
    .test-case.fail { border-left: 4px solid #dc3545; }
    .score { font-size: 24px; font-weight: bold; }
    .score.high { color: #28a745; }
    .score.medium { color: #ffc107; }
    .score.low { color: #dc3545; }
    .issues { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
    .suggestions { background: #d1ecf1; padding: 10px; border-radius: 4px; }
    img { max-width: 100%; border: 1px solid #dee2e6; border-radius: 4px; margin: 10px 0; }
    h1, h2, h3 { margin-top: 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>药灵山谷 v3.0 - AI游戏体验官验收报告</h1>
    <p>生成时间: ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="stat ${this.getPassRate() >= 80 ? 'pass' : 'fail'}">
      <h3>总通过率</h3>
      <div class="score ${this.getScoreClass(this.getPassRate())}">${this.getPassRate().toFixed(1)}%</div>
    </div>
    <div class="stat">
      <h3>测试场景数</h3>
      <div class="score">${this.reports.length}</div>
    </div>
    <div class="stat">
      <h3>平均视觉分数</h3>
      <div class="score ${this.getScoreClass(this.getAverageScore())}">${this.getAverageScore().toFixed(1)}</div>
    </div>
  </div>

  <h2>详细测试结果</h2>
  ${this.reports.map(r => this.renderTestCase(r)).join('')}

</body>
</html>`;

    const reportPath = path.join(this.reportDir, `report-${Date.now()}.html`);
    fs.writeFileSync(reportPath, html);
    return reportPath;
  }

  private renderTestCase(report: TestReport): string {
    const aiResults = report.aiResults.map(r => this.renderAIResult(r)).join('');

    return `
    <div class="test-case ${report.passed ? 'pass' : 'fail'}">
      <h3>${report.scenario}</h3>
      <p>耗时: ${report.duration}ms | ${report.timestamp}</p>
      <p>状态: ${report.passed ? '通过' : '失败'}</p>
      ${aiResults}
      <div>
        <h4>截图记录:</h4>
        ${report.screenshots.map(s => `<img src="${s}" alt="screenshot" />`).join('')}
      </div>
    </div>`;
  }

  private renderAIResult(result: AIVisionResult): string {
    return `
    <div>
      <div class="score ${this.getScoreClass(result.score)}">AI评分: ${result.score}/100</div>
      ${result.issues.length > 0 ? `
        <div class="issues">
          <strong>发现的问题:</strong>
          <ul>${result.issues.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      ` : ''}
      ${result.suggestions.length > 0 ? `
        <div class="suggestions">
          <strong>改进建议:</strong>
          <ul>${result.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
      ` : ''}
    </div>`;
  }

  private getPassRate(): number {
    if (this.reports.length === 0) return 0;
    const passed = this.reports.filter(r => r.passed).length;
    return (passed / this.reports.length) * 100;
  }

  private getAverageScore(): number {
    if (this.reports.length === 0) return 0;
    const total = this.reports.reduce((sum, r) => {
      const avg = r.aiResults.reduce((s, a) => s + a.score, 0) / (r.aiResults.length || 1);
      return sum + avg;
    }, 0);
    return total / this.reports.length;
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }
}
