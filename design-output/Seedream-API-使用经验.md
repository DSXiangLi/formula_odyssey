# Seedream API 使用经验记录

## 版本信息
- **文档版本**: 1.0
- **更新日期**: 2026-03-21
- **适用模型**: doubao-seedream-4-5-251128

---

## 关键发现

### ❌ 不支持的参数

以下参数**不应**在API请求中使用，会导致请求失败或异常：

| 参数名 | 问题说明 |
|--------|----------|
| `negative_prompt` | ❌ 不支持负面提示词 |
| `sampling_steps` / `steps` | ❌ 不支持自定义采样步数 |
| `guidance_scale` | ❌ 不支持自定义引导系数 |

### ✅ 正确的请求格式

```json
{
  "model": "doubao-seedream-4-5-251128",
  "prompt": "中药麻黄，专业摄影，4K高清，无背景",
  "width": 1024,
  "height": 1024
}
```

**必需字段**:
- `model`: 模型名称
- `prompt`: 图片生成提示词
- `width`: 图片宽度（推荐1024）
- `height`: 图片高度（推荐1024）

---

## 更新记录

### 已修正文件

| 文件路径 | 修改内容 |
|----------|----------|
| `src/scripts/image-generation/test-new-prompt.js` | 移除 `negative_prompt`, `sampling_steps`, `guidance_scale` |
| `scripts/generate_images.py` | 移除 `negative_prompt`, `steps`, `guidance_scale` 参数引用 |
| `design-output/生图Prompt配置v2.0.json` | 从 `apiConfig.seedream.parameters` 中移除 `steps`, `guidanceScale`, `negativePrompt` |
| `design-output/AI生图自动化流水线v2.0.md` | 更新示例代码，移除不支持参数 |

---

## Prompt设计建议

由于无法使用 `negative_prompt`，建议在正面Prompt中明确表达需求：

### 推荐Prompt模板

**原植物图**:
```
中药{name}，专业摄影，4K高清，无背景
```

**饮片图**:
```
中药{name}饮片，专业摄影，4K高清，无背景
```

### 正面表达技巧

| 想避免的内容 | 正面表达方式 |
|--------------|--------------|
| 低质量/模糊 | 添加"4K高清"、"专业摄影"、"清晰" |
| 动漫/卡通风格 | 添加"写实"、"专业摄影" |
| 文字/水印 | 添加"无背景"（虽然不能保证完全透明，但有助于减少杂乱元素） |

---

## API安全实践

### ✅ 推荐做法

1. **使用环境变量存储API Key**
   ```javascript
   const API_KEY = process.env.SEED_IMAGE_KEY;
   ```

2. **将.env添加到.gitignore**
   ```
   .env
   ```

3. **定期轮换API Key**
   - 建议每月更换一次
   - 发现泄露立即重置

### ❌ 禁止做法

- 切勿在代码中硬编码API Key
- 切勿将包含Key的代码提交到Git仓库
- 切勿在日志中打印Key

---

## 测试验证

### 测试脚本运行

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
node scripts/image-generation/test-new-prompt.js
```

### 预期输出

```
========================================
  新绘图指令测试（安全版本）
  使用环境变量读取API Key
========================================

🌿 麻黄 (原植物)
  Generating: mahuang_plant.jpg...
  Prompt: 中药麻黄，专业摄影，4K高清，无背景
  ✓ Success
...
========================================
  Generation Complete
  Success: 6/6
  Failed: 0
========================================
```

---

## 注意事项

1. **模型差异**: 不同版本的Seedream模型支持的参数可能不同，请以实际测试为准
2. **Prompt质量**: 由于不支持负面提示，正面Prompt的质量变得更加重要
3. **图片尺寸**: 建议保持1024x1024，其他尺寸可能产生不可预期结果
4. **API限制**: 注意查看API调用频率限制和配额

---

## 参考资源

- Volces API文档: https://www.volces.com/
- Seedream模型说明: https://www.volces.com/docs/
