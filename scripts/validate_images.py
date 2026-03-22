#!/usr/bin/env python3
"""
图片质量验证脚本 - 使用Qwen-VL验证图片质量

作者: fullstack-dev
版本: 2.0
"""

import json
import os
import sys
import base64
import requests
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed

# 配置
CONFIG_FILE = "../design-output/生图Prompt配置v2.0.json"
IMAGES_BASE_DIR = "../src/public/images"
QWEN_VL_ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"


@dataclass
class ValidationResult:
    """验证结果"""
    medicine_id: str
    image_type: str
    file_path: str
    score: float
    passed: bool
    analysis: str
    issues: List[str]
    suggestions: List[str]


class ImageValidator:
    """图片验证器"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.config = self._load_config()
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })

    def _load_config(self) -> Dict:
        """加载配置文件"""
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ 配置文件加载失败: {e}")
            sys.exit(1)

    def _encode_image(self, image_path: str) -> str:
        """将图片编码为base64"""
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _call_qwen_vl(self, image_base64: str, prompt: str) -> Dict:
        """调用Qwen-VL API"""
        payload = {
            "model": "qwen-vl-max",
            "input": {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image", "image": image_base64}
                        ]
                    }
                ]
            }
        }

        try:
            response = self.session.post(QWEN_VL_ENDPOINT, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()

            if "output" in data and "choices" in data["output"]:
                content = data["output"]["choices"][0]["message"]["content"]
                return self._parse_response(content)
            else:
                return {"error": "API返回格式异常", "raw": data}

        except Exception as e:
            return {"error": str(e)}

    def _parse_response(self, content: str) -> Dict:
        """解析AI响应"""
        # 尝试提取JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass

        # 回退到简单解析
        score = 5.0
        if "10" in content or "优秀" in content:
            score = 10.0
        elif "9" in content or "很好" in content:
            score = 9.0
        elif "8" in content or "良好" in content:
            score = 8.0
        elif "7" in content or "一般" in content:
            score = 7.0
        elif "6" in content or "及格" in content:
            score = 6.0
        else:
            score = 5.0

        passed = score >= 6.0

        return {
            "score": score,
            "passed": passed,
            "analysis": content,
            "issues": [],
            "suggestions": []
        }

    def _build_plant_validation_prompt(self, medicine_id: str) -> str:
        """构建原植物验证Prompt"""
        medicine = self.config["medicinePrompts"][medicine_id]
        plant_data = medicine["images"]["plant"]

        return f"""作为中药鉴定专家，请评估这张{medicine['name']}原植物图片的质量。

药典标准描述:
- 药名: {medicine['name']}
- 拉丁学名: {medicine['latinName']}
- 形态: {plant_data['morphology']}
- 关键特征: {plant_data['keyFeatures']}

请评估并回答:
1. 形态特征是否符合药典描述？(是/否/部分)
2. 关键识别特征是否清晰可见？(是/否)
3. 整体质量评分 (1-10)
4. 艺术风格是否符合新国风水墨？(是/否)
5. 图片清晰度如何？(高/中/低)

请以JSON格式返回:
{{
  "score": 8.5,
  "passed": true,
  "analysis": "简要分析",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1"]
}}"""

    def _build_herb_validation_prompt(self, medicine_id: str) -> str:
        """构建饮片验证Prompt"""
        medicine = self.config["medicinePrompts"][medicine_id]
        herb_data = medicine["images"]["herb"]

        return f"""作为中药鉴定专家，请评估这张{medicine['name']}饮片图片的质量。

药典标准描述:
- 药名: {medicine['name']}
- 规格: {herb_data['specification']}
- 性状: {herb_data['appearance']}
- 断面: {herb_data['crossSection']}

请评估并回答:
1. 药材规格是否符合标准？(是/否/部分)
2. 性状特征是否清晰可见？(是/否)
3. 断面特征是否准确呈现？(是/否)
4. 整体质量评分 (1-10)
5. 专业度和美观度如何？(高/中/低)

请以JSON格式返回:
{{
  "score": 8.5,
  "passed": true,
  "analysis": "简要分析",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1"]
}}"""

    def _build_micro_validation_prompt(self, medicine_id: str) -> str:
        """构建显微验证Prompt"""
        medicine = self.config["medicinePrompts"][medicine_id]
        micro_data = medicine["images"]["microscope"]

        return f"""作为中药显微鉴定专家，请评估这张{medicine['name']}显微图片的质量。

药典标准描述:
- 药名: {medicine['name']}
- 粉末特征: {micro_data['powderFeatures']}

请评估并回答:
1. 显微特征是否符合药典描述？(是/否/部分)
2. 关键鉴别特征是否清晰可见？(是/否)
3. 图像清晰度和对比度如何？(高/中/低)
4. 整体质量评分 (1-10)
5. 是否适合教学使用？(是/否)

请以JSON格式返回:
{{
  "score": 8.5,
  "passed": true,
  "analysis": "简要分析",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1"]
}}"""

    def _build_scene_validation_prompt(self, scene_id: str) -> str:
        """构建场景验证Prompt"""
        scene = self.config["scenePrompts"][scene_id]
        prompt_data = scene["prompt"]

        return f"""作为游戏美术专家，请评估这张游戏场景背景图片的质量。

场景信息:
- 名称: {scene['name']}
- 五行: {scene['wuxing']}
- 季节: {scene['season']}
- 要求: {prompt_data['environmentElements']}

请评估并回答:
1. 是否符合五行{scene['wuxing']}主题？(是/否)
2. 季节特征是否明显？(是/否)
3. 层次感和景深效果如何？(好/一般/差)
4. 是否适合作为游戏UI背景？(是/否)
5. 整体质量评分 (1-10)

请以JSON格式返回:
{{
  "score": 8.5,
  "passed": true,
  "analysis": "简要分析",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1"]
}}"""

    def validate_image(self, file_path: str, image_type: str, medicine_id: str) -> ValidationResult:
        """验证单张图片"""
        if not os.path.exists(file_path):
            return ValidationResult(
                medicine_id=medicine_id,
                image_type=image_type,
                file_path=file_path,
                score=0,
                passed=False,
                analysis="文件不存在",
                issues=["图片文件未找到"],
                suggestions=["请先执行生成脚本"]
            )

        # 编码图片
        try:
            image_base64 = self._encode_image(file_path)
        except Exception as e:
            return ValidationResult(
                medicine_id=medicine_id,
                image_type=image_type,
                file_path=file_path,
                score=0,
                passed=False,
                analysis=f"图片编码失败: {e}",
                issues=["无法读取图片"],
                suggestions=[]
            )

        # 构建验证Prompt
        if image_type == "plant":
            prompt = self._build_plant_validation_prompt(medicine_id)
        elif image_type == "herb":
            prompt = self._build_herb_validation_prompt(medicine_id)
        elif image_type == "microscope":
            prompt = self._build_micro_validation_prompt(medicine_id)
        elif image_type == "scene":
            prompt = self._build_scene_validation_prompt(medicine_id)
        else:
            return ValidationResult(
                medicine_id=medicine_id,
                image_type=image_type,
                file_path=file_path,
                score=0,
                passed=False,
                analysis=f"未知图片类型: {image_type}",
                issues=["类型错误"],
                suggestions=[]
            )

        # 调用API
        result = self._call_qwen_vl(image_base64, prompt)

        if "error" in result:
            return ValidationResult(
                medicine_id=medicine_id,
                image_type=image_type,
                file_path=file_path,
                score=0,
                passed=False,
                analysis=f"API调用失败: {result['error']}",
                issues=["AI验证失败"],
                suggestions=["请检查API配置"]
            )

        return ValidationResult(
            medicine_id=medicine_id,
            image_type=image_type,
            file_path=file_path,
            score=result.get("score", 0),
            passed=result.get("passed", False),
            analysis=result.get("analysis", ""),
            issues=result.get("issues", []),
            suggestions=result.get("suggestions", [])
        )

    def validate_batch(self, batch_name: str, max_workers: int = 3) -> List[ValidationResult]:
        """批量验证一个批次"""
        print(f"\n🔍 开始验证批次: {batch_name}")

        batch_config = self.config["generationBatch"].get(batch_name)
        if not batch_config:
            print(f"❌ 未知批次: {batch_name}")
            return []

        results = []
        tasks = []

        # 收集验证任务
        if "medicines" in batch_config:
            for med_id in batch_config["medicines"]:
                for img_type in ["plant", "herb", "microscope"]:
                    file_path = f"{IMAGES_BASE_DIR}/medicines/{img_type}/{med_id}_{img_type}.jpg"
                    tasks.append((file_path, img_type, med_id))
        elif "scenes" in batch_config:
            for scene_id in batch_config["scenes"]:
                file_path = f"{IMAGES_BASE_DIR}/scenes/{scene_id}_bg.jpg"
                tasks.append((file_path, "scene", scene_id))

        print(f"   共 {len(tasks)} 张图片待验证\n")

        # 并行验证
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_task = {
                executor.submit(self.validate_image, fp, it, mid): (fp, it, mid)
                for fp, it, mid in tasks
            }

            for future in as_completed(future_to_task):
                file_path, img_type, med_id = future_to_task[future]
                try:
                    result = future.result()
                    results.append(result)

                    status = "✓" if result.passed else "✗"
                    print(f"  {status} {med_id}/{img_type}: 评分 {result.score:.1f}")

                except Exception as e:
                    print(f"  ✗ {med_id}/{img_type}: 验证异常 - {e}")

        return results

    def validate_all(self) -> List[ValidationResult]:
        """验证所有图片"""
        print("=" * 60)
        print("🔍 药灵山谷 v2.0 - AI图片质量验证")
        print("=" * 60)
        print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        all_results = []

        # 验证药物批次
        for batch in ["batch1", "batch2", "batch3", "batch4"]:
            results = self.validate_batch(batch)
            all_results.extend(results)

        # 验证场景
        scene_results = self.validate_batch("batch5")
        all_results.extend(scene_results)

        # 生成报告
        self._generate_report(all_results)

        return all_results

    def _generate_report(self, results: List[ValidationResult]):
        """生成验证报告"""
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        failed = total - passed

        avg_score = sum(r.score for r in results) / total if total > 0 else 0

        # 按分数分组
        excellent = [r for r in results if r.score >= 8]  # 8-10
        good = [r for r in results if 6 <= r.score < 8]    # 6-8
        poor = [r for r in results if r.score < 6]         # <6

        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "pass_rate": f"{(passed/total*100):.1f}%",
                "avg_score": f"{avg_score:.2f}",
                "excellent": len(excellent),
                "good": len(good),
                "poor": len(poor)
            },
            "excellent": [asdict(r) for r in excellent],
            "good": [asdict(r) for r in good],
            "poor": [asdict(r) for r in poor],
            "all_results": [asdict(r) for r in results]
        }

        # 保存报告
        report_path = f"{IMAGES_BASE_DIR}/validation_report.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        # 打印摘要
        print("\n" + "=" * 60)
        print("📊 验证报告")
        print("=" * 60)
        print(f"总图片数: {total}")
        print(f"通过: {passed} ({report['summary']['pass_rate']})")
        print(f"失败: {failed}")
        print(f"平均分: {report['summary']['avg_score']}")
        print(f"\n分布:")
        print(f"  🌟 优秀(8-10分): {len(excellent)} 张")
        print(f"  ✓ 良好(6-8分): {len(good)} 张")
        print(f"  ⚠️ 需改进(<6分): {len(poor)} 张")

        if poor:
            print("\n⚠️ 需要重绘的图片:")
            for r in poor:
                print(f"  - {r.medicine_id}/{r.image_type}: {r.score:.1f}分")
                for issue in r.issues[:2]:
                    print(f"    * {issue}")

        print(f"\n报告已保存: {report_path}")

        # 生成重绘列表
        if poor:
            retry_list = [f"{r.medicine_id}/{r.image_type}" for r in poor]
            retry_path = f"{IMAGES_BASE_DIR}/retry_list.txt"
            with open(retry_path, "w", encoding="utf-8") as f:
                f.write("\n".join(retry_list))
            print(f"重绘列表: {retry_path}")


def main():
    """主程序"""
    # 获取API密钥
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        print("❌ 请设置环境变量 DASHSCOPE_API_KEY")
        print("   export DASHSCOPE_API_KEY=your_api_key")
        sys.exit(1)

    # 创建验证器
    validator = ImageValidator(api_key)

    # 解析命令行参数
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "--batch" and len(sys.argv) > 2:
            batch_name = sys.argv[2]
            results = validator.validate_batch(batch_name)
            validator._generate_report(results)

        elif command == "--image" and len(sys.argv) > 4:
            file_path = sys.argv[2]
            img_type = sys.argv[3]
            med_id = sys.argv[4]
            result = validator.validate_image(file_path, img_type, med_id)
            print(json.dumps(asdict(result), ensure_ascii=False, indent=2))

        elif command == "--all":
            validator.validate_all()

        else:
            print("用法:")
            print("  python validate_images.py --all                    # 验证所有")
            print("  python validate_images.py --batch batch1          # 验证指定批次")
            print("  python validate_images.py --image path type id    # 验证单张图片")
    else:
        # 默认验证所有
        validator.validate_all()


if __name__ == "__main__":
    main()
