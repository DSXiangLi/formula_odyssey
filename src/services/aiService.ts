import type { ClinicalCase } from '../types/index';

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

// 方剂基础数据（用于生成病案）
const formulaData: Record<string, {
  name: string;
  composition: string[];
  functions: string[];
  indications: string[];
  jun: string;
}> = {
  'formula_mahuang': {
    name: '麻黄汤',
    composition: ['麻黄', '桂枝', '杏仁', '甘草'],
    functions: ['发汗解表', '宣肺平喘'],
    indications: ['外感风寒表实证', '恶寒发热', '无汗', '喘咳'],
    jun: '麻黄',
  },
  'formula_guizhi': {
    name: '桂枝汤',
    composition: ['桂枝', '白芍', '生姜', '大枣', '甘草'],
    functions: ['解肌发表', '调和营卫'],
    indications: ['外感风寒表虚证', '发热汗出', '恶风'],
    jun: '桂枝',
  },
  'formula_sijunzi': {
    name: '四君子汤',
    composition: ['人参', '白术', '茯苓', '甘草'],
    functions: ['益气健脾'],
    indications: ['脾胃气虚证', '面色萎白', '语声低微'],
    jun: '人参',
  },
  'formula_siniwu': {
    name: '四物汤',
    composition: ['熟地黄', '当归', '白芍', '川芎'],
    functions: ['补血和血'],
    indications: ['营血虚滞证', '面色无华', '头晕目眩'],
    jun: '熟地黄',
  },
  'formula_xiaochengqi': {
    name: '大承气汤',
    composition: ['大黄', '芒硝', '厚朴', '枳实'],
    functions: ['峻下热结'],
    indications: ['阳明腑实证', '大便不通', '腹胀拒按'],
    jun: '大黄',
  },
  'formula_xiaoqinglong': {
    name: '小青龙汤',
    composition: ['麻黄', '桂枝', '干姜', '细辛', '五味子', '白芍', '半夏', '甘草'],
    functions: ['解表散寒', '温肺化饮'],
    indications: ['外寒里饮证', '恶寒发热', '喘咳', '痰多清稀'],
    jun: '麻黄、桂枝',
  },
  'formula_shenlingbaizhu': {
    name: '参苓白术散',
    composition: ['人参', '茯苓', '白术', '山药', '莲子', '薏苡仁', '砂仁', '桔梗', '扁豆', '甘草'],
    functions: ['益气健脾', '渗湿止泻'],
    indications: ['脾虚湿盛证', '饮食不化', '胸脘痞满'],
    jun: '人参',
  },
  'formula_yinqiaosan': {
    name: '银翘散',
    composition: ['金银花', '连翘', '薄荷', '牛蒡子', '荆芥', '淡豆豉', '桔梗', '竹叶', '芦根', '甘草'],
    functions: ['辛凉解表', '清热解毒'],
    indications: ['温病初起', '发热', '微恶风寒'],
    jun: '金银花、连翘',
  },
  'formula_banxiabaizhu': {
    name: '半夏泻心汤',
    composition: ['半夏', '黄芩', '干姜', '人参', '黄连', '大枣', '甘草'],
    functions: ['和胃降逆', '开结消痞'],
    indications: ['寒热互结之痞证', '心下痞', '呕吐', '肠鸣腹泻'],
    jun: '半夏',
  },
  'formula_lizhong': {
    name: '理中丸',
    composition: ['人参', '干姜', '白术', '甘草'],
    functions: ['温中祛寒', '补气健脾'],
    indications: ['脾胃虚寒证', '脘腹疼痛', '喜温喜按'],
    jun: '干姜',
  },
};

// 病案模板库（用于API不可用时生成病案）
const caseTemplates: Record<string, Array<Partial<ClinicalCase>>> = {
  'formula_mahuang': [
    {
      patientInfo: '李某，男，28岁',
      symptoms: ['恶寒发热，无汗', '头痛身痛', '喘咳，咳痰清稀', '口不渴', '精神萎靡'],
      tongue: '舌苔薄白',
      pulse: '脉浮紧',
      correctTreatment: '辛温解表',
    },
    {
      patientInfo: '王某，女，35岁',
      symptoms: ['恶寒重发热轻', '无汗', '咳嗽气喘', '鼻塞流涕', '全身酸痛'],
      tongue: '舌淡红，苔薄白',
      pulse: '脉浮紧有力',
      correctTreatment: '辛温解表',
    },
  ],
  'formula_guizhi': [
    {
      patientInfo: '陈某，女，26岁',
      symptoms: ['发热汗出', '恶风不恶寒', '头痛', '鼻鸣干呕', '四肢酸楚'],
      tongue: '舌苔薄白',
      pulse: '脉浮缓',
      correctTreatment: '解肌发表',
    },
    {
      patientInfo: '刘某，男，31岁',
      symptoms: ['汗出恶风', '发热不高', '鼻流清涕', '食欲不振', '体倦乏力'],
      tongue: '舌淡苔白',
      pulse: '脉浮弱',
      correctTreatment: '解肌发表',
    },
  ],
  'formula_sijunzi': [
    {
      patientInfo: '赵某，男，45岁',
      symptoms: ['面色萎白', '语声低微', '四肢乏力', '食少便溏', '精神倦怠'],
      tongue: '舌淡苔白',
      pulse: '脉虚弱',
      correctTreatment: '益气健脾',
    },
    {
      patientInfo: '孙某，女，38岁',
      symptoms: ['气短懒言', '食欲减退', '腹胀便溏', '面色少华', '动则汗出'],
      tongue: '舌淡胖有齿痕，苔白',
      pulse: '脉细弱',
      correctTreatment: '益气健脾',
    },
  ],
};

// 生成临床病案
export async function generateClinicalCase(formulaId: string): Promise<ClinicalCase | null> {
  const formula = formulaData[formulaId];
  if (!formula) {
    console.warn(`Formula not found: ${formulaId}`);
    return null;
  }

  // 如果没有配置API，使用本地模板生成
  if (!GLM_API_KEY) {
    return generateLocalClinicalCase(formulaId);
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
            content: `你是一个中医临床病案生成专家。请根据方剂信息生成一个临床病案。

要求：
1. 患者信息要真实可信（性别、年龄）
2. 症状描述要典型，符合该方剂的适应症
3. 舌象、脉象要准确
4. 治法要与方剂功效一致
5. 解析要详细说明辨证思路

请以JSON格式返回：
{
  "patientInfo": "患者姓名、性别、年龄",
  "symptoms": ["症状1", "症状2", "症状3", "症状4", "症状5"],
  "tongue": "舌象描述",
  "pulse": "脉象描述",
  "explanation": "详细辨证解析"
}`,
          },
          {
            role: 'user',
            content: `请为以下方剂生成一个临床病案：

方剂：${formula.name}
组成：${formula.composition.join('、')}
功效：${formula.functions.join('，')}
主治：${formula.indications.join('，')}
君药：${formula.jun}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
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
          const aiResult = JSON.parse(jsonMatch[0]);
          return {
            id: `case_${formulaId}_${Date.now()}`,
            formulaId,
            patientInfo: aiResult.patientInfo,
            symptoms: aiResult.symptoms,
            tongue: aiResult.tongue,
            pulse: aiResult.pulse,
            correctTreatment: formula.functions[0],
            correctFormula: formula.name,
            correctJun: formula.jun,
            explanation: aiResult.explanation,
          };
        }
      } catch {
        console.warn('Failed to parse AI response, using local case');
      }
    }

    return generateLocalClinicalCase(formulaId);
  } catch (error) {
    console.error('AI service error:', error);
    return generateLocalClinicalCase(formulaId);
  }
}

// 本地生成病案（API不可用时的备用方案）
function generateLocalClinicalCase(formulaId: string): ClinicalCase | null {
  const formula = formulaData[formulaId];
  if (!formula) return null;

  const templates = caseTemplates[formulaId];
  if (templates && templates.length > 0) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    return {
      id: `case_${formulaId}_${Date.now()}`,
      formulaId,
      patientInfo: template.patientInfo || '患者，男，30岁',
      symptoms: template.symptoms || formula.indications.slice(0, 5),
      tongue: template.tongue || '舌淡苔白',
      pulse: template.pulse || '脉浮',
      correctTreatment: template.correctTreatment || formula.functions[0],
      correctFormula: formula.name,
      correctJun: formula.jun,
      explanation: `患者表现为${formula.indications.join('、')}，符合${formula.name}证。${formula.name}功效为${formula.functions.join('、')}，${formula.jun}为君药。`,
    };
  }

  // 通用模板
  return {
    id: `case_${formulaId}_${Date.now()}`,
    formulaId,
    patientInfo: '患者，男，35岁',
    symptoms: formula.indications.slice(0, 5),
    tongue: '舌淡苔白',
    pulse: '脉浮',
    correctTreatment: formula.functions[0],
    correctFormula: formula.name,
    correctJun: formula.jun,
    explanation: `患者表现为${formula.indications.join('、')}，治宜${formula.functions.join('、')}，方用${formula.name}，${formula.jun}为君。`,
  };
}

// 获取方剂列表（用于临床实习选择）
export function getAvailableFormulas(): Array<{ id: string; name: string; category: string }> {
  return Object.entries(formulaData).map(([id, data]) => ({
    id,
    name: data.name,
    category: getFormulaCategory(data.name),
  }));
}

// 获取方剂分类
function getFormulaCategory(name: string): string {
  const categories: Record<string, string> = {
    '麻黄汤': '解表剂',
    '桂枝汤': '解表剂',
    '银翘散': '解表剂',
    '四君子汤': '补益剂',
    '四物汤': '补益剂',
    '参苓白术散': '补益剂',
    '理中丸': '温里剂',
    '小青龙汤': '解表剂',
    '半夏泻心汤': '和解剂',
    '大承气汤': '泻下剂',
  };
  return categories[name] || '其他';
}

