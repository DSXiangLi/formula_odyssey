// 图像生成服务 - 使用Seedream API

const SEED_IMAGE_URL = import.meta.env.VITE_SEED_IMAGE_URL || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const SEED_API_KEY = import.meta.env.VITE_SEED_IMAGE_KEY || '';
const SEED_MODEL = import.meta.env.VITE_SEED_MODEL_NAME || 'doubao-seedream-4-5-251128';

// 生成图像
export async function generateImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    seed?: number;
  } = {}
): Promise<string | null> {
  if (!SEED_API_KEY) {
    console.error('Seedream API key not configured');
    return null;
  }

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
        width: options.width || 1024,
        height: options.height || 1024,
        seed: options.seed || Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation failed:', errorText);
      return null;
    }

    const data = await response.json();
    // 假设API返回的是base64图像数据或URL
    return data.data?.[0]?.url || data.data?.[0]?.b64_json || null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

// 批量生成图像
export async function generateImages(
  prompts: { name: string; prompt: string; width?: number; height?: number }[]
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  for (const { name, prompt, width, height } of prompts) {
    console.log(`Generating image: ${name}...`);
    const imageUrl = await generateImage(prompt, { width, height });
    results[name] = imageUrl;

    // 添加延迟以避免速率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

// 生成区域背景图
export async function generateRegionBackgrounds(): Promise<Record<string, string | null>> {
  const prompts = [
    {
      name: 'mountain',
      prompt: 'Mystical snow mountain peak in traditional Chinese fantasy style, crystal-clear ice formations, soft blue and white color palette, glowing ice crystals, ethereal mist floating between peaks, sacred atmosphere, ink wash painting merged with magical elements, 4K game background, wide landscape view',
      width: 1920,
      height: 1080,
    },
    {
      name: 'forest',
      prompt: 'Enchanted ancient Chinese forest, massive trees with twisted roots, dappled sunlight through canopy, moss-covered rocks, mysterious atmosphere, jade green and amber tones, traditional ink wash meets fantasy art style, magical particles floating, 4K game background, wide landscape view',
      width: 1920,
      height: 1080,
    },
    {
      name: 'flower',
      prompt: 'Blossoming flower field in traditional Chinese style, endless sea of chrysanthemums and wildflowers, soft golden afternoon light, butterflies and petals dancing, warm color palette of gold pink and orange, ethereal dreamy atmosphere, Studio Ghibli inspired, 4K game background, wide landscape view',
      width: 1920,
      height: 1080,
    },
    {
      name: 'stream',
      prompt: 'Serene Chinese mountain stream, crystal clear water flowing over smooth stones, reeds and water plants along banks, morning mist rising, cool teal and jade color palette, peaceful zen atmosphere, traditional landscape painting style with fantasy touches, 4K game background, wide landscape view',
      width: 1920,
      height: 1080,
    },
    {
      name: 'cliff',
      prompt: 'Mysterious rocky cliff face, ancient stone formations, exposed mineral veins glowing faintly, cave entrances shrouded in shadow, earth tone palette of grays and browns, mystical atmosphere, traditional Chinese landscape merged with fantasy elements, 4K game background, wide landscape view',
      width: 1920,
      height: 1080,
    },
  ];

  return generateImages(prompts);
}

// 生成药灵种子图
export async function generateSeedImages(): Promise<Record<string, string | null>> {
  const prompts = [
    {
      name: 'seed_base',
      prompt: 'Crystal orb containing herb silhouette, translucent glass-like material, inner golden glow, floating golden particles around, traditional Chinese fantasy style, magical and mysterious, soft gradient background, game asset icon, centered, 4K',
      width: 512,
      height: 512,
    },
    {
      name: 'seed_glow',
      prompt: 'Golden glowing crystal orb, bright inner light, magical energy radiating, traditional Chinese fantasy style, transparent background preferred, game special effect, 4K',
      width: 512,
      height: 512,
    },
  ];

  return generateImages(prompts);
}

// 生成药灵形象
export async function generateMedicineSpirits(
  medicines: { id: string; name: string; description: string }[]
): Promise<Record<string, string | null>> {
  const prompts = medicines.map((med) => ({
    name: `spirit_${med.id}`,
    prompt: `${med.description}, new Chinese style character design, full body, traditional Chinese clothing, fantasy elements, 4K, game character portrait`,
    width: 1024,
    height: 1024,
  }));

  return generateImages(prompts);
}

// 生成UI元素
export async function generateUIElements(): Promise<Record<string, string | null>> {
  const prompts = [
    {
      name: 'button_frame',
      prompt: 'Traditional Chinese style game button frame, rice paper texture background, golden ink brush stroke border, elegant calligraphy style, subtle glow effect, high quality UI asset, transparent background, 4K',
      width: 512,
      height: 256,
    },
    {
      name: 'dialog_frame',
      prompt: 'Ancient Chinese medicine book border design, ancient scroll aesthetic, rice paper texture, golden ink accents, corner ornaments with herbal motifs, high quality UI frame, transparent background, 4K',
      width: 1024,
      height: 1024,
    },
    {
      name: 'title_logo',
      prompt: 'Chinese calligraphy game title "药灵山谷", golden brush strokes, ink wash background, elegant and mysterious, traditional Chinese style, logo design, 4K',
      width: 1024,
      height: 512,
    },
  ];

  return generateImages(prompts);
}
