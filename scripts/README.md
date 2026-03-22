# AI生图自动化流水线

药灵山谷 v2.0 图片资源批量生成系统

## 概述

使用Seedream/豆包API批量生成18味药的三层图片 + 5个场景背景

- **总图片数**: 59张 (18药×3层 + 5场景)
- **预估成本**: ¥12-18
- **生成时间**: 约7-8小时

## 目录结构

```
scripts/
├── generate_images.py    # 批量生图脚本
├── validate_images.py    # 质量验证脚本
└── README.md

src/public/images/
├── medicines/
│   ├── plant/           # 原植物图
│   ├── herb/            # 饮片图
│   └── micro/           # 显微图
└── scenes/              # 场景背景
```

## 快速开始

### 1. 配置环境变量

确保 `.env` 文件已配置：

```bash
# 图像生成模型 (Seedream)
SEEDREAM_API_KEY="your_seedream_api_key"
SEEDREAM_URL="https://api.volces.com/seedream"

# 图像验证模型 (Qwen-VL)
DASHSCOPE_API_KEY="your_dashscope_api_key"
```

### 2. 安装依赖

```bash
cd scripts
pip install requests
```

### 3. 生成图片

```bash
# 生成所有图片
python generate_images.py --all

# 生成指定批次
python generate_images.py --batch batch1

# 生成指定药物
python generate_images.py --medicine mahuang

# 生成指定场景
python generate_images.py --scene qingmulin
```

### 4. 验证质量

```bash
# 验证所有图片
python validate_images.py --all

# 验证指定批次
python validate_images.py --batch batch1

# 验证单张图片
python validate_images.py --image ../src/public/images/medicines/plant/mahuang_plant.jpg plant mahuang
```

## 批次规划

| 批次 | 内容 | 数量 | 预估时间 |
|------|------|------|----------|
| batch1 | 解表药+清热药(8味) | 24张 | 2小时 |
| batch2 | 补益药核心(4味) | 12张 | 1.5小时 |
| batch3 | 补血药(4味) | 12张 | 1.5小时 |
| batch4 | 泻下药+其他(2味) | 6张 | 1小时 |
| batch5 | 五行场景(5个) | 5张 | 1.5小时 |

## 配置文件

图片生成配置位于：
`design-output/生图Prompt配置v2.0.json`

包含：
- 18味药物的详细Prompt
- 5个场景的Prompt
- 生图参数配置

## API参数

```json
{
  "width": 1024,
  "height": 1024,
  "steps": 30,
  "guidanceScale": 7.5
}
```

## 质量评分

| 分数 | 等级 | 处理建议 |
|------|------|----------|
| 8-10 | 优秀 | 直接使用 |
| 6-8 | 良好 | 可用，可选优化 |
| <6 | 需改进 | 建议重绘 |

## 注意事项

1. **API速率限制**: Seedream API有速率限制，脚本已设置适当延迟
2. **并行度**: 默认3线程并行，可根据API限制调整
3. **断点续传**: 已生成的图片会自动跳过
4. **质量验证**: 建议生成后运行验证脚本

## 输出报告

生成完成后会输出：
- `generation_report.json` - 生成报告
- `validation_report.json` - 验证报告
- `retry_list.txt` - 需要重绘的图片列表

## 故障排除

### API调用失败
- 检查API密钥是否正确
- 确认网络可以访问Volces和DashScope
- 查看API使用配额

### 图片质量不佳
- 运行验证脚本获取AI评分
- 根据建议调整Prompt
- 重新生成低分图片

### 生成中断
- 重新运行命令会自动跳过已生成图片
- 查看generation_report.json了解进度
