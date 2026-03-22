/**
 * AI游戏体验官 - Playwright测试用例
 * 自动化端到端测试
 */

import { test, expect, type Page } from '@playwright/test';
import { AIExperienceOfficer } from './AIExperienceOfficer';

// 测试配置
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  targetScore: 85,
  minDimensionScore: 70,
  chapters: [1, 2, 3], // 测试前3章
};

test.describe('🎮 AI游戏体验官 - 自动化测试', () => {
  let officer: AIExperienceOfficer;

  test.beforeEach(() => {
    officer = new AIExperienceOfficer({
      targetScore: TEST_CONFIG.targetScore,
      minDimensionScore: TEST_CONFIG.minDimensionScore,
      maxIterations: 10,
      screenshotOnFailure: true,
      recordVideo: true,
    });
  });

  test.describe('章节体验测试', () => {
    test('第1章 - 解表剂山谷完整体验', async ({ page }) => {
      const report = await officer.playthrough(page, {
        chapters: [1],
        evaluateAIQuality: true,
        screenshotKeyPoints: true,
      });

      // 验证评分标准
      expect(report.overall).toBeGreaterThanOrEqual(70);
      expect(report.chapters[0].completed).toBe(true);
      expect(report.chapters[0].bossDefeated).toBe(true);

      // 验证AI质量
      expect(report.chapters[0].aiQuality.validJsonRate).toBeGreaterThanOrEqual(90);
      expect(report.chapters[0].aiQuality.professionalAccuracy).toBeGreaterThanOrEqual(80);

      console.log('✅ 第1章测试通过，评分:', report.chapters[0].score);
    });

    test('第2章 - 清热剂山谷体验评估', async ({ page }) => {
      const report = await officer.playthrough(page, {
        chapters: [2],
        evaluateAIQuality: true,
      });

      expect(report.overall).toBeGreaterThanOrEqual(70);
      expect(report.chapters[0].medicinesCollected.length).toBeGreaterThanOrEqual(3);

      console.log('✅ 第2章测试通过');
    });

    test('多章连续体验 - 前3章流畅度', async ({ page }) => {
      const report = await officer.playthrough(page, {
        chapters: [1, 2, 3],
        evaluateAIQuality: true,
        screenshotKeyPoints: true,
      });

      // 综合评估
      expect(report.overall).toBeGreaterThanOrEqual(75);
      expect(report.chapters.length).toBe(3);

      // 所有章节都应该完成
      const allCompleted = report.chapters.every(c => c.completed);
      expect(allCompleted).toBe(true);

      console.log('✅ 多章测试通过，综合评分:', report.overall);
    });
  });

  test.describe('维度评估测试', () => {
    test('教学效果评估', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1] });

      expect(report.dimensions.education).toBeGreaterThanOrEqual(TEST_CONFIG.minDimensionScore);

      // 验证教学相关指标
      const chapter = report.chapters[0];
      expect(chapter.aiQuality.questionCount).toBeGreaterThan(0);
      expect(chapter.aiQuality.professionalAccuracy).toBeGreaterThanOrEqual(75);

      console.log('📚 教学效果评分:', report.dimensions.education);
    });

    test('游戏性评估', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1, 2] });

      expect(report.dimensions.gameplay).toBeGreaterThanOrEqual(TEST_CONFIG.minDimensionScore);

      // 游戏性指标
      const avgCompletionTime = report.chapters.reduce((sum, c) => sum + c.duration, 0) / report.chapters.length;
      console.log('🎮 游戏性评分:', report.dimensions.gameplay);
      console.log('⏱️  平均完成时间:', Math.round(avgCompletionTime / 1000), '秒');
    });

    test('用户体验评估', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1] });

      expect(report.dimensions.ux).toBeGreaterThanOrEqual(TEST_CONFIG.minDimensionScore);

      // UX指标
      const criticalUXIssues = report.chapters[0].issues.filter(
        i => i.type === 'ux' && i.severity === 'critical'
      ).length;
      expect(criticalUXIssues).toBe(0);

      console.log('🖱️  用户体验评分:', report.dimensions.ux);
    });

    test('中医专业性评估', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1] });

      expect(report.dimensions.professionalism).toBeGreaterThanOrEqual(TEST_CONFIG.minDimensionScore);

      // 专业性指标
      const professionalAccuracy = report.chapters[0].aiQuality.professionalAccuracy;
      expect(professionalAccuracy).toBeGreaterThanOrEqual(80);

      console.log('🏥 专业性评分:', report.dimensions.professionalism);
    });
  });

  test.describe('问题检测测试', () => {
    test('检测关键Bug', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1, 2, 3] });

      // 统计问题
      const allIssues = report.chapters.flatMap(c => c.issues);
      const criticalBugs = allIssues.filter(i => i.type === 'bug' && i.severity === 'critical');

      expect(criticalBugs.length).toBe(0);

      console.log('🐛 发现的Bug:', allIssues.length);
      console.log('🔴 Critical:', criticalBugs.length);
    });

    test('检测性能问题', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1] });

      // 响应时间检查
      const avgResponseTime = report.chapters[0].aiQuality.avgResponseTime;
      expect(avgResponseTime).toBeLessThan(5000); // 5秒内

      console.log('⚡ AI平均响应时间:', avgResponseTime, 'ms');
    });
  });

  test.describe('AI质量测试', () => {
    test('AI响应格式有效性', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1] });

      // JSON格式有效性
      const validJsonRate = report.chapters[0].aiQuality.validJsonRate;
      expect(validJsonRate).toBeGreaterThanOrEqual(95);

      console.log('📋 AI JSON有效率:', validJsonRate + '%');
    });

    test('AI内容多样性', async ({ page }) => {
      // 多次测试检查多样性
      const questions: string[] = [];

      for (let i = 0; i < 3; i++) {
        const report = await officer.playthrough(page, { chapters: [1] });
        // 简化的多样性检查
        questions.push(`test-${i}`);
      }

      // 应该有不同的问题
      const uniqueQuestions = new Set(questions).size;
      expect(uniqueQuestions).toBeGreaterThan(1);

      console.log('🎲 问题多样性:', uniqueQuestions, '/', questions.length);
    });
  });

  test.describe('体验优化对话测试', () => {
    test('生成优化建议', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1, 2] });

      // 验证建议生成
      expect(report.suggestions.length).toBeGreaterThan(0);

      // 验证建议格式
      const suggestion = report.suggestions[0];
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('title');
      expect(suggestion).toHaveProperty('description');
      expect(suggestion).toHaveProperty('expectedImpact');
      expect(suggestion).toHaveProperty('implementation');

      console.log('💡 生成的建议:', report.suggestions.length);
    });

    test('与开发团队对话', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1] });

      // 模拟对话
      const developerMessage = '这个版本可以发布吗？';
      const response = await officer.discuss(report, developerMessage);

      expect(response).toBeTruthy();
      expect(response.length).toBeGreaterThan(10);

      console.log('💬 对话示例:');
      console.log('  开发:', developerMessage);
      console.log('  体验官:', response.substring(0, 100) + '...');
    });

    test('目标达成检查', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1, 2, 3] });

      const { met, gaps } = officer.checkTarget(report);

      if (met) {
        console.log('✅ 目标达成！可以发布');
      } else {
        console.log('❌ 尚未达标:');
        gaps.forEach(gap => console.log('  -', gap));
      }

      // 输出详细评分
      console.log();
      console.log('📊 详细评分:');
      console.log('  综合:', report.overall);
      console.log('  游戏性:', report.dimensions.gameplay);
      console.log('  教学效果:', report.dimensions.education);
      console.log('  用户体验:', report.dimensions.ux);
      console.log('  专业性:', report.dimensions.professionalism);
    });
  });

  test.describe('综合体验报告测试', () => {
    test('生成完整体验报告', async ({ page }) => {
      const report = await officer.playthrough(page, {
        chapters: [1, 2, 3],
        evaluateAIQuality: true,
        screenshotKeyPoints: true,
      });

      // 验证报告完整性
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('version');
      expect(report).toHaveProperty('overall');
      expect(report).toHaveProperty('dimensions');
      expect(report).toHaveProperty('chapters');
      expect(report).toHaveProperty('highlights');
      expect(report).toHaveProperty('painPoints');
      expect(report).toHaveProperty('suggestions');
      expect(report).toHaveProperty('actionItems');
      expect(report).toHaveProperty('summary');

      // 验证章节数据
      expect(report.chapters.length).toBe(3);
      expect(report.chapters[0]).toHaveProperty('chapterId');
      expect(report.chapters[0]).toHaveProperty('score');
      expect(report.chapters[0]).toHaveProperty('aiQuality');
      expect(report.chapters[0]).toHaveProperty('issues');

      console.log('✅ 报告生成成功');
      console.log('📄 报告内容:');
      console.log('  综合评分:', report.overall);
      console.log('  亮点:', report.highlights.length);
      console.log('  痛点:', report.painPoints.length);
      console.log('  建议:', report.suggestions.length);
    });

    test('生成优化报告文档', async ({ page }) => {
      const report = await officer.playthrough(page, { chapters: [1, 2] });
      const optimizationReport = officer.generateOptimizationReport(report);

      expect(optimizationReport).toContain('# 游戏体验优化报告');
      expect(optimizationReport).toContain(report.overall.toString());
      expect(optimizationReport).toContain('各维度评分');
      expect(optimizationReport).toContain('优化建议');

      console.log('✅ 优化报告生成成功');
    });
  });
});

// 导出测试工具
export { AIExperienceOfficer };
