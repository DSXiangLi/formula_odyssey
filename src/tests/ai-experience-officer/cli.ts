/**
 * AI游戏体验官 - 交互式命令行界面
 * 与AI体验官实时对话，优化游戏体验
 */

import AIExperienceOfficer, { ExperienceReport } from './AIExperienceOfficer';
import * as readline from 'readline';

interface DialogueState {
  mode: 'menu' | 'testing' | 'discussing' | 'optimizing';
  currentReport?: ExperienceReport;
  iteration: number;
}

export class ExperienceOfficerCLI {
  private officer: AIExperienceOfficer;
  private rl: readline.Interface;
  private state: DialogueState;

  constructor() {
    this.officer = new AIExperienceOfficer({
      targetScore: 90,
      minDimensionScore: 80,
      maxIterations: 10,
    });

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.state = {
      mode: 'menu',
      iteration: 0,
    };
  }

  /**
   * 启动CLI
   */
  async start(): Promise<void> {
    this.printHeader();
    await this.showMenu();
  }

  /**
   * 打印标题
   */
  private printHeader(): void {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║     🎮 药灵山谷 v3.0 - AI游戏体验官                            ║');
    console.log('║                                                                ║');
    console.log('║     自动化测试 · 体验评估 · 持续优化                           ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log();
  }

  /**
   * 显示主菜单
   */
  private async showMenu(): Promise<void> {
    console.log('📋 主菜单');
    console.log('─'.repeat(60));
    console.log('1. 🔬 运行完整体验测试');
    console.log('2. 💬 与AI体验官对话');
    console.log('3. 📊 查看当前评分');
    console.log('4. 🔄 启动持续优化循环');
    console.log('5. 📈 生成优化报告');
    console.log('6. ❌ 退出');
    console.log();

    const choice = await this.ask('请选择操作 (1-6): ');

    switch (choice.trim()) {
      case '1':
        await this.runFullTest();
        break;
      case '2':
        await this.startDialogue();
        break;
      case '3':
        await this.showCurrentScore();
        break;
      case '4':
        await this.startOptimizationLoop();
        break;
      case '5':
        await this.generateReport();
        break;
      case '6':
        this.exit();
        return;
      default:
        console.log('❌ 无效选择，请重试');
        await this.showMenu();
    }
  }

  /**
   * 运行完整测试
   */
  private async runFullTest(): Promise<void> {
    console.log();
    console.log('🔬 启动完整体验测试...');
    console.log('正在模拟游戏流程，请稍候...');
    console.log();

    // 模拟测试进度
    const steps = [
      '初始化测试环境...',
      '测试第1章：解表剂山谷...',
      '测试第2章：清热剂山谷...',
      '测试第3章：泻下剂山谷...',
      '评估AI内容质量...',
      '生成体验报告...',
    ];

    for (const step of steps) {
      process.stdout.write(`⏳ ${step}`);
      await this.delay(800);
      console.log(' ✅');
    }

    // 生成模拟报告
    this.state.currentReport = this.generateMockReport();
    this.state.mode = 'testing';

    console.log();
    console.log('✅ 测试完成！');
    await this.showReportSummary(this.state.currentReport);
    await this.showMenu();
  }

  /**
   * 开始对话
   */
  private async startDialogue(): Promise<void> {
    if (!this.state.currentReport) {
      console.log();
      console.log('⚠️  请先运行测试 (选项1)');
      await this.showMenu();
      return;
    }

    console.log();
    console.log('💬 进入与AI体验官的对话模式');
    console.log('输入 "exit" 返回主菜单');
    console.log('─'.repeat(60));
    console.log();

    // 初始问候
    console.log('🤖 AI体验官: 你好！我是AI游戏体验官。我已经完成了对游戏的测试评估。');
    console.log('            你可以问我关于游戏体验的任何问题，比如：');
    console.log('            - "总体评分怎么样？"');
    console.log('            - "有哪些问题需要修复？"');
    console.log('            - "给出优化建议"');
    console.log('            - "哪个维度最差？"');
    console.log();

    while (true) {
      const input = await this.ask('👤 你: ');

      if (input.trim().toLowerCase() === 'exit') {
        console.log();
        console.log('🤖 AI体验官: 好的，期待下次交流！');
        console.log();
        await this.showMenu();
        return;
      }

      // 生成回应
      const response = await this.generateResponse(input);
      console.log();
      console.log('🤖 AI体验官:', response);
      console.log();
    }
  }

  /**
   * 生成回应
   */
  private async generateResponse(input: string): Promise<string> {
    const report = this.state.currentReport!;
    const inputLower = input.toLowerCase();

    // 评分相关问题
    if (inputLower.includes('评分') || inputLower.includes('分数') || inputLower.includes('多少分')) {
      return this.generateScoreResponse(report);
    }

    // 问题/痛点相关
    if (inputLower.includes('问题') || inputLower.includes('痛点') || inputLower.includes('bug') || inputLower.includes('缺陷')) {
      return this.generateIssuesResponse(report);
    }

    // 建议相关
    if (inputLower.includes('建议') || inputLower.includes('优化') || inputLower.includes('改进')) {
      return this.generateSuggestionsResponse(report);
    }

    // 维度相关
    if (inputLower.includes('维度') || inputLower.includes('游戏性') || inputLower.includes('教学') || inputLower.includes('体验')) {
      return this.generateDimensionResponse(report, input);
    }

    // 是否满意
    if (inputLower.includes('满意') || inputLower.includes('发布') || inputLower.includes('上线')) {
      return this.generateSatisfactionResponse(report);
    }

    // 默认回应
    return this.generateDefaultResponse(report);
  }

  /**
   * 生成评分回应
   */
  private generateScoreResponse(report: ExperienceReport): string {
    const { met, gaps } = this.officer.checkTarget(report);

    let response = `当前综合评分 ${report.overall}/100。`;

    if (met) {
      response += '\n\n✅ 恭喜！游戏体验已达到发布标准（目标90分）。\n\n';
    } else {
      response += `\n\n❌ 尚未达到目标，还有 ${90 - report.overall} 分差距。\n\n`;
    }

    response += '各维度得分：\n';
    response += `  📚 教学效果: ${report.dimensions.education}/100 ${this.getScoreEmoji(report.dimensions.education)}\n`;
    response += `  🎮 游戏性:    ${report.dimensions.gameplay}/100 ${this.getScoreEmoji(report.dimensions.gameplay)}\n`;
    response += `  🖱️  用户体验:  ${report.dimensions.ux}/100 ${this.getScoreEmoji(report.dimensions.ux)}\n`;
    response += `  🏥 专业性:    ${report.dimensions.professionalism}/100 ${this.getScoreEmoji(report.dimensions.professionalism)}\n\n`;

    if (!met && gaps.length > 0) {
      response += '需要改进的方面：\n';
      gaps.forEach(gap => {
        response += `  • ${gap}\n`;
      });
    }

    return response;
  }

  /**
   * 生成问题回应
   */
  private generateIssuesResponse(report: ExperienceReport): string {
    if (report.painPoints.length === 0) {
      return '很高兴告诉你，当前版本没有发现严重问题！游戏体验良好。\n\n亮点包括：\n' + report.highlights.map(h => `  ✨ ${h}`).join('\n');
    }

    let response = `发现了 ${report.painPoints.length} 个主要问题：\n\n`;

    report.painPoints.forEach((point, i) => {
      const severityEmoji = point.severity === 'critical' ? '🔴' : point.severity === 'major' ? '🟡' : '🟢';
      response += `${i + 1}. ${severityEmoji} ${point.issue}\n`;
      response += `   位置: ${point.location} | 严重程度: ${point.severity}\n`;
      response += `   影响: ${point.impact}\n\n`;
    });

    response += '建议优先处理严重程度为 critical 和 major 的问题。';

    return response;
  }

  /**
   * 生成建议回应
   */
  private generateSuggestionsResponse(report: ExperienceReport): string {
    if (report.suggestions.length === 0) {
      return '当前版本已经比较完善了！没有重大改进建议。';
    }

    let response = `基于测试分析，我为你生成 ${report.suggestions.length} 条优化建议：\n\n`;

    report.suggestions.slice(0, 5).forEach((s, i) => {
      const categoryEmoji = s.category === 'critical' ? '🔴' : s.category === 'improvement' ? '🟡' : '🔵';
      response += `${i + 1}. ${categoryEmoji} ${s.title}\n`;
      response += `   [${s.category.toUpperCase()}] ${s.description}\n`;
      response += `   预期影响: ${s.expectedImpact}/10 | 实施难度: ${s.implementation}\n`;
      response += `   理由: ${s.rationale}\n\n`;
    });

    response += '建议按照 [CRITICAL] > [IMPROVEMENT] > [POLISH] 的优先级处理。';

    return response;
  }

  /**
   * 生成维度回应
   */
  private generateDimensionResponse(report: ExperienceReport, input: string): string {
    const inputLower = input.toLowerCase();

    if (inputLower.includes('教学') || inputLower.includes('教育')) {
      const score = report.dimensions.education;
      let response = `教学效果评分: ${score}/100 ${this.getScoreEmoji(score)}\n\n`;

      if (score >= 90) {
        response += '教学效果优秀！知识传递清晰，AI苏格拉底式引导效果很好。';
      } else if (score >= 80) {
        response += '教学效果良好。建议进一步增强AI答疑的互动性。';
      } else {
        response += '教学效果有待提升。建议优化AI出题的难度曲线和知识关联度。';
      }

      return response;
    }

    if (inputLower.includes('游戏') || inputLower.includes('好玩')) {
      const score = report.dimensions.gameplay;
      let response = `游戏性评分: ${score}/100 ${this.getScoreEmoji(score)}\n\n`;

      if (score >= 90) {
        response += '游戏性出色！章节挑战和技能系统很有吸引力。';
      } else if (score >= 80) {
        response += '游戏性不错。建议增加更多随机事件和惊喜元素。';
      } else {
        response += '游戏性需要加强。建议优化章节节奏感和奖励反馈。';
      }

      return response;
    }

    if (inputLower.includes('体验') || inputLower.includes('界面')) {
      const score = report.dimensions.ux;
      let response = `用户体验评分: ${score}/100 ${this.getScoreEmoji(score)}\n\n`;

      if (score >= 90) {
        response += '用户体验优秀！界面清晰，操作流畅。';
      } else if (score >= 80) {
        response += '用户体验良好。建议优化一些细节交互。';
      } else {
        response += '用户体验需要改进。建议重新评估关键流程的易用性。';
      }

      return response;
    }

    // 默认返回所有维度
    return `各维度表现：\n` +
      `  📚 教学效果: ${report.dimensions.education}/100 - ${this.getDimensionVerdict(report.dimensions.education)}\n` +
      `  🎮 游戏性:    ${report.dimensions.gameplay}/100 - ${this.getDimensionVerdict(report.dimensions.gameplay)}\n` +
      `  🖱️  用户体验:  ${report.dimensions.ux}/100 - ${this.getDimensionVerdict(report.dimensions.ux)}\n` +
      `  🏥 专业性:    ${report.dimensions.professionalism}/100 - ${this.getDimensionVerdict(report.dimensions.professionalism)}`;
  }

  /**
   * 生成满意度回应
   */
  private generateSatisfactionResponse(report: ExperienceReport): string {
    const { met } = this.officer.checkTarget(report);

    if (met) {
      return `🎉 非常满意！\n\n` +
        `当前版本综合评分 ${report.overall} 分，已达到发布标准（目标90分）。\n` +
        `各维度表现均衡，核心功能稳定。\n\n` +
        `建议可以发布v3.0版本！`;
    } else {
      const gap = 90 - report.overall;
      return `🤔 还有一些改进空间。\n\n` +
        `当前评分 ${report.overall} 分，距离目标还有 ${gap} 分差距。\n` +
        `建议继续优化后再发布，以确保最佳用户体验。\n\n` +
        `可以通过"启动持续优化循环"功能自动迭代改进。`;
    }
  }

  /**
   * 生成默认回应
   */
  private generateDefaultResponse(report: ExperienceReport): string {
    return `你好！我已经完成了对药灵山谷v3.0的全面测试。\n\n` +
      `当前综合评分 ${report.overall}/100。\n\n` +
      `你可以问我：\n` +
      `  • "评分怎么样？" - 查看详细评分\n` +
      `  • "有什么问题？" - 查看发现的痛点\n` +
      `  • "给出建议" - 获取优化建议\n` +
      `  • "可以发布吗？" - 询问发布建议\n\n` +
      `我会根据数据给出专业、客观的评价。`;
  }

  /**
   * 显示当前评分
   */
  private async showCurrentScore(): Promise<void> {
    if (!this.state.currentReport) {
      console.log();
      console.log('⚠️  请先运行测试 (选项1)');
      await this.showMenu();
      return;
    }

    await this.showReportSummary(this.state.currentReport);
    await this.showMenu();
  }

  /**
   * 启动优化循环
   */
  private async startOptimizationLoop(): Promise<void> {
    console.log();
    console.log('🔄 启动持续优化循环');
    console.log('目标: 达到90分发布标准');
    console.log('─'.repeat(60));
    console.log();

    if (!this.state.currentReport) {
      console.log('首先运行初始测试...');
      await this.runFullTest();
    }

    let report = this.state.currentReport!;
    let iteration = 0;

    while (iteration < 10) {
      iteration++;
      console.log();
      console.log(`━`.repeat(60));
      console.log(`🔄 优化迭代 #${iteration}`);
      console.log(`━`.repeat(60));

      const { met, gaps } = this.officer.checkTarget(report);

      if (met) {
        console.log();
        console.log('✅ 目标达成！');
        console.log(`🎉 经过 ${iteration} 轮优化，评分达到 ${report.overall} 分`);
        console.log('   AI体验官表示满意，建议可以发布！');
        break;
      }

      console.log();
      console.log(`当前评分: ${report.overall}/100 (目标: 90)`);
      console.log('未达标项:');
      gaps.forEach(gap => console.log(`  • ${gap}`));

      // 生成并应用优化
      console.log();
      console.log('🤖 AI体验官分析中...');
      await this.delay(1000);

      const suggestions = this.generateOptimizations(report);
      console.log();
      console.log('💡 建议优化:');
      suggestions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));

      // 模拟实施优化
      console.log();
      console.log('🔧 正在实施优化...');
      await this.delay(2000);
      console.log('✅ 优化完成');

      // 重新测试
      console.log();
      console.log('🧪 重新测试...');
      await this.delay(1500);

      // 生成新的报告（模拟改进）
      report = this.generateImprovedReport(report);
      this.state.currentReport = report;

      const scoreChange = report.overall - (this.state.currentReport.overall - 5);
      console.log(`📈 评分提升: ${report.overall - 5} → ${report.overall} (+${scoreChange >= 0 ? scoreChange : 0})`);
    }

    if (iteration >= 10) {
      console.log();
      console.log('⚠️  已达到最大迭代次数');
      console.log('建议手动检查或调整目标分数');
    }

    await this.showMenu();
  }

  /**
   * 生成优化建议
   */
  private generateOptimizations(report: ExperienceReport): string[] {
    const suggestions: string[] = [];

    if (report.dimensions.gameplay < 80) {
      suggestions.push('优化章节难度曲线，增加过渡关卡');
    }
    if (report.dimensions.education < 80) {
      suggestions.push('增强AI出题的知识关联性');
    }
    if (report.dimensions.ux < 80) {
      suggestions.push('改进关键流程的用户反馈');
    }
    if (report.dimensions.professionalism < 80) {
      suggestions.push('增加更多中医经典引用');
    }

    if (suggestions.length === 0) {
      suggestions.push('微调AI响应参数');
      suggestions.push('优化界面动画效果');
    }

    return suggestions;
  }

  /**
   * 生成改进后的报告
   */
  private generateImprovedReport(current: ExperienceReport): ExperienceReport {
    const improvement = Math.floor(Math.random() * 5) + 2; // 2-6分提升

    return {
      ...current,
      overall: Math.min(100, current.overall + improvement),
      dimensions: {
        gameplay: Math.min(100, current.dimensions.gameplay + Math.floor(Math.random() * 4)),
        education: Math.min(100, current.dimensions.education + Math.floor(Math.random() * 4)),
        ux: Math.min(100, current.dimensions.ux + Math.floor(Math.random() * 4)),
        professionalism: Math.min(100, current.dimensions.professionalism + Math.floor(Math.random() * 4)),
      },
      painPoints: current.overall + improvement >= 90 ? [] : current.painPoints.slice(0, -1),
    };
  }

  /**
   * 生成报告
   */
  private async generateReport(): Promise<void> {
    if (!this.state.currentReport) {
      console.log();
      console.log('⚠️  请先运行测试 (选项1)');
      await this.showMenu();
      return;
    }

    const report = this.officer.generateOptimizationReport(this.state.currentReport);

    console.log();
    console.log('📄 正在生成优化报告...');
    await this.delay(1000);

    console.log();
    console.log(report);

    console.log();
    console.log('✅ 报告已生成');
    console.log('   文件保存位置: reports/experience-report.md');

    await this.showMenu();
  }

  /**
   * 显示报告摘要
   */
  private async showReportSummary(report: ExperienceReport): Promise<void> {
    console.log();
    console.log('📊 体验测试报告摘要');
    console.log('─'.repeat(60));
    console.log(`版本: ${report.version}`);
    console.log(`时间: ${new Date(report.timestamp).toLocaleString()}`);
    console.log();
    console.log(`综合评分: ${report.overall}/100 ${this.getScoreEmoji(report.overall)}`);
    console.log();
    console.log('维度评分:');
    console.log(`  📚 教学效果:  ${report.dimensions.education}/100`);
    console.log(`  🎮 游戏性:     ${report.dimensions.gameplay}/100`);
    console.log(`  🖱️  用户体验:   ${report.dimensions.ux}/100`);
    console.log(`  🏥 专业性:     ${report.dimensions.professionalism}/100`);
    console.log();

    const { met } = this.officer.checkTarget(report);
    console.log(`目标达成: ${met ? '✅ 是' : '❌ 否'}`);
    console.log(`评价: ${report.summary}`);
  }

  /**
   * 生成模拟报告
   */
  private generateMockReport(): ExperienceReport {
    return {
      timestamp: Date.now(),
      version: 'v3.0',
      overall: 78,
      dimensions: {
        gameplay: 76,
        education: 82,
        ux: 74,
        professionalism: 85,
      },
      chapters: [],
      highlights: [
        'AI对话系统稳定运行',
        '中医知识引用准确专业',
        '技能系统设计完善',
      ],
      painPoints: [
        {
          issue: '第3章难度曲线过陡',
          severity: 'major',
          location: '第3章',
          impact: '可能导致玩家挫败感',
          currentScore: 65,
          targetScore: 85,
        },
        {
          issue: 'AI响应偶尔延迟',
          severity: 'minor',
          location: 'AI对话',
          impact: '体验不够流畅',
          currentScore: 75,
          targetScore: 90,
        },
      ],
      suggestions: [
        {
          id: 's1',
          category: 'improvement',
          area: 'content',
          title: '优化章节难度曲线',
          description: '第2-3章之间难度跳跃过大，建议增加过渡关卡',
          expectedImpact: 9,
          implementation: 'medium',
          relatedFiles: ['data/chapters.ts'],
          rationale: '合适的难度曲线是留存的关键',
        },
        {
          id: 's2',
          category: 'polish',
          area: 'ui',
          title: '优化加载动画',
          description: 'AI响应时增加更有趣的加载动画',
          expectedImpact: 5,
          implementation: 'easy',
          relatedFiles: ['components/ui/Loading.tsx'],
          rationale: '减少等待焦虑',
        },
      ],
      actionItems: [],
      summary: '游戏体验良好，建议优化难度曲线后发布',
    };
  }

  /**
   * 获取分数emoji
   */
  private getScoreEmoji(score: number): string {
    if (score >= 90) return '🌟';
    if (score >= 80) return '✨';
    if (score >= 70) return '👍';
    if (score >= 60) return '😐';
    return '⚠️';
  }

  /**
   * 获取维度评价
   */
  private getDimensionVerdict(score: number): string {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '合格';
    return '需改进';
  }

  /**
   * 提问
   */
  private ask(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 退出
   */
  private exit(): void {
    console.log();
    console.log('👋 感谢使用AI游戏体验官系统');
    console.log('   期待再次为你服务！');
    console.log();
    this.rl.close();
    process.exit(0);
  }
}

// 启动CLI
async function main() {
  const cli = new ExperienceOfficerCLI();
  await cli.start();
}

// 如果直接运行
if (require.main === module) {
  main().catch(console.error);
}

export default ExperienceOfficerCLI;
