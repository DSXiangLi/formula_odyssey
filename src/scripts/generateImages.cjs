#!/usr/bin/env node
/**
 * 图像生成脚本
 * 生成所有游戏所需的图像资源
 */

const fs = require('fs');
const path = require('path');

// 从.env文件加载配置
function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)="(.+)"$/);
    if (match) {
      env[match[1]] = match[2];
    }
  });

  return env;
}

const env = loadEnv();

// 图像生成配置
const SEED_IMAGE_URL = env.SEED_IMAGE_URL;
const SEED_API_KEY = env.SEED_IMAGER_KEY;
const SEED_MODEL = env.SEED_MODEL_NAME;

const QWEN_VL_URL = env.QWEN_VL_URL;
const QWEN_VL_KEY = env.QWEN_VL_KEY;
const QWEN_VL_MODEL = env.QWEN_VL_MODEL_NAME;

// 生成单张图像
async function generateImage(name, prompt, width = 1024, height = 1024) {
  console.log(`🎨 正在生成: ${name}...`);

  try {
    const response = await fetch(SEED_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SEED_API_KEY}`,
      },
      body: JSON.stringify({
        model: SEED_MODEL,
        prompt: prompt,
        width: width,
        height: height,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ ${name} 生成失败:`, error);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (imageUrl) {
      console.log(`✅ ${name} 生成成功`);
      return imageUrl;
    }

    return null;
  } catch (error) {
    console.error(`❌ ${name} 生成错误:`, error);
    return null;
  }
}

// 验证图像
async function validateImage(name, imageUrl, criteria) {
  console.log(`🔍 正在验证: ${name}...`);

  try {
    const prompt = `请分析这张图片，评估其是否符合以下标准：
${criteria.style ? `- 风格要求：${criteria.style}` : ''}
${criteria.colors ? `- 色彩要求：${criteria.colors.join('、')}` : ''}
${criteria.subject ? `- 主题内容：${criteria.subject}` : ''}

请返回JSON格式：{"score": 分数(0-100), "isValid": 是否符合(true/false), "feedback": "评价说明"}`;

    const response = await fetch(`${QWEN_VL_URL}/chat/completions`, {
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
      console.error(`❌ ${name} 验证失败`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试解析JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log(`✅ ${name} 验证完成: ${result.score}分`);
        return result;
      }
    } catch {
      console.log(`⚠️ ${name} 验证结果解析失败`);
    }

    return { score: 50, isValid: true, feedback: content };
  } catch (error) {
    console.error(`❌ ${name} 验证错误:`, error);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🎮 药灵山谷 - 图像生成工具\n');

  const outputDir = path.join(__dirname, '../public/images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 生成配置
  const imagesToGenerate = [
    // 五大区域背景图
    {
      name: 'region_mountain',
      prompt: 'Mystical snow mountain peak in traditional Chinese fantasy style, crystal-clear ice formations, soft blue and white color palette #E8F4F8, glowing ice crystals, ethereal mist floating between peaks, sacred atmosphere, ink wash painting merged with magical elements, parallax game background, 4K, wide landscape view 1920x1080',
      width: 1920,
      height: 1080,
      criteria: {
        style: '新国风+东方幻想风格',
        colors: ['冷白', '浅蓝', '#E8F4F8'],
        subject: '高山雪景',
      },
    },
    {
      name: 'region_forest',
      prompt: 'Enchanted ancient Chinese forest, massive trees with twisted roots, dappled sunlight through canopy, moss-covered rocks, mysterious atmosphere, jade green and deep green tones #1B4D3E #2D5A4A, traditional ink wash meets fantasy art style, magical golden particles floating, parallax game background, 4K, wide landscape view 1920x1080',
      width: 1920,
      height: 1080,
      criteria: {
        style: '新国风+东方幻想风格',
        colors: ['深绿', '墨绿', '#1B4D3E'],
        subject: '茂密森林',
      },
    },
    {
      name: 'region_flower',
      prompt: 'Blossoming flower field in traditional Chinese style, endless sea of chrysanthemums and wildflowers, soft golden afternoon light, butterflies and petals dancing, warm color palette of gold #D4A574 pink and orange, ethereal dreamy atmosphere, Studio Ghibli inspired, parallax game background, 4K, wide landscape view 1920x1080',
      width: 1920,
      height: 1080,
      criteria: {
        style: '新国风+东方幻想风格',
        colors: ['琥珀', '粉色', '#D4A574'],
        subject: '花海',
      },
    },
    {
      name: 'region_stream',
      prompt: 'Serene Chinese mountain stream, crystal clear water flowing over smooth stones, reeds and water plants along banks, morning mist rising, cool teal and jade color palette #4A7C8B, peaceful zen atmosphere, traditional landscape painting style with fantasy touches, parallax game background, 4K, wide landscape view 1920x1080',
      width: 1920,
      height: 1080,
      criteria: {
        style: '新国风+东方幻想风格',
        colors: ['青绿', '水蓝', '#4A7C8B'],
        subject: '溪流',
      },
    },
    {
      name: 'region_cliff',
      prompt: 'Mysterious rocky cliff face, ancient stone formations, exposed mineral veins glowing faintly, cave entrances shrouded in shadow, earth tone palette of grays and browns #5C4033, mystical atmosphere, traditional Chinese landscape merged with fantasy elements, parallax game background, 4K, wide landscape view 1920x1080',
      width: 1920,
      height: 1080,
      criteria: {
        style: '新国风+东方幻想风格',
        colors: ['灰褐', '赭石', '#5C4033'],
        subject: '岩壁',
      },
    },
    // 种子图像
    {
      name: 'seed_crystal',
      prompt: 'Crystal orb containing herb silhouette, translucent glass-like material, inner golden glow #C9A961, floating golden particles around, traditional Chinese fantasy style, magical and mysterious, dark background, game asset icon, centered, 4K',
      width: 512,
      height: 512,
      criteria: {
        style: '水晶质感+东方幻想',
        colors: ['金色', '透明', '#C9A961'],
        subject: '水晶种子',
      },
    },
    {
      name: 'seed_collected',
      prompt: 'Golden glowing crystal orb with herb visible inside, bright inner light, magical energy radiating golden rays, traditional Chinese fantasy style, transparent background, game special effect, 4K',
      width: 512,
      height: 512,
      criteria: {
        style: '水晶质感+东方幻想',
        colors: ['金色', '#C9A961'],
        subject: '已收集种子',
      },
    },
    // 核心药灵形象（10个）
    {
      name: 'spirit_mahuang',
      prompt: 'Young warrior character representing Ephedra herb (麻黄), traditional Chinese clothing with desert elements, warm color tones reds and oranges, confident pose, holding spear-like staff, new Chinese style character design, full body, 4K, game character portrait',
      width: 1024,
      height: 1024,
      criteria: {
        style: '新国风+东方幻想',
        colors: ['红色', '橙色'],
        subject: '麻黄拟人化',
      },
    },
    {
      name: 'spirit_renshen',
      prompt: 'Wise elder character representing Ginseng (人参), traditional Chinese scholar robes in deep red and gold #C9A961, long white beard resembling ginseng roots, kind smile, holding scroll, new Chinese style character design, full body, 4K, game character portrait',
      width: 1024,
      height: 1024,
      criteria: {
        style: '新国风+东方幻想',
        colors: ['红色', '金色', '#C9A961'],
        subject: '人参拟人化',
      },
    },
    {
      name: 'spirit_lingzhi',
      prompt: 'Immortal fairy character representing Ganoderma (灵芝), ethereal robes in purple and gold, glowing aura, mushroom-shaped headdress, tranquil expression, new Chinese style character design, full body, 4K, game character portrait',
      width: 1024,
      height: 1024,
      criteria: {
        style: '新国风+东方幻想',
        colors: ['紫色', '金色'],
        subject: '灵芝拟人化',
      },
    },
    {
      name: 'spirit_jinyinhua',
      prompt: 'Dual-toned character representing Honeysuckle (金银花), split design with gold #C9A961 and silver elements, twin flower accessories, lively and energetic pose, new Chinese style character design, full body, 4K, game character portrait',
      width: 1024,
      height: 1024,
      criteria: {
        style: '新国风+东方幻想',
        colors: ['金色', '银色', '#C9A961'],
        subject: '金银花拟人化',
      },
    },
    {
      name: 'spirit_guizhi',
      prompt: 'Elegant female character representing Cinnamon twig (桂枝), flowing hanfu dress in warm pink and gold #C9A961, gentle but determined expression, branches as hair ornaments, new Chinese style character design, full body, 4K, game character portrait',
      width: 1024,
      height: 1024,
      criteria: {
        style: '新国风+东方幻想',
        colors: ['粉色', '金色', '#C9A961'],
        subject: '桂枝拟人化',
      },
    },
  ];

  const results = {};
  const validationResults = {};

  // 生成所有图像
  for (const config of imagesToGenerate) {
    const url = await generateImage(config.name, config.prompt, config.width, config.height);
    results[config.name] = url;

    if (url) {
      // 验证图像
      const validation = await validateImage(config.name, url, config.criteria);
      validationResults[config.name] = validation;
    }

    // 延迟避免速率限制
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // 保存结果
  const report = {
    generated: new Date().toISOString(),
    images: results,
    validations: validationResults,
  };

  fs.writeFileSync(
    path.join(outputDir, 'generation-report.json'),
    JSON.stringify(report, null, 2)
  );

  // 生成验证报告
  let reportMarkdown = '# 图像生成与验证报告\n\n';
  reportMarkdown += `生成时间: ${new Date().toLocaleString()}\n\n`;

  let validCount = 0;
  let totalCount = 0;

  for (const [name, validation] of Object.entries(validationResults)) {
    totalCount++;
    if (validation?.isValid) validCount++;

    reportMarkdown += `## ${name}\n`;
    reportMarkdown += `- **图像URL**: ${results[name] || '生成失败'}\n`;
    if (validation) {
      reportMarkdown += `- **评分**: ${validation.score}/100\n`;
      reportMarkdown += `- **状态**: ${validation.isValid ? '✅ 通过' : '❌ 未通过'}\n`;
      reportMarkdown += `- **评价**: ${validation.feedback}\n`;
    } else {
      reportMarkdown += `- **状态**: ⚠️ 未验证\n`;
    }
    reportMarkdown += '\n';
  }

  reportMarkdown += `## 汇总\n`;
  reportMarkdown += `- **总生成数**: ${totalCount}\n`;
  reportMarkdown += `- **验证通过**: ${validCount}\n`;
  reportMarkdown += `- **通过率**: ${Math.round((validCount / totalCount) * 100)}%\n`;

  fs.writeFileSync(
    path.join(outputDir, 'validation-report.md'),
    reportMarkdown
  );

  console.log('\n✨ 图像生成完成！');
  console.log(`📊 生成数: ${totalCount}, 通过: ${validCount}`);
  console.log(`📁 报告已保存至: ${outputDir}`);
}

main().catch(console.error);
