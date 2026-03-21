// 图像验证服务 - 使用Qwen-VL API

const QWEN_VL_URL = import.meta.env.VITE_QWEN_VL_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_VL_KEY = import.meta.env.VITE_QWEN_VL_KEY || '';
const QWEN_VL_MODEL = import.meta.env.VITE_QWEN_VL_MODEL_NAME || 'qwen-vl-max';

export interface ImageValidationResult {
  isValid: boolean;
  score: number; // 0-100
  feedback: string;
  issues: string[];
  suggestions: string[];
}

// 验证图像
export async function validateImage(
  imageUrl: string,
  criteria: {
    style?: string;
    colors?: string[];
    subject?: string;
    quality?: string;
  }
): Promise<ImageValidationResult | null> {
  if (!QWEN_VL_KEY) {
    console.error('Qwen-VL API key not configured');
    return null;
  }

  try {
    const prompt = `请分析这张图片，评估其是否符合以下标准：
${criteria.style ? `- 风格要求：${criteria.style}` : ''}
${criteria.colors ? `- 色彩要求：${criteria.colors.join('、')}` : ''}
${criteria.subject ? `- 主题内容：${criteria.subject}` : ''}
${criteria.quality ? `- 质量要求：${criteria.quality}` : ''}

请按以下格式返回：
1. 整体评分（0-100分）
2. 是否符合要求（是/否）
3. 存在的问题（如有）
4. 改进建议（如有）`;

    const response = await fetch(QWEN_VL_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_VL_KEY}`,
      },
      body: JSON.stringify({
        model: QWEN_VL_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', image: imageUrl },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image validation failed:', errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析返回内容
    return parseValidationResponse(content);
  } catch (error) {
    console.error('Image validation error:', error);
    return null;
  }
}

// 解析验证响应
function parseValidationResponse(content: string): ImageValidationResult {
  // 尝试提取分数
  const scoreMatch = content.match(/(\d+)/);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50;

  // 判断是否有效（分数>=70且没有严重问题）
  const isValid = score >= 70 && !content.includes('不符合') && !content.includes('严重');

  // 提取问题
  const issues: string[] = [];
  const issueMatches = content.match(/问题[：:](.+?)(?=\n|$)/g);
  if (issueMatches) {
    issueMatches.forEach((match) => {
      const issue = match.replace(/问题[：:]/, '').trim();
      if (issue) issues.push(issue);
    });
  }

  // 提取建议
  const suggestions: string[] = [];
  const suggestionMatches = content.match(/建议[：:](.+?)(?=\n|$)/g);
  if (suggestionMatches) {
    suggestionMatches.forEach((match) => {
      const suggestion = match.replace(/建议[：:]/, '').trim();
      if (suggestion) suggestions.push(suggestion);
    });
  }

  return {
    isValid,
    score,
    feedback: content,
    issues,
    suggestions,
  };
}

// 批量验证图像
export async function validateImages(
  images: { name: string; url: string; criteria: any }[]
): Promise<Record<string, ImageValidationResult | null>> {
  const results: Record<string, ImageValidationResult | null> = {};

  for (const { name, url, criteria } of images) {
    console.log(`Validating image: ${name}...`);
    const result = await validateImage(url, criteria);
    results[name] = result;

    // 添加延迟以避免速率限制
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// 验证区域背景图
export async function validateRegionBackgrounds(
  images: Record<string, string | null>
): Promise<Record<string, ImageValidationResult | null>> {
  const validations: { name: string; url: string; criteria: any }[] = [];

  const regionCriteria: Record<string, any> = {
    mountain: {
      style: '新国风+东方幻想风格，水墨意境+水晶元素',
      colors: ['冷白', '浅蓝', '冰晶反光'],
      subject: '高山雪景，冰川，寒冷氛围',
      quality: '4K游戏背景质量',
    },
    forest: {
      style: '新国风+东方幻想风格，水墨意境',
      colors: ['深绿', '墨绿', '金色光斑'],
      subject: '茂密森林，古树，神秘氛围',
      quality: '4K游戏背景质量',
    },
    flower: {
      style: '新国风+东方幻想风格，温暖明媚',
      colors: ['粉红', '明黄', '橙金'],
      subject: '花海，野花，蝴蝶飞舞',
      quality: '4K游戏背景质量',
    },
    stream: {
      style: '新国风+东方幻想风格，宁静清凉',
      colors: ['青绿', '水蓝', '白色雾气'],
      subject: '溪流，水雾，芦苇',
      quality: '4K游戏背景质量',
    },
    cliff: {
      style: '新国风+东方幻想风格，神秘庄严',
      colors: ['灰褐', '赭石', '矿石荧光'],
      subject: '岩壁，洞穴，矿石',
      quality: '4K游戏背景质量',
    },
  };

  for (const [name, url] of Object.entries(images)) {
    if (url) {
      validations.push({
        name,
        url,
        criteria: regionCriteria[name] || {},
      });
    }
  }

  return validateImages(validations);
}

// 验证药灵种子图
export async function validateSeedImages(
  images: Record<string, string | null>
): Promise<Record<string, ImageValidationResult | null>> {
  const validations: { name: string; url: string; criteria: any }[] = [];

  const criteria = {
    style: '新国风+东方幻想风格，水晶质感',
    colors: ['金色', '透明', '微光'],
    subject: '水晶包裹的种子，半透明，内部发光',
    quality: '游戏图标质量',
  };

  for (const [name, url] of Object.entries(images)) {
    if (url) {
      validations.push({ name, url, criteria });
    }
  }

  return validateImages(validations);
}

// 生成验证报告
export function generateValidationReport(
  results: Record<string, ImageValidationResult | null>
): string {
  let report = '# 图像验证报告\n\n';
  let validCount = 0;
  let totalCount = 0;

  for (const [name, result] of Object.entries(results)) {
    totalCount++;
    if (result?.isValid) validCount++;

    report += `## ${name}\n`;
    if (result) {
      report += `- **评分**: ${result.score}/100\n`;
      report += `- **状态**: ${result.isValid ? '✅ 通过' : '❌ 未通过'}\n`;
      if (result.issues.length > 0) {
        report += `- **问题**: ${result.issues.join(', ')}\n`;
      }
      if (result.suggestions.length > 0) {
        report += `- **建议**: ${result.suggestions.join(', ')}\n`;
      }
    } else {
      report += '- **状态**: ⚠️ 验证失败\n';
    }
    report += '\n';
  }

  report += `## 汇总\n`;
  report += `- **通过**: ${validCount}/${totalCount}\n`;
  report += `- **通过率**: ${Math.round((validCount / totalCount) * 100)}%\n`;

  return report;
}
