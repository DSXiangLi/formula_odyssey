/**
 * 新绘图指令测试脚本 - 使用环境变量
 * 安全版本：从.env读取API Key，不在代码中硬编码
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 手动读取.env文件
function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        // 去除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  } catch (e) {
    console.error('无法加载.env文件:', e.message);
  }
}

// 加载环境变量
loadEnv(path.join(__dirname, '../../../.env'));

const API_KEY = process.env.SEED_IMAGE_KEY;
const MODEL = process.env.SEED_MODEL_NAME || 'doubao-seedream-4-5-251128';
const OUTPUT_DIR = path.join(__dirname, '../../public/images/test-new-prompt');

if (!API_KEY) {
  console.error('错误：未找到API Key，请检查.env文件中的SEED_IMAGER_KEY设置');
  process.exit(1);
}

// 3个测试药物 - 使用新的Prompt
const TEST_MEDICINES = [
  {
    id: 'mahuang',
    name: '麻黄',
    type: 'plant',
    prompt: '中药麻黄，专业摄影，4K高清，无背景'
  },
  {
    id: 'mahuang',
    name: '麻黄',
    type: 'herb',
    prompt: '中药麻黄饮片，专业摄影，4K高清，无背景'
  },
  {
    id: 'guizhi',
    name: '桂枝',
    type: 'plant',
    prompt: '中药桂枝，专业摄影，4K高清，无背景'
  },
  {
    id: 'guizhi',
    name: '桂枝',
    type: 'herb',
    prompt: '中药桂枝饮片，专业摄影，4K高清，无背景'
  },
  {
    id: 'zisu',
    name: '紫苏',
    type: 'plant',
    prompt: '中药紫苏，专业摄影，4K高清，无背景'
  },
  {
    id: 'zisu',
    name: '紫苏',
    type: 'herb',
    prompt: '中药紫苏饮片，专业摄影，4K高清，无背景'
  }
];

async function generateImage(prompt, outputPath) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      width: 1024,
      height: 1024
    });

    const options = {
      hostname: 'ark.cn-beijing.volces.com',
      path: '/api/v3/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`  Generating: ${path.basename(outputPath)}...`);
    console.log(`  Prompt: ${prompt}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.data && response.data[0] && response.data[0].url) {
            const file = fs.createWriteStream(outputPath);
            https.get(response.data[0].url, (r) => {
              r.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log('  ✓ Success');
                resolve();
              });
            });
          } else {
            reject(new Error(JSON.stringify(response)));
          }
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('========================================');
  console.log('  新绘图指令测试（安全版本）');
  console.log('  使用环境变量读取API Key');
  console.log('========================================\n');

  // 创建输出目录
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const medicine of TEST_MEDICINES) {
    const outputPath = path.join(OUTPUT_DIR, `${medicine.id}_${medicine.type}.jpg`);

    console.log(`\n🌿 ${medicine.name} (${medicine.type === 'plant' ? '原植物' : '饮片'})`);
    try {
      await generateImage(medicine.prompt, outputPath);
      success++;
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
      failed++;
    }
    await sleep(3000);
  }

  console.log('\n========================================');
  console.log('  Generation Complete');
  console.log(`  Success: ${success}/${TEST_MEDICINES.length}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log('========================================');
}

main().catch(console.error);
