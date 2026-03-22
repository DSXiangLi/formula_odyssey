# AI生图自动化流水线

**版本**: 2.0
**日期**: 2026-03-21

---

## 概述

本项目采用全自动化AI生图策略，通过Seedream/豆包API批量生成所有药物图片资源。

### 生图策略

- **零人工收集**: 所有图片由AI自动生成
- **批量自动化**: 一键生成50味药的三层图片
- **AI质量验证**: 使用Qwen-VL自动验证图片质量
- **成本优化**: 相比传统美术外包降低90%成本

---

## 三层图片架构

### 第一层：原植物图

| 属性 | 说明 |
|------|------|
| 用途 | 水晶球中未收集状态的"种子"视觉 |
| 内容 | 药物原生状态（植物/矿物/动物） |
| 风格 | 专业植物志摄影 + 新国风水墨 |
| 分辨率 | 1024×1024 |

### 第二层：饮片图

| 属性 | 说明 |
|------|------|
| 用途 | 收集成功后在图鉴中展示 |
| 内容 | 加工后的中药材（饮片/切片） |
| 风格 | 专业药材摄影 + 水墨质感 |
| 分辨率 | 1024×1024 |

### 第三层：显微图

| 属性 | 说明 |
|------|------|
| 用途 | 亲密度达"知己"等级后解锁 |
| 内容 | 显微鉴别特征（粉末/组织） |
| 风格 | 科学插图 + 医学图谱 |
| 分辨率 | 1024×1024 |

---

## 生图批次规划

### 批次1: 解表药 + 清热药 (8味)

| 序号 | 药名 | 五行 | 优先级 |
|------|------|------|--------|
| 1 | 麻黄 | 金 | 高 |
| 2 | 桂枝 | 火 | 高 |
| 3 | 紫苏 | 金 | 高 |
| 4 | 生姜 | 金 | 高 |
| 5 | 石膏 | 水 | 高 |
| 6 | 知母 | 水 | 高 |
| 7 | 金银花 | 金 | 高 |
| 8 | 连翘 | 火 | 高 |

**预估时间**: 2小时 (24张图)

### 批次2: 补益药核心 (4味)

| 序号 | 药名 | 五行 | 优先级 |
|------|------|------|--------|
| 9 | 人参 | 火 | 高 |
| 10 | 黄芪 | 土 | 高 |
| 11 | 白术 | 土 | 高 |
| 12 | 茯苓 | 土 | 高 |

**预估时间**: 1.5小时 (12张图)

### 批次3: 补血药 (4味)

| 序号 | 药名 | 五行 | 优先级 |
|------|------|------|--------|
| 13 | 当归 | 木 | 高 |
| 14 | 川芎 | 木 | 高 |
| 15 | 白芍 | 木 | 高 |
| 16 | 熟地黄 | 水 | 高 |

**预估时间**: 1.5小时 (12张图)

### 批次4: 泻下药 + 其他 (2味)

| 序号 | 药名 | 五行 | 优先级 |
|------|------|------|--------|
| 17 | 大黄 | 土 | 中 |
| 18 | 芒硝 | 水 | 中 |

**预估时间**: 1小时 (6张图)

### 批次5: 五行场景背景 (5张)

| 序号 | 场景 | 五行 | 优先级 |
|------|------|------|--------|
| 1 | 青木林 | 木 | 高 |
| 2 | 赤焰峰 | 火 | 高 |
| 3 | 黄土丘 | 土 | 高 |
| 4 | 白金原 | 金 | 高 |
| 5 | 黑水潭 | 水 | 高 |

**预估时间**: 1.5小时 (5张图)

---

## 自动化脚本设计

### Python脚本架构

```python
# batch_generate.py

import json
import requests
import os
from typing import List, Dict

class ImageGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.volces.com/seedream/generate"
        self.output_dir = "assets/images"

    def generate_plant_image(self, medicine: Dict) -> str:
        """生成原植物图"""
        prompt = self._build_plant_prompt(medicine)
        return self._call_api(prompt, f"{medicine['id']}_plant")

    def generate_herb_image(self, medicine: Dict) -> str:
        """生成饮片图"""
        prompt = self._build_herb_prompt(medicine)
        return self._call_api(prompt, f"{medicine['id']}_herb")

    def generate_micro_image(self, medicine: Dict) -> str:
        """生成显微图"""
        prompt = self._build_micro_prompt(medicine)
        return self._call_api(prompt, f"{medicine['id']}_micro")

    def _build_plant_prompt(self, medicine: Dict) -> str:
        """构建原植物Prompt"""
        template = (
            "专业中草药植物摄影，{name} {latin_name}原植物，"
            "{morphology}，{habitat}，{key_features}，"
            "自然光照射，超高清8K分辨率，《中国药典》标准规格，"
            "专业植物志图谱风格，准确专业可用于中药鉴定学习，"
            "科学准确无艺术夸张，新国风水墨渲染，淡雅背景，东方美学"
        )
        # ... 从配置文件读取具体描述
        return template.format(...)

    def _build_herb_prompt(self, medicine: Dict) -> str:
        """构建饮片Prompt"""
        template = (
            "专业中药材饮片摄影，{name}饮片，{specification}，"
            "{appearance}，{cross_section}，专业药材摄影灯箱，"
            "纯白或淡米色背景，超高清8K分辨率，《中国药典》2020版标准规格，"
            "专业中药图谱风格，准确专业可用于药材鉴定，科学准确，"
            "新国风水墨质感，东方美学，药香氛围"
        )
        return template.format(...)

    def _build_micro_prompt(self, medicine: Dict) -> str:
        """构建显微Prompt"""
        template = (
            "中药粉末显微鉴别图，{name}粉末显微特征，{features}，"
            "显微镜专业摄影，400倍放大，专业科学插图风格，"
            "标注关键鉴别特征，高清显微镜成像，专业中药鉴定图谱，"
            "《中国药典》显微鉴别标准，教育用途科学准确，清晰可辨识"
        )
        return template.format(...)

    def _call_api(self, prompt: str, filename: str) -> str:
        """调用Seedream API"""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        data = {
            "prompt": prompt,
            "width": 1024,
            "height": 1024
        }
        response = requests.post(self.endpoint, json=data, headers=headers)
        # 保存图片
        return self._save_image(response, filename)

    def batch_generate(self, batch_name: str, medicines: List[str]):
        """批量生成"""
        print(f"开始生成批次: {batch_name}")
        for med_id in medicines:
            medicine = self._load_medicine(med_id)
            print(f"生成 {medicine['name']}...")

            # 生成三张图
            self.generate_plant_image(medicine)
            self.generate_herb_image(medicine)
            self.generate_micro_image(medicine)

            print(f"  ✓ {medicine['name']} 完成")

        print(f"批次 {batch_name} 生成完成")

# 主程序
if __name__ == "__main__":
    generator = ImageGenerator(api_key=os.getenv("SEEDREAM_API_KEY"))

    # 定义批次
    batches = {
        "batch1": ["mahuang", "guizhi", "zisu", "shengjiang",
                   "shigao", "zhimu", "jinyinhua", "liangqiao"],
        "batch2": ["renshen", "huangqi", "baizhu", "fuling"],
        "batch3": ["danggui", "chuanxiong", "baishao", "shudihuang"],
        "batch4": ["dahuang", "mangxiao"]
    }

    # 执行生成
    for batch_name, medicines in batches.items():
        generator.batch_generate(batch_name, medicines)
```

---

## 质量验证流程

### 1. AI视觉验证 (Qwen-VL)

```python
# quality_check.py

class QualityChecker:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"

    def check_plant_image(self, image_path: str, medicine: Dict) -> Dict:
        """验证原植物图"""
        prompt = f"""
        请分析这张中药图片，判断是否符合以下标准：
        药名: {medicine['name']}
        拉丁学名: {medicine['latin_name']}
        关键特征: {medicine['key_features']}

        请回答：
        1. 图片中的植物是否与描述相符？(是/否/不确定)
        2. 关键识别特征是否清晰可见？(是/否)
        3. 整体质量评分 (1-10)
        4. 是否需要重绘？(是/否)
        5. 具体问题描述
        """

        return self._call_vision_api(image_path, prompt)

    def check_herb_image(self, image_path: str, medicine: Dict) -> Dict:
        """验证饮片图"""
        # 类似逻辑
        pass

    def check_micro_image(self, image_path: str, medicine: Dict) -> Dict:
        """验证显微图"""
        # 类似逻辑
        pass

    def batch_check(self, batch_name: str):
        """批量验证"""
        results = []
        # 遍历批次图片进行验证
        # 生成质量报告
        return results
```

### 2. 质量评分标准

| 维度 | 权重 | 标准 |
|------|------|------|
| 科学准确性 | 40% | 形态特征与药典一致 |
| 艺术风格 | 30% | 新国风水墨美学 |
| 技术质量 | 20% | 清晰度高，无缺陷 |
| 游戏适配 | 10% | 适合水晶球展示 |

### 3. 重绘规则

- **分数 < 6**: 必须重绘
- **6 ≤ 分数 < 8**: 建议重绘
- **分数 ≥ 8**: 通过

---

## 文件命名规范

```
assets/images/
├── medicines/
│   ├── plant/
│   │   ├── mahuang_plant.jpg
│   │   ├── guizhi_plant.jpg
│   │   └── ...
│   ├── herb/
│   │   ├── mahuang_herb.jpg
│   │   ├── guizhi_herb.jpg
│   │   └── ...
│   └── micro/
│       ├── mahuang_micro.jpg
│       ├── guizhi_micro.jpg
│       └── ...
└── scenes/
    ├── qingmulin_bg.jpg
    ├── chiyanfeng_bg.jpg
    ├── huangtuqiu_bg.jpg
    ├── baijinyuan_bg.jpg
    └── heishuitan_bg.jpg
```

---

## 资源索引

### JSON索引文件

```json
{
  "version": "2.0",
  "totalImages": 155,
  "medicines": {
    "mahuang": {
      "plant": "/images/medicines/plant/mahuang_plant.jpg",
      "herb": "/images/medicines/herb/mahuang_herb.jpg",
      "micro": "/images/medicines/micro/mahuang_micro.jpg",
      "qualityScores": {
        "plant": 8.5,
        "herb": 9.0,
        "micro": 8.0
      }
    }
  },
  "scenes": {
    "qingmulin": "/images/scenes/qingmulin_bg.jpg",
    "chiyanfeng": "/images/scenes/chiyanfeng_bg.jpg"
  }
}
```

---

## 执行命令

```bash
# 生成指定批次
python batch_generate.py --batch batch1

# 生成所有批次
python batch_generate.py --all

# 质量验证
python quality_check.py --batch batch1

# 生成质量报告
python quality_check.py --report

# 导出资源索引
python batch_generate.py --export-index
```

---

## 成本预估

### Seedream API 费用

- **单价**: ~¥0.05-0.1/张 (1024×1024)
- **总图片数**: 155张
- **预估成本**: ¥8-15

### Qwen-VL 验证费用

- **单价**: ~¥0.01-0.02/次
- **总验证次数**: 155次
- **预估成本**: ¥2-3

### 总计

- **图片生成**: ¥8-15
- **质量验证**: ¥2-3
- **总计**: ¥10-18

**相比传统美术外包（估计¥5,000-10,000），成本降低99%以上**

---

## 注意事项

1. **API限额**: 注意Seedream API的速率限制
2. **Prompt优化**: 根据生成结果持续优化Prompt
3. **质量抽检**: 人工抽检10%的图片质量
4. **版本管理**: 保存不同版本的生成结果
5. **备份策略**: 定期备份生成的图片资源

---

*版本: v2.0*
*更新: 2026-03-21*
