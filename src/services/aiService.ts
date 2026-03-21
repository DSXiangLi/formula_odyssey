// AI服务配置和API调用

// 从环境变量读取配置
const GLM_API_BASE = import.meta.env.VITE_GLM_API_BASE || '';
const GLM_API_KEY = import.meta.env.VITE_GLM_API_KEY || '';
const GLM_MODEL_NAME = import.meta.env.VITE_GLM_MODEL_NAME || 'glm-4';

// 生成探索问答题目
export async function generateQuiz(
  difficulty: 'easy' | 'normal' | 'hard' = 'normal',
  category?: string
): Promise<{
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}> {
  // 如果没有配置API，使用本地题目库
  if (!GLM_API_KEY) {
    return getLocalQuiz(difficulty);
  }

  try {
    const response = await fetch(`${GLM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: `你是一个中医知识问答生成器。请生成一道关于中药或中医方剂的选择题。
难度：${difficulty === 'easy' ? '简单（基础知识点）' : difficulty === 'normal' ? '普通（需要思考）' : '困难（综合运用）'}
${category ? '类别：' + category : ''}

要求：
1. 题目要准确、有意义
2. 四个选项，只有一个正确答案
3. 干扰项要有一定迷惑性
4. 答案解释要详细、有教育意义

请以JSON格式返回：
{
  "question": "题目内容",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "correctIndex": 0,
  "explanation": "答案解释"
}`,
          },
          {
            role: 'user',
            content: '请生成一道中医知识问答题',
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      try {
        // 尝试解析JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch {
        console.warn('Failed to parse AI response, using local quiz');
      }
    }

    return getLocalQuiz(difficulty);
  } catch (error) {
    console.error('AI service error:', error);
    return getLocalQuiz(difficulty);
  }
}

// 本地题目库（备用）
const localQuizzes = {
  easy: [
    {
      question: '被称为"发汗解表第一药"的是哪味中药？',
      options: ['麻黄', '桂枝', '紫苏', '生姜'],
      correctIndex: 0,
      explanation: '麻黄性辛温，能发汗解表、宣肺平喘，是治疗风寒表实证的首选药。',
    },
    {
      question: '下列哪味药属于补益药？',
      options: ['大黄', '人参', '黄连', '金银花'],
      correctIndex: 1,
      explanation: '人参是补气药，能大补元气、补脾益肺、生津养血、安神益智。',
    },
    {
      question: '甘草在方剂中常起到什么作用？',
      options: ['君药', '臣药', '佐药', '使药（调和诸药）'],
      correctIndex: 3,
      explanation: '甘草被称为"国老"，能调和诸药，在方剂中常作为使药使用。',
    },
  ],
  normal: [
    {
      question: '麻黄汤中麻黄与桂枝的配伍关系是什么？',
      options: ['相须为用', '相使为用', '相畏为用', '相反为用'],
      correctIndex: 0,
      explanation: '麻黄与桂枝相须为用，共同增强发汗解表的功效。',
    },
    {
      question: '下列哪组药物存在"十八反"配伍禁忌？',
      options: ['麻黄与桂枝', '人参与黄芪', '甘草与甘遂', '当归与川芎'],
      correctIndex: 2,
      explanation: '甘草反甘遂、大戟、芫花、海藻，属于十八反配伍禁忌。',
    },
    {
      question: '四君子汤的组成是什么？',
      options: ['人参、黄芪、白术、甘草', '人参、白术、茯苓、甘草', '人参、麦冬、五味子', '人参、当归、熟地、白芍'],
      correctIndex: 1,
      explanation: '四君子汤由人参、白术、茯苓、甘草组成，是补气的基础方。',
    },
  ],
  hard: [
    {
      question: '患者恶寒发热，无汗，头痛，喘咳，脉浮紧，应选用何方？',
      options: ['桂枝汤', '麻黄汤', '银翘散', '小柴胡汤'],
      correctIndex: 1,
      explanation: '患者表现为风寒表实证（恶寒发热、无汗、脉浮紧），且有喘咳，符合麻黄汤证。',
    },
    {
      question: '下列关于附子使用注意事项的描述，错误的是？',
      options: ['孕妇禁用', '阴虚阳亢者禁用', '可与半夏同用', '宜久煎'],
      correctIndex: 2,
      explanation: '附子反半夏，两者不可同用。附子宜久煎以降低毒性。',
    },
  ],
};

function getLocalQuiz(difficulty: 'easy' | 'normal' | 'hard') {
  const quizzes = localQuizzes[difficulty];
  return quizzes[Math.floor(Math.random() * quizzes.length)];
}

// 生成药材图片描述
export async function generateHerbDescription(herbName: string): Promise<string> {
  if (!GLM_API_KEY) {
    return `${herbName}是一味重要的中药材。`;
  }

  try {
    const response = await fetch(`${GLM_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: '你是一个中药知识专家。请用一两句话简要介绍这味中药的主要功效。',
          },
          {
            role: 'user',
            content: `请介绍${herbName}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || `${herbName}是一味重要的中药材。`;
  } catch (error) {
    console.error('AI service error:', error);
    return `${herbName}是一味重要的中药材。`;
  }
}
