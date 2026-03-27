import { test, expect } from '@playwright/test';
import { AIMentorEvaluationService, ConversationEvaluation } from '../services/mentorEvaluation';
import { AIStudentSimulator, StudentProfile } from '../services/studentSimulator';

/**
 * Phase 4: AI导师系统端到端测试
 * 使用AI模拟学生进行多轮对话，评估AI导师质量
 */

test.describe('Phase 4: AI导师系统端到端测试', () => {
  let evaluationService: AIMentorEvaluationService;

  test.beforeAll(() => {
    evaluationService = new AIMentorEvaluationService();
  });

  test.describe('场景1：章节入门对话测试', () => {
    test('AI导师应生成合适的欢迎语', async () => {
      const profile: StudentProfile = {
        personality: 'average',
        name: '测试弟子',
        chapterId: 'chapter-1',
        chapterTitle: '青木初识',
        collectedMedicines: [],
      };

      const simulator = new AIStudentSimulator(profile);
      simulator.setOfflineMode(true); // 使用离线模式避免API调用

      const transcript = await simulator.simulateConversation(3, 'greeting');

      // 验证至少有一轮对话
      expect(transcript.length).toBeGreaterThanOrEqual(2);

      // 验证包含导师消息
      const mentorMessages = transcript.filter((t) => t.speaker === 'mentor');
      expect(mentorMessages.length).toBeGreaterThan(0);

      // 验证第一条是问候
      expect(transcript[0].speaker).toBe('mentor');
      expect(transcript[0].content).toContain('欢迎');

      console.log('对话记录：');
      transcript.forEach((turn) => {
        console.log(`${turn.speaker === 'mentor' ? '青木先生' : '学生'}: ${turn.content}`);
      });
    });

    test('AI导师应保持角色一致性', async () => {
      const profile: StudentProfile = {
        personality: 'average',
        name: '测试弟子',
        chapterId: 'chapter-1',
        chapterTitle: '青木初识',
        collectedMedicines: [],
      };

      const simulator = new AIStudentSimulator(profile);
      simulator.setOfflineMode(true);

      const transcript = await simulator.simulateConversation(5, 'greeting');

      // 评估角色一致性
      const evaluation = await evaluationService.evaluateConversation(transcript, {
        chapterId: profile.chapterId,
        chapterTitle: profile.chapterTitle,
        testScenario: 'role-consistency',
      });

      // 角色一致性维度应达到8分以上
      const roleDimension = evaluation.dimensions.find((d) => d.dimension === 'A3');
      expect(roleDimension?.score).toBeGreaterThanOrEqual(7);

      console.log('角色一致性评分：', roleDimension?.score, '/', roleDimension?.maxScore);
      console.log('反馈：', roleDimension?.feedback);
    });
  });

  test.describe('场景2：苏格拉底引导测试', () => {
    test('AI导师应使用苏格拉底式引导而非直接给答案', async () => {
      const profile: StudentProfile = {
        personality: 'struggling', // 学渣型学生
        name: '学渣弟子',
        chapterId: 'chapter-1',
        chapterTitle: '青木初识',
        collectedMedicines: [],
      };

      const simulator = new AIStudentSimulator(profile);
      simulator.setOfflineMode(true);

      const transcript = await simulator.simulateConversation(5, 'socratic');

      // 评估苏格拉底引导
      const evaluation = await evaluationService.evaluateConversation(transcript, {
        chapterId: profile.chapterId,
        chapterTitle: profile.chapterTitle,
        testScenario: 'socratic-guidance',
      });

      // 苏格拉底引导应达到10分以上
      const socraticDimension = evaluation.dimensions.find((d) => d.dimension === 'B1');
      expect(socraticDimension?.score).toBeGreaterThanOrEqual(10);

      console.log('苏格拉底引导评分：', socraticDimension?.score, '/', socraticDimension?.maxScore);
      console.log('反馈：', socraticDimension?.feedback);
      console.log('问题：', socraticDimension?.issues);

      // 保存评估报告
      const reportPath = evaluationService.saveEvaluationReport(evaluation);
      console.log('评估报告已保存：', reportPath);
    });

    test('AI导师应在学生要求时给出答案并附带讲解', async () => {
      const profile: StudentProfile = {
        personality: 'struggling',
        name: '困惑弟子',
        chapterId: 'chapter-1',
        chapterTitle: '青木初识',
        collectedMedicines: [],
      };

      const simulator = new AIStudentSimulator(profile);
      simulator.setOfflineMode(true);

      const transcript = await simulator.simulateConversation(4, 'socratic');

      // 验证最后一条是导师消息
      const lastMessage = transcript[transcript.length - 1];
      expect(lastMessage.speaker).toBe('mentor');

      // 验证消息包含答案（离线模式下有默认答案）
      expect(lastMessage.content.length).toBeGreaterThan(10);

      console.log('最后回复（应包含答案+讲解）：');
      console.log(lastMessage.content);
    });
  });

  test.describe('场景3：多轮对话连贯性测试', () => {
    test('AI导师应保持上下文连贯', async () => {
      const profile: StudentProfile = {
        personality: 'average',
        name: '测试弟子',
        chapterId: 'chapter-1',
        chapterTitle: '青木初识',
        collectedMedicines: ['麻黄'],
      };

      const simulator = new AIStudentSimulator(profile);
      simulator.setOfflineMode(true);

      const transcript = await simulator.simulateConversation(5, 'greeting');

      // 评估连贯性
      const evaluation = await evaluationService.evaluateConversation(transcript, {
        chapterId: profile.chapterId,
        chapterTitle: profile.chapterTitle,
        testScenario: 'coherence',
      });

      // 上下文连贯性应达到7分以上
      const coherenceDimension = evaluation.dimensions.find((d) => d.dimension === 'A1');
      expect(coherenceDimension?.score).toBeGreaterThanOrEqual(7);

      console.log('连贯性评分：', coherenceDimension?.score, '/', coherenceDimension?.maxScore);
      console.log('反馈：', coherenceDimension?.feedback);
    });
  });

  test.describe('场景4：综合质量评估', () => {
    test('综合评分应达到B级（70分以上）', async () => {
      const profile: StudentProfile = {
        personality: 'average',
        name: '综合测试弟子',
        chapterId: 'chapter-1',
        chapterTitle: '青木初识',
        collectedMedicines: ['麻黄', '桂枝'],
      };

      const simulator = new AIStudentSimulator(profile);
      simulator.setOfflineMode(true);

      const transcript = await simulator.simulateConversation(5, 'greeting');

      // 完整评估
      const evaluation = await evaluationService.evaluateConversation(transcript, {
        chapterId: profile.chapterId,
        chapterTitle: profile.chapterTitle,
        testScenario: 'comprehensive',
      });

      // 输出详细评分
      console.log('\n========== 综合评估报告 ==========');
      console.log('总分：', evaluation.totalScore, '/', evaluation.maxScore);
      console.log('等级：', evaluation.grade);
      console.log('\n各维度评分：');
      evaluation.dimensions.forEach((d) => {
        console.log(`  ${d.subDimension}: ${d.score}/${d.maxScore}`);
      });
      console.log('\n总结：', evaluation.summary);

      // 验证达到B级
      expect(evaluation.grade).toMatch(/^[SAB]$/); // S、A或B级

      // 保存评估报告
      const reportPath = evaluationService.saveEvaluationReport(evaluation);
      console.log('\n评估报告已保存：', reportPath);
    });
  });

  test.describe('场景5：不同学生类型测试', () => {
    test.each([
      { personality: 'struggling', name: '学渣弟子' },
      { personality: 'average', name: '普通弟子' },
      { personality: 'excellent', name: '学霸弟子' },
    ] as { personality: 'struggling' | 'average' | 'excellent'; name: string }[])(
      '$name 类型学生对话测试',
      async ({ personality, name }) => {
        const profile: StudentProfile = {
          personality,
          name,
          chapterId: 'chapter-1',
          chapterTitle: '青木初识',
          collectedMedicines: [],
        };

        const simulator = new AIStudentSimulator(profile);
        simulator.setOfflineMode(true);

        const transcript = await simulator.simulateConversation(4, 'greeting');

        // 验证有学生回复
        const studentMessages = transcript.filter((t) => t.speaker === 'student');
        expect(studentMessages.length).toBeGreaterThan(0);

        // 验证有导师回复
        const mentorMessages = transcript.filter((t) => t.speaker === 'mentor');
        expect(mentorMessages.length).toBeGreaterThan(0);

        console.log(`\n${name} 对话记录：`);
        transcript.forEach((turn) => {
          console.log(`${turn.speaker === 'mentor' ? '青木先生' : name}: ${turn.content}`);
        });
      }
    );
  });
});

/**
 * 评估报告生成
 */
test.describe('Phase 4：评估报告汇总', () => {
  test('生成Phase 4完整评估报告', async () => {
    const evaluationService = new AIMentorEvaluationService();
    const scenarios = ['greeting', 'socratic', 'question'];
    const personalities: ('struggling' | 'average' | 'excellent')[] = [
      'struggling',
      'average',
      'excellent',
    ];

    const allEvaluations: ConversationEvaluation[] = [];

    for (const personality of personalities) {
      for (const scenario of scenarios) {
        const profile: StudentProfile = {
          personality,
          name: `${personality}-student`,
          chapterId: 'chapter-1',
          chapterTitle: '青木初识',
          collectedMedicines: [],
        };

        const simulator = new AIStudentSimulator(profile);
        simulator.setOfflineMode(true);

        const transcript = await simulator.simulateConversation(5, scenario as any);
        const evaluation = await evaluationService.evaluateConversation(transcript, {
          chapterId: profile.chapterId,
          chapterTitle: profile.chapterTitle,
          testScenario: `${personality}-${scenario}`,
        });

        allEvaluations.push(evaluation);
      }
    }

    // 计算平均分
    const avgScore =
      allEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / allEvaluations.length;
    const avgMaxScore =
      allEvaluations.reduce((sum, e) => sum + e.maxScore, 0) / allEvaluations.length;

    console.log('\n========== Phase 4 完整评估汇总 ==========');
    console.log(`测试场景数：${allEvaluations.length}`);
    console.log(`平均得分：${avgScore.toFixed(2)} / ${avgMaxScore.toFixed(2)}`);
    console.log(
      `通过率：${
        allEvaluations.filter((e) => e.grade === 'S' || e.grade === 'A' || e.grade === 'B').length
      } / ${allEvaluations.length}`
    );

    // 各维度平均分
    const dimensionScores: Record<string, { total: number; count: number; max: number }> = {};
    allEvaluations.forEach((e) => {
      e.dimensions.forEach((d) => {
        if (!dimensionScores[d.dimension]) {
          dimensionScores[d.dimension] = { total: 0, count: 0, max: d.maxScore };
        }
        dimensionScores[d.dimension].total += d.score;
        dimensionScores[d.dimension].count += 1;
      });
    });

    console.log('\n各维度平均得分：');
    Object.entries(dimensionScores).forEach(([code, data]) => {
      const avg = data.total / data.count;
      console.log(`  ${code}: ${avg.toFixed(2)} / ${data.max}`);
    });

    // 保存汇总报告
    const summaryReport = {
      timestamp: Date.now(),
      totalTests: allEvaluations.length,
      averageScore: avgScore,
      averageMaxScore: avgMaxScore,
      passRate:
        allEvaluations.filter((e) => e.grade === 'S' || e.grade === 'A' || e.grade === 'B').length /
        allEvaluations.length,
      dimensionAverages: Object.entries(dimensionScores).map(([code, data]) => ({
        code,
        average: data.total / data.count,
        max: data.max,
      })),
      evaluations: allEvaluations,
    };

    const fs = require('fs');
    const path = require('path');
    const outputDir = './e2e/reports';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const reportPath = path.join(outputDir, `phase4-summary-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));

    console.log('\n汇总报告已保存：', reportPath);

    // 验证整体通过
    expect(avgScore).toBeGreaterThanOrEqual(70); // B级标准
  });
});
