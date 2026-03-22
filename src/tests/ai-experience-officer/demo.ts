#!/usr/bin/env tsx

/**
 * AI游戏体验官 - 演示脚本
 * 展示完整的测试、评估、优化流程
 */

import AIExperienceOfficer from './AIExperienceOfficer';
import type { ExperienceReport, GameIssue } from './AIExperienceOfficer';

// 模拟测试数据
const MOCK_CHAPTER_DATA = {
  chapters: [
    { id: '1', name: '解表剂山谷', medicines: 4, difficulty: 1 },
    { id: '2', name: '清热剂山谷', medicines: 4, difficulty: 2 },
    { id: '3', name: '泻下剂山谷', medicines: 3, difficulty: 3 },
  ],
};

// 模拟问题数据
const MOCK_ISSUES: GameIssue[] = [
  {
    id: 'issue-1',
    type: 'content',
    severity: 'major',
    description: '第3章难度曲线过陡，从第2题到第3题难度跳跃太大',
    location: '第3章 - AI出题',
    reproducible: true,
    steps: ['进入第3章', '完成第2题', '进入第3题', '观察难度变化'],
  },
  {
    id: 'issue-2',
    type: 'ux',
    severity: 'minor',
    description: 'AI响应时加载动画不够明显',
    location: 'AI对话界面',
    reproducible: true,
  },
  {
    id: 'issue-3',
    type: 'ai',
    severity: 'minor',
    description: '偶尔出现JSON解析失败的题目',
    location: 'AI出题系统',
    reproducible: false,
  },
];

class ExperienceOfficerDemo {
  private officer: AIExperienceOfficer;

  constructor() {
    this.officer = new AIExperienceOfficer({
      targetScore: 90,
      minDimensionScore: 80,
      maxIterations: 10,
    });
  }

  /**
   * 运行演示
   */
  async runDemo(): Promise<void> {
    this.printHeader();

    // 阶段1: 初始测试
    await this.phase1_InitialTest();

    // 阶段2: 发现问题
    await this.phase2_FindIssues();

    // 阶段3: 与开发团队对话
    await this.phase3_Discussion();

    // 阶段4: 持续优化
    await this.phase4_ContinuousOptimization();

    // 阶段5: 最终评估
    await this.phase5_FinalEvaluation();

    this.printFooter();
  }

  /**
   * 阶段1: 初始测试
   */
  private async phase1_InitialTest(): Promise<void> {
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 阶段1: 初始体验测试');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();

    console.log('🎮 AI游戏体验官开始工作...');
    console.log(`📋 测试计划: 前 ${MOCK_CHAPTER_DATA.chapters.length} 章`);
    console.log();

    // 模拟章节测试
    for (const chapter of MOCK_CHAPTER_DATA.chapters) {
      console.log(`⏳ 测试第${chapter.id}章: ${chapter.name}...`);
      await this.delay(800);
      console.log(`   ✅ 完成 (${chapter.medicines}味药, 难度${chapter.difficulty})`);
    }

    console.log();
    console.log('🧪 评估AI内容质量...');
    await this.delay(1000);
    console.log('   ✓ AI JSON格式有效性: 96%');
    console.log('   ✓ 平均响应时间: 1.2s');
    console.log('   ✓ 中医专业性: 85%');

    console.log();
    console.log('✅ 初始测试完成');
  }

  /**
   * 阶段2: 发现问题
   */
  private async phase2_FindIssues(): Promise<void> {
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 阶段2: 发现问题与痛点');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();

    console.log('🤖 AI体验官分析中...');
    await this.delay(1000);

    // 生成模拟报告
    const report = this.generateMockReport();

    console.log('📈 体验评分');
    console.log(`   综合评分: ${report.overall}/100`);
    console.log(`   ├─ 游戏性:    ${report.dimensions.gameplay}/100 ${this.getEmoji(report.dimensions.gameplay)}`);
    console.log(`   ├─ 教学效果:  ${report.dimensions.education}/100 ${this.getEmoji(report.dimensions.education)}`);
    console.log(`   ├─ 用户体验:  ${report.dimensions.ux}/100 ${this.getEmoji(report.dimensions.ux)}`);
    console.log(`   └─ 专业性:    ${report.dimensions.professionalism}/100 ${this.getEmoji(report.dimensions.professionalism)}`);

    console.log();
    console.log('🔴 发现的问题:');
    MOCK_ISSUES.forEach((issue, i) => {
      const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'major' ? '🟡' : '🟢';
      console.log(`   ${i + 1}. ${emoji} [${issue.severity.toUpperCase()}] ${issue.description}`);
      console.log(`      位置: ${issue.location}`);
    });

    console.log();
    console.log('💡 生成的优化建议:');
    report.suggestions.forEach((suggestion, i) => {
      const emoji = suggestion.category === 'critical' ? '🔴' : suggestion.category === 'improvement' ? '🟡' : '🔵';
      console.log(`   ${i + 1}. ${emoji} ${suggestion.title}`);
      console.log(`      影响: ${suggestion.expectedImpact}/10 | 难度: ${suggestion.implementation}`);
      console.log(`      说明: ${suggestion.description}`);
    });

    console.log();
    console.log('✅ 问题分析完成');
  }

  /**
   * 阶段3: 与开发团队对话
   */
  private async phase3_Discussion(): Promise<void> {
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 阶段3: 与AI体验官对话');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();

    const report = this.generateMockReport();

    // 对话1: 询问评分
    console.log('👤 开发团队: 这个版本的评分怎么样？');
    await this.delay(500);
    console.log();
    const response1 = await this.officer.discuss(report, '这个版本的评分怎么样？');
    console.log('🤖 AI体验官:', response1);

    console.log();
    await this.delay(1000);

    // 对话2: 询问优先修复
    console.log('👤 开发团队: 哪个问题最优先修复？');
    await this.delay(500);
    console.log();
    const response2 = await this.officer.discuss(report, '哪个问题最优先修复？');
    console.log('🤖 AI体验官:', response2);

    console.log();
    await this.delay(1000);

    // 对话3: 询问是否可发布
    console.log('👤 开发团队: 这个版本可以发布吗？');
    await this.delay(500);
    console.log();
    const response3 = await this.officer.discuss(report, '这个版本可以发布吗？');
    console.log('🤖 AI体验官:', response3);

    console.log();
    console.log('✅ 对话完成');
  }

  /**
   * 阶段4: 持续优化
   */
  private async phase4_ContinuousOptimization(): Promise<void> {
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 阶段4: 持续优化循环');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();

    let currentScore = 78;
    const targetScore = 90;

    console.log(`🎯 目标分数: ${targetScore}`);
    console.log(`📊 当前分数: ${currentScore}`);
    console.log(`📉 差距: ${targetScore - currentScore}分`);
    console.log();

    // 模拟优化迭代
    for (let iteration = 1; iteration <= 4; iteration++) {
      console.log(`━`.repeat(50));
      console.log(`🔄 优化迭代 #${iteration}`);
      console.log(`━`.repeat(50));
      console.log();

      // 选择优化项
      const optimizations = [
        '调整第3章难度曲线，增加过渡题',
        '优化AI响应缓存策略，减少延迟',
        '增加技能解锁动画特效',
        '微调AI出题难度参数',
      ];

      console.log('💡 本次优化:');
      console.log(`   • ${optimizations[iteration - 1] || '综合性能优化'}`);
      console.log();

      // 模拟实施
      console.log('🔧 实施优化...');
      await this.delay(1500);
      console.log('✅ 优化完成');
      console.log();

      // 重新测试
      console.log('🧪 重新测试...');
      await this.delay(1000);

      // 计算新分数
      const improvement = Math.floor(Math.random() * 4) + 2; // 2-5分
      const newScore = Math.min(100, currentScore + improvement);
      const actualImprovement = newScore - currentScore;

      console.log(`📈 评分变化: ${currentScore} → ${newScore} (+${actualImprovement})`);
      console.log();

      currentScore = newScore;

      if (currentScore >= targetScore) {
        console.log('✅ 目标达成！');
        break;
      }
    }

    console.log();
    console.log('✅ 优化循环完成');
  }

  /**
   * 阶段5: 最终评估
   */
  private async phase5_FinalEvaluation(): Promise<void> {
    console.log();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 阶段5: 最终评估');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log();

    // 生成最终报告
    const finalReport: ExperienceReport = {
      timestamp: Date.now(),
      version: 'v3.0',
      overall: 91,
      dimensions: {
        gameplay: 89,
        education: 93,
        ux: 88,
        professionalism: 92,
      },
      chapters: [],
      highlights: [
        'AI对话系统稳定运行，响应流畅',
        '章节难度曲线合理，体验顺畅',
        '中医知识引用准确，专业性强',
        '技能系统反馈及时，成就感十足',
      ],
      painPoints: [],
      suggestions: [
        {
          id: 'polish-1',
          category: 'polish',
          area: 'ui',
          title: '进一步优化动效细节',
          description: '可进一步提升界面过渡动画的流畅度',
          expectedImpact: 5,
          implementation: 'easy',
          relatedFiles: ['styles/animations.css'],
          rationale: '细节决定品质',
        },
      ],
      actionItems: [],
      summary: '游戏体验优秀，建议发布v3.0版本',
    };

    console.log('📊 最终评分');
    console.log(`   综合评分: ${finalReport.overall}/100 ${this.getEmoji(finalReport.overall)}`);
    console.log(`   ├─ 游戏性:    ${finalReport.dimensions.gameplay}/100 ${this.getEmoji(finalReport.dimensions.gameplay)}`);
    console.log(`   ├─ 教学效果:  ${finalReport.dimensions.education}/100 ${this.getEmoji(finalReport.dimensions.education)}`);
    console.log(`   ├─ 用户体验:  ${finalReport.dimensions.ux}/100 ${this.getEmoji(finalReport.dimensions.ux)}`);
    console.log(`   └─ 专业性:    ${finalReport.dimensions.professionalism}/100 ${this.getEmoji(finalReport.dimensions.professionalism)}`);

    console.log();
    console.log('✨ 亮点:');
    finalReport.highlights.forEach((highlight, i) => {
      console.log(`   ${i + 1}. ${highlight}`);
    });

    console.log();
    const { met } = this.officer.checkTarget(finalReport);
    console.log(`🎯 目标达成: ${met ? '✅ 是' : '❌ 否'}`);
    console.log(`💬 评价: ${finalReport.summary}`);

    console.log();
    await this.delay(500);

    // 最终对话
    const finalResponse = await this.officer.discuss(finalReport, '作为AI体验官，你对最终版本满意吗？');
    console.log();
    console.log('🤖 AI体验官:', finalResponse);

    console.log();
    console.log('✅ 最终评估完成');
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
      ],
      actionItems: [],
      summary: '游戏体验良好，建议优化难度曲线后发布',
    };
  }

  /**
   * 打印页眉
   */
  private printHeader(): void {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║           🎮 AI游戏体验官 - 工作流程演示                     ║');
    console.log('║                                                                ║');
    console.log('║     自动化测试 · 体验评估 · 持续优化 · 发布决策             ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
  }

  /**
   * 打印页脚
   */
  private printFooter(): void {
    console.log();
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║              🎉 演示完成！感谢观看！                         ║');
    console.log('║                                                                ║');
    console.log('║     AI游戏体验官已验证游戏质量，v3.0可以发布！               ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('💡 提示: 使用以下命令运行完整体验官系统:');
    console.log('   npm run experience-officer');
    console.log();
  }

  /**
   * 获取分数对应的emoji
   */
  private getEmoji(score: number): string {
    if (score >= 90) return '🌟';
    if (score >= 80) return '✨';
    if (score >= 70) return '👍';
    if (score >= 60) return '😐';
    return '⚠️';
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 运行演示
async function main() {
  const demo = new ExperienceOfficerDemo();
  await demo.runDemo();
}

// 如果直接运行
if (require.main === module) {
  main().catch(console.error);
}

export default ExperienceOfficerDemo;
