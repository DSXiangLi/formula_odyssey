/**
 * 游戏体验官对话系统
 * 与AI体验官持续对话，优化游戏体验
 */

import AIExperienceOfficer from './AIExperienceOfficer';
import type { ExperienceReport, Suggestion } from './AIExperienceOfficer';

interface OptimizationIteration {
  iteration: number;
  report: ExperienceReport;
  changes: string[];
  scoreChange: number;
}

export class ExperienceOptimizationDialogue {
  private officer: AIExperienceOfficer;
  private iterations: OptimizationIteration[] = [];
  private currentIteration = 0;
  private isRunning = false;

  constructor() {
    this.officer = new AIExperienceOfficer({
      targetScore: 90,
      minDimensionScore: 80,
      maxIterations: 10,
    });
  }

  /**
   * 开始优化对话流程
   */
  async startOptimization(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🎮 药灵山谷 AI游戏体验官 - 优化会话启动          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log();

    await this.officer.startOptimizationSession();
    this.isRunning = true;

    // 第一轮：初始评估
    console.log('📊 第1轮：初始体验评估');
    console.log('─'.repeat(50));

    const initialReport = await this.simulateTestRun();
    await this.processReport(initialReport);

    // 后续轮次：持续优化直到达标
    while (this.shouldContinue()) {
      this.currentIteration++;
      console.log();
      console.log(`📊 第${this.currentIteration + 1}轮：优化后重新评估`);
      console.log('─'.repeat(50));

      // 模拟实施优化
      const changes = await this.implementOptimizations();

      // 重新测试
      const newReport = await this.simulateTestRun();

      // 记录迭代
      const scoreChange = newReport.overall - this.getLastReport().overall;
      this.iterations.push({
        iteration: this.currentIteration,
        report: newReport,
        changes,
        scoreChange,
      });

      await this.processReport(newReport);
    }

    // 总结
    await this.summarizeOptimization();
  }

  /**
   * 模拟测试运行
   */
  private async simulateTestRun(): Promise<ExperienceReport> {
    // 模拟延迟
    await this.delay(1000);

    // 基于迭代次数生成改进的报告
    const baseScore = 70;
    const iterationBonus = Math.min(this.currentIteration * 3, 20);
    const randomVariation = Math.random() * 5 - 2.5;

    const overall = Math.min(100, Math.round(baseScore + iterationBonus + randomVariation));

    return {
      timestamp: Date.now(),
      version: 'v3.0',
      overall,
      dimensions: {
        gameplay: Math.min(100, overall + Math.round(Math.random() * 10 - 5)),
        education: Math.min(100, overall + Math.round(Math.random() * 10 - 3)),
        ux: Math.min(100, overall + Math.round(Math.random() * 10 - 7)),
        professionalism: Math.min(100, overall + Math.round(Math.random() * 10 - 2)),
      },
      chapters: [],
      highlights: [
        'AI对话系统稳定运行',
        '中医知识引用准确',
        '技能系统反馈良好',
      ],
      painPoints: overall < 90 ? [
        { issue: '第3章难度曲线过陡', severity: 'major', location: '第3章', impact: '玩家流失', currentScore: 60, targetScore: 85 },
        { issue: 'AI响应偶尔延迟', severity: 'minor', location: 'AI对话', impact: '体验不流畅', currentScore: 75, targetScore: 90 },
      ] : [],
      suggestions: this.generateSuggestions(overall),
      actionItems: [],
      summary: overall >= 90 ? '游戏体验优秀，建议发布' : '游戏体验良好，建议继续优化',
    };
  }

  /**
   * 处理体验报告
   */
  private async processReport(report: ExperienceReport): Promise<void> {
    // 显示评分
    console.log();
    console.log('📈 体验评分');
    console.log(`   综合评分: ${report.overall}/100`);
    console.log(`   ├─ 游戏性:    ${report.dimensions.gameplay}  ${this.getScoreEmoji(report.dimensions.gameplay)}`);
    console.log(`   ├─ 教学效果:  ${report.dimensions.education}  ${this.getScoreEmoji(report.dimensions.education)}`);
    console.log(`   ├─ 用户体验:  ${report.dimensions.ux}  ${this.getScoreEmoji(report.dimensions.ux)}`);
    console.log(`   └─ 专业性:    ${report.dimensions.professionalism}  ${this.getScoreEmoji(report.dimensions.professionalism)}`);

    // 检查是否达标
    const { met, gaps } = this.officer.checkTarget(report);

    if (met) {
      console.log();
      console.log('✅ 目标达成！游戏体验符合发布标准。');
      this.isRunning = false;
      return;
    }

    // 显示差距
    console.log();
    console.log('❌ 尚未达标');
    console.log('未达标项:');
    gaps.forEach(gap => {
      console.log(`   • ${gap}`);
    });

    // 显示痛点
    if (report.painPoints.length > 0) {
      console.log();
      console.log('🔴 主要痛点:');
      report.painPoints.forEach((point, i) => {
        console.log(`   ${i + 1}. ${point.issue}`);
        console.log(`      位置: ${point.location} | 严重程度: ${point.severity}`);
      });
    }

    // 显示优化建议
    console.log();
    console.log('💡 AI体验官建议:');

    for (const suggestion of report.suggestions.slice(0, 3)) {
      console.log();
      console.log(`   [${suggestion.category.toUpperCase()}] ${suggestion.title}`);
      console.log(`   预期影响: ${'★'.repeat(suggestion.expectedImpact)}${'☆'.repeat(10 - suggestion.expectedImpact)}`);
      console.log(`   实施难度: ${suggestion.implementation}`);
      console.log(`   说明: ${suggestion.description}`);

      // 模拟对话
      const response = await this.officer.discuss(report, `关于"${suggestion.title}"，具体怎么优化？`);
      console.log();
      console.log('   🤖 AI体验官回复:');
      console.log('   ' + response.split('\n').join('\n   '));
    }
  }

  /**
   * 实施优化
   */
  private async implementOptimizations(): Promise<string[]> {
    const lastReport = this.getLastReport();
    const changes: string[] = [];

    console.log();
    console.log('🔧 实施优化...');

    // 根据痛点实施优化
    for (const painPoint of lastReport.painPoints) {
      console.log(`   正在优化: ${painPoint.issue}`);
      await this.delay(800);

      // 模拟修复
      if (painPoint.issue.includes('难度')) {
        changes.push(`调整${painPoint.location}难度曲线，增加过渡题`);
      } else if (painPoint.issue.includes('延迟')) {
        changes.push(`优化AI响应缓存策略，减少延迟`);
      } else if (painPoint.issue.includes('UI')) {
        changes.push(`改进${painPoint.location}的视觉反馈`);
      } else {
        changes.push(`修复${painPoint.location}的问题`);
      }
    }

    // 如果没有痛点，实施一些通用优化
    if (changes.length === 0) {
      changes.push('微调AI出题难度');
      changes.push('优化界面动画流畅度');
    }

    console.log('   ✅ 优化完成');
    return changes;
  }

  /**
   * 判断是否继续优化
   */
  private shouldContinue(): boolean {
    if (!this.isRunning) return false;
    if (this.currentIteration >= 10) return false;

    const lastReport = this.getLastReport();
    const { met } = this.officer.checkTarget(lastReport);

    return !met;
  }

  /**
   * 获取最新报告
   */
  private getLastReport(): ExperienceReport {
    if (this.iterations.length === 0) {
      return {
        timestamp: Date.now(),
        version: 'v3.0',
        overall: 70,
        dimensions: { gameplay: 70, education: 72, ux: 68, professionalism: 75 },
        chapters: [],
        highlights: [],
        painPoints: [],
        suggestions: [],
        actionItems: [],
        summary: '初始评估',
      };
    }
    return this.iterations[this.iterations.length - 1].report;
  }

  /**
   * 生成建议
   */
  private generateSuggestions(score: number): Suggestion[] {
    const suggestions: Suggestion[] = [
      {
        id: 's1',
        category: score < 80 ? 'critical' : 'improvement',
        area: 'content',
        title: '优化章节难度曲线',
        description: '第2-3章之间难度跳跃过大，建议增加过渡关卡',
        expectedImpact: 9,
        implementation: 'medium',
        relatedFiles: ['data/chapters.ts', 'services/ai/prompts.ts'],
        rationale: '合适的难度曲线是留存的关键',
      },
      {
        id: 's2',
        category: 'improvement',
        area: 'ai',
        title: '增强AI出题多样性',
        description: '增加情景题和对比题比例，减少重复模式',
        expectedImpact: 7,
        implementation: 'medium',
        relatedFiles: ['services/ai/aiService.ts'],
        rationale: '多样性提升学习兴趣和效果',
      },
      {
        id: 's3',
        category: 'polish',
        area: 'ui',
        title: '优化技能解锁动画',
        description: '技能解锁时增加更炫酷的特效和音效',
        expectedImpact: 5,
        implementation: 'easy',
        relatedFiles: ['components/skill/SkillCard.tsx'],
        rationale: '增强成就感和沉浸感',
      },
    ];

    return suggestions;
  }

  /**
   * 总结优化过程
   */
  private async summarizeOptimization(): Promise<void> {
    console.log();
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              📊 优化过程总结报告                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log();

    console.log(`总迭代次数: ${this.iterations.length}`);
    console.log();

    // 显示每轮变化
    console.log('评分变化:');
    let lastScore = 70;
    for (const iter of this.iterations) {
      const change = iter.report.overall - lastScore;
      const changeStr = change >= 0 ? `+${change}` : `${change}`;
      const changeEmoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      console.log(`   第${iter.iteration + 1}轮: ${lastScore} → ${iter.report.overall} (${changeStr}) ${changeEmoji}`);
      lastScore = iter.report.overall;
    }

    console.log();
    console.log(`最终评分: ${this.getLastReport().overall}/100`);
    console.log(`目标评分: 90/100`);
    console.log(`目标达成: ${this.getLastReport().overall >= 90 ? '✅ 是' : '❌ 否'}`);

    if (this.getLastReport().overall >= 90) {
      console.log();
      console.log('🎉 恭喜！游戏体验已达到发布标准。');
      console.log('   AI游戏体验官表示满意，建议可以发布v3.0版本。');
    } else {
      console.log();
      console.log('⚠️  游戏体验仍有改进空间。');
      console.log('   建议继续优化后再发布。');
    }

    // 最终对话
    console.log();
    console.log('💬 最终对话:');
    const finalResponse = await this.officer.discuss(this.getLastReport(), '作为AI体验官，你对这个版本满意吗？');
    console.log('🤖 AI体验官:');
    console.log(finalResponse);
  }

  /**
   * 获取分数对应的emoji
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🌟';
    if (score >= 80) return '✨';
    if (score >= 70) return '👍';
    if (score >= 60) return '😐';
    return '⚠️';
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行优化对话
async function main() {
  const dialogue = new ExperienceOptimizationDialogue();
  await dialogue.startOptimization();
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export default ExperienceOptimizationDialogue;
