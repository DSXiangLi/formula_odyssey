/**
 * AI Student Simulator
 * 模拟学生与AI导师对话
 */

import { MentorMessage, MentorContext, AIMentorService } from '../../src/services/ai/AIMentorService';
import { DialogueTurn } from './mentorEvaluation';

export type StudentPersonality = 'struggling' | 'average' | 'excellent';

export interface StudentProfile {
  personality: StudentPersonality;
  name: string;
  chapterId: string;
  chapterTitle: string;
  collectedMedicines: string[];
}

export class AIStudentSimulator {
  private mentorService: AIMentorService;
  private profile: StudentProfile;
  private conversationHistory: MentorMessage[] = [];

  constructor(profile: StudentProfile) {
    this.mentorService = new AIMentorService();
    this.profile = profile;
  }

  /**
   * 模拟完整对话流程
   */
  async simulateConversation(
    rounds: number = 5,
    scenario: 'greeting' | 'socratic' | 'question' = 'greeting'
  ): Promise<DialogueTurn[]> {
    const transcript: DialogueTurn[] = [];

    // 生成问候
    const greeting = await this.getMentorResponse('greeting');
    transcript.push({
      round: 1,
      speaker: 'mentor',
      content: greeting.content,
      emotion: greeting.emotion,
    });
    this.conversationHistory.push(greeting);

    // API限速延迟
    await this.delay(500);

    // 进行多轮对话
    for (let i = 2; i <= rounds; i++) {
      // 学生回复
      const studentReply = this.generateStudentReply(i, scenario);
      transcript.push({
        round: i,
        speaker: 'student',
        content: studentReply,
      });

      // 获取导师回复（传递学生消息以支持上下文）
      const messageType = this.determineMessageType(i, scenario);
      const mentorReply = await this.getMentorResponse(messageType, studentReply);

      transcript.push({
        round: i,
        speaker: 'mentor',
        content: mentorReply.content,
        emotion: mentorReply.emotion,
      });

      this.conversationHistory.push({
        id: `student_${Date.now()}`,
        role: 'student',
        content: studentReply,
        timestamp: Date.now(),
      });
      this.conversationHistory.push(mentorReply);

      // API限速延迟
      await this.delay(500);

      // 苏格拉底测试场景特殊处理
      if (scenario === 'socratic' && i === 3) {
        // 模拟要求答案
        const finalStudentMessage = '老师，我还是不明白，请直接告诉我答案吧';
        transcript.push({
          round: i + 1,
          speaker: 'student',
          content: finalStudentMessage,
        });

        const finalReply = await this.getMentorResponse('guide', finalStudentMessage);
        transcript.push({
          round: i + 1,
          speaker: 'mentor',
          content: finalReply.content,
          emotion: finalReply.emotion,
        });
        break;
      }
    }

    return transcript;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成学生回复
   */
  private generateStudentReply(round: number, scenario: string): string {
    const { personality } = this.profile;

    // 根据人格类型生成不同回复
    switch (personality) {
      case 'struggling':
        return this.generateStrugglingReply(round, scenario);
      case 'excellent':
        return this.generateExcellentReply(round, scenario);
      case 'average':
      default:
        return this.generateAverageReply(round, scenario);
    }
  }

  /**
   * 学渣型回复
   */
  private generateStrugglingReply(round: number, scenario: string): string {
    const strugglingReplies = [
      '我不太确定...',
      '这个我忘了',
      '老师，能再说一遍吗？',
      '我好像学过了但是记不清了',
      '这个有点难，我不太明白',
      '是不是麻黄？（猜的）',
      '我不太理解这个概念',
      '请直接告诉我答案吧',
    ];

    if (scenario === 'socratic' && round >= 3) {
      return '我还是不太明白，请老师直接告诉我答案吧';
    }

    return strugglingReplies[Math.floor(Math.random() * strugglingReplies.length)];
  }

  /**
   * 学霸型回复
   */
  private generateExcellentReply(round: number, scenario: string): string {
    const excellentReplies = [
      '麻黄辛温，入肺膀胱经，主要功效是发汗解表、宣肺平喘',
      '这味药性味辛温，归肺、膀胱经',
      '我记得《伤寒论》里说麻黄汤主之',
      '是不是因为它辛温发散的特性？',
      '四气是寒热温凉，麻黄应该是温性的',
      '麻黄能发汗是因为味辛，辛能发散',
    ];

    return excellentReplies[Math.floor(Math.random() * excellentReplies.length)];
  }

  /**
   * 普通型回复
   */
  private generateAverageReply(round: number, scenario: string): string {
    const averageReplies = [
      '麻黄是用来解表的吗？',
      '是不是可以治疗感冒？',
      '这味药味道有点辛？',
      '我记得好像是温性的',
      '是不是归肺经？',
      '麻黄汤里用的是这个吧？',
      '发汗...是不是能出汗的意思？',
    ];

    if (scenario === 'socratic' && round >= 3) {
      return '我还是不太确定，请老师再提示一下';
    }

    return averageReplies[Math.floor(Math.random() * averageReplies.length)];
  }

  /**
   * 确定消息类型
   */
  private determineMessageType(
    round: number,
    scenario: string
  ): 'greeting' | 'guide' | 'encouragement' | 'correction' {
    if (scenario === 'socratic') {
      return round <= 2 ? 'guide' : 'correction';
    }

    const types: ('guide' | 'encouragement' | 'correction')[] = [
      'guide',
      'encouragement',
      'guide',
      'correction',
    ];
    return types[round % types.length];
  }

  /**
   * 获取导师回复
   */
  private async getMentorResponse(
    messageType: 'greeting' | 'guide' | 'encouragement' | 'correction',
    studentMessage?: string
  ): Promise<MentorMessage> {
    const context: MentorContext = {
      playerName: this.profile.name,
      chapterId: this.profile.chapterId,
      chapterTitle: this.profile.chapterTitle,
      collectedMedicines: this.profile.collectedMedicines,
      knownMedicineInfo: {},
      stage: 'guiding',
    };

    return this.mentorService.generateResponse(context, messageType, undefined, studentMessage);
  }

  /**
   * 设置离线模式
   */
  setOfflineMode(enabled: boolean): void {
    this.mentorService.setOfflineMode(enabled);
  }
}

export default AIStudentSimulator;
