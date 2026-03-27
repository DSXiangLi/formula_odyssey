/**
 * Phase 4 AI导师系统测试需求定义
 */

import { DesignRequirement } from '../types';

// AI导师视觉需求
export const mentorUIRequirements: DesignRequirement = {
  name: 'AI导师UI视觉验收',
  criteria: [
    '导师头像应显示五行主题色（木绿、火红、土黄、金灰、水蓝）',
    '导师表情应随对话内容变化（开心、思考、担忧、庆祝）',
    '对话框应使用中医古典风格设计',
    '消息气泡应有明显的角色区分（导师蓝色，学生绿色）',
    '输入框应清晰可见，发送按钮应有明确标识',
    '导师卡片应显示"青木先生"身份标识',
    '整体风格应符合药灵山谷中医药主题',
  ],
  expectedElements: [
    'mentor-avatar',
    'dialogue-box',
    'message-bubble-mentor',
    'message-bubble-student',
    'message-input',
    'send-button',
    'mentor-name',
  ],
};

// 对话质量需求
export const dialogueQualityRequirements: DesignRequirement = {
  name: 'AI导师对话质量',
  criteria: [
    '多轮对话应保持上下文连贯',
    '回复应符合"青木先生"角色设定',
    '应使用中医专业术语',
    '表达应生动有趣，引人入胜',
    '问题难度应符合章节进度',
  ],
};

// 苏格拉底引导需求
export const socraticGuidanceRequirements: DesignRequirement = {
  name: '苏格拉底式引导',
  criteria: [
    '学生答错时应引导思考而非直接纠正',
    '学生仍困惑时应提供更多提示',
    '学生要求答案时应给出答案并附带讲解',
    '应识别学生错误原因并提供针对性引导',
    '引导应循序渐进，最多3轮',
  ],
};

// 题目生成需求
export const questionGenerationRequirements: DesignRequirement = {
  name: '智能题目生成',
  criteria: [
    '题目类型应多样化（单药、药对、方剂、跨章）',
    '选项设计应有合理干扰项',
    '答案解析应清晰并引用出处',
    '题目难度应符合当前章节',
    '题目应与已学药材相关',
  ],
};

// 角色一致性需求
export const roleConsistencyRequirements: DesignRequirement = {
  name: '角色一致性',
  criteria: [
    '应使用"徒儿"、"师弟"等称呼',
    '应引用《伤寒论》《本草纲目》等经典',
    '应使用"为师"、"老朽"等自称',
    '语气温和但专业',
    '具有中医大家风范',
  ],
};

// 导出所有需求
export const phase4Requirements = {
  ui: mentorUIRequirements,
  dialogue: dialogueQualityRequirements,
  socratic: socraticGuidanceRequirements,
  question: questionGenerationRequirements,
  role: roleConsistencyRequirements,
};
