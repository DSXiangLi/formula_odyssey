#!/usr/bin/env python3
"""
AI生图自动化脚本 - 批量生成中药图片
使用Seedream/豆包API生成三层图片系统

作者: fullstack-dev
版本: 2.0
"""

import json
import os
import sys
import time
import base64
import requests
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed

# 配置
CONFIG_FILE = "../design-output/生图Prompt配置v2.0.json"
OUTPUT_BASE_DIR = "../src/public/images"
API_ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations"


@dataclass
class GenerationResult:
    """生图结果"""
    success: bool
    file_path: str
    medicine_id: str
    image_type: str
    error_message: Optional[str] = None
    generation_time: float = 0.0


class ImageGenerator:
    """图片生成器"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.config = self._load_config()
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })
        self._create_directories()

    def _load_config(self) -> Dict:
        """加载配置文件"""
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件未找到: {CONFIG_FILE}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ 配置文件解析错误: {e}")
            sys.exit(1)

    def _create_directories(self):
        """创建输出目录（两层图片）"""
        dirs = [
            f"{OUTPUT_BASE_DIR}/medicines/plant",
            f"{OUTPUT_BASE_DIR}/medicines/herb",
            f"{OUTPUT_BASE_DIR}/scenes"
        ]
        for dir_path in dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
            print(f"✓ 目录已创建: {dir_path}")

    def _build_plant_prompt(self, medicine_id: str) -> str:
        """构建原植物Prompt"""
        medicine = self.config["medicinePrompts"][medicine_id]
        template = self.config["promptTemplates"]["plantBase"]["template"]
        plant_data = medicine["images"]["plant"]

        return template.format(
            name=medicine["name"],
            latinName=medicine["latinName"],
            morphology=plant_data["morphology"],
            habitat=plant_data["habitat"],
            keyFeatures=plant_data["keyFeatures"]
        )

    def _build_herb_prompt(self, medicine_id: str) -> str:
        """构建饮片Prompt"""
        medicine = self.config["medicinePrompts"][medicine_id]
        template = self.config["promptTemplates"]["herbBase"]["template"]
        herb_data = medicine["images"]["herb"]

        return template.format(
            latinName=medicine["latinName"],
            specification=herb_data["specification"],
            appearance=herb_data["appearance"],
            crossSection=herb_data["crossSection"]
        )

    def _build_micro_prompt(self, medicine_id: str) -> str:
        """构建显微Prompt"""
        medicine = self.config["medicinePrompts"][medicine_id]
        template = self.config["promptTemplates"]["microscopeBase"]["template"]
        micro_data = medicine["images"]["microscope"]

        return template.format(
            name=medicine["name"],
            powderFeatures=micro_data["powderFeatures"]
        )

    def _build_scene_prompt(self, scene_id: str) -> str:
        """构建场景Prompt"""
        scene = self.config["scenePrompts"][scene_id]
        template = self.config["promptTemplates"]["sceneBase"]["template"]
        prompt_data = scene["prompt"]

        return template.format(
            regionName=prompt_data["regionName"],
            seasonFeatures=prompt_data["seasonFeatures"],
            wuxingColors=prompt_data["wuxingColors"],
            environmentElements=prompt_data["environmentElements"],
            atmosphere=prompt_data["atmosphere"]
        )

    def _call_seedream_api(self, prompt: str, output_path: str) -> bool:
        """调用Seedream API生成图片"""
        api_config = self.config["apiConfig"]["seedream"]

        payload = {
            "model": api_config["model"],
            "prompt": prompt,
            "width": api_config["parameters"]["width"],
            "height": api_config["parameters"]["height"],
            "response_format": "b64_json"
        }

        try:
            response = self.session.post(API_ENDPOINT, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()

            if "data" in data and len(data["data"]) > 0:
                # 保存图片
                image_data = base64.b64decode(data["data"][0]["b64_json"])
                with open(output_path, "wb") as f:
                    f.write(image_data)
                return True
            else:
                print(f"  ⚠️ API返回无图片数据: {data}")
                return False

        except requests.exceptions.RequestException as e:
            print(f"  ❌ API请求失败: {e}")
            return False
        except Exception as e:
            print(f"  ❌ 保存图片失败: {e}")
            return False

    def generate_medicine_image(self, medicine_id: str, image_type: str) -> GenerationResult:
        """生成单个药物图片（两层）"""
        start_time = time.time()

        # 构建Prompt（只支持plant和herb）
        if image_type == "plant":
            prompt = self._build_plant_prompt(medicine_id)
            output_path = f"{OUTPUT_BASE_DIR}/medicines/plant/{medicine_id}_plant.jpg"
        elif image_type == "herb":
            prompt = self._build_herb_prompt(medicine_id)
            output_path = f"{OUTPUT_BASE_DIR}/medicines/herb/{medicine_id}_herb.jpg"
        else:
            return GenerationResult(
                success=False,
                file_path="",
                medicine_id=medicine_id,
                image_type=image_type,
                error_message=f"不支持的图片类型: {image_type}（仅支持plant/herb）"
            )

        # 检查是否已存在（跳过）
        if os.path.exists(output_path):
            print(f"  ⏭️ 已存在，跳过: {output_path}")
            return GenerationResult(
                success=True,
                file_path=output_path,
                medicine_id=medicine_id,
                image_type=image_type,
                generation_time=0
            )

        # 调用API生成
        success = self._call_seedream_api(prompt, output_path)
        generation_time = time.time() - start_time

        if success:
            print(f"  ✓ 生成成功: {output_path} ({generation_time:.1f}s)")
            return GenerationResult(
                success=True,
                file_path=output_path,
                medicine_id=medicine_id,
                image_type=image_type,
                generation_time=generation_time
            )
        else:
            return GenerationResult(
                success=False,
                file_path="",
                medicine_id=medicine_id,
                image_type=image_type,
                error_message="API调用失败",
                generation_time=generation_time
            )

    def generate_scene_image(self, scene_id: str) -> GenerationResult:
        """生成场景图片"""
        start_time = time.time()

        prompt = self._build_scene_prompt(scene_id)
        output_path = f"{OUTPUT_BASE_DIR}/scenes/{scene_id}_bg.jpg"

        # 检查是否已存在
        if os.path.exists(output_path):
            print(f"  ⏭️ 已存在，跳过: {output_path}")
            return GenerationResult(
                success=True,
                file_path=output_path,
                medicine_id=scene_id,
                image_type="scene",
                generation_time=0
            )

        # 调用API生成
        success = self._call_seedream_api(prompt, output_path)
        generation_time = time.time() - start_time

        if success:
            print(f"  ✓ 生成成功: {output_path} ({generation_time:.1f}s)")
            return GenerationResult(
                success=True,
                file_path=output_path,
                medicine_id=scene_id,
                image_type="scene",
                generation_time=generation_time
            )
        else:
            return GenerationResult(
                success=False,
                file_path="",
                medicine_id=scene_id,
                image_type="scene",
                error_message="API调用失败",
                generation_time=generation_time
            )

    def generate_batch(self, batch_name: str, medicines: List[str], max_workers: int = 3) -> List[GenerationResult]:
        """批量生成一个批次的药物图片"""
        print(f"\n🚀 开始生成批次: {batch_name}")
        print(f"   包含 {len(medicines)} 味药物，每味2张图")
        print(f"   并行度: {max_workers}\n")

        results = []
        image_types = ["plant", "herb"]

        # 为每个药物生成3张图
        tasks = []
        for med_id in medicines:
            for img_type in image_types:
                tasks.append((med_id, img_type))

        # 使用线程池并行生成
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_task = {
                executor.submit(self.generate_medicine_image, med_id, img_type): (med_id, img_type)
                for med_id, img_type in tasks
            }

            for future in as_completed(future_to_task):
                med_id, img_type = future_to_task[future]
                try:
                    result = future.result()
                    results.append(result)

                    if not result.success:
                        print(f"  ❌ {med_id}/{img_type} 生成失败: {result.error_message}")

                except Exception as e:
                    print(f"  ❌ {med_id}/{img_type} 异常: {e}")
                    results.append(GenerationResult(
                        success=False,
                        file_path="",
                        medicine_id=med_id,
                        image_type=img_type,
                        error_message=str(e)
                    ))

        return results

    def generate_scenes(self, scene_ids: List[str], max_workers: int = 2) -> List[GenerationResult]:
        """批量生成场景图片"""
        print(f"\n🎨 开始生成场景背景")
        print(f"   包含 {len(scene_ids)} 个场景")
        print(f"   并行度: {max_workers}\n")

        results = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_scene = {
                executor.submit(self.generate_scene_image, scene_id): scene_id
                for scene_id in scene_ids
            }

            for future in as_completed(future_to_scene):
                scene_id = future_to_scene[future]
                try:
                    result = future.result()
                    results.append(result)

                    if not result.success:
                        print(f"  ❌ {scene_id} 生成失败: {result.error_message}")

                except Exception as e:
                    print(f"  ❌ {scene_id} 异常: {e}")

        return results

    def generate_all(self):
        """生成所有批次"""
        print("=" * 60)
        print("🎨 药灵山谷 v2.0 - AI生图自动化")
        print("=" * 60)
        print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        all_results = []
        batch_config = self.config["generationBatch"]

        # 生成药物图片批次
        for batch_key in ["batch1", "batch2", "batch3", "batch4"]:
            batch = batch_config[batch_key]
            medicines = batch["medicines"]
            results = self.generate_batch(batch["name"], medicines)
            all_results.extend(results)
            time.sleep(2)  # 批次间休息

        # 生成场景图片
        scene_batch = batch_config["batch5"]
        scene_results = self.generate_scenes(scene_batch["scenes"])
        all_results.extend(scene_results)

        # 生成报告
        self._generate_report(all_results)

    def _generate_report(self, results: List[GenerationResult]):
        """生成生成报告"""
        total = len(results)
        success = sum(1 for r in results if r.success)
        failed = total - success

        total_time = sum(r.generation_time for r in results)
        avg_time = total_time / success if success > 0 else 0

        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": total,
                "success": success,
                "failed": failed,
                "success_rate": f"{(success/total*100):.1f}%",
                "total_time": f"{total_time:.1f}s",
                "avg_time": f"{avg_time:.1f}s"
            },
            "details": [
                {
                    "medicine_id": r.medicine_id,
                    "image_type": r.image_type,
                    "success": r.success,
                    "file_path": r.file_path,
                    "error": r.error_message,
                    "time": r.generation_time
                }
                for r in results
            ]
        }

        # 保存报告
        report_path = f"{OUTPUT_BASE_DIR}/generation_report.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print("\n" + "=" * 60)
        print("📊 生成报告")
        print("=" * 60)
        print(f"总图片数: {total}")
        print(f"成功: {success} ({report['summary']['success_rate']})")
        print(f"失败: {failed}")
        print(f"总耗时: {report['summary']['total_time']}")
        print(f"平均每张: {report['summary']['avg_time']}")
        print(f"\n报告已保存: {report_path}")

        if failed > 0:
            print("\n⚠️ 失败的图片:")
            for r in results:
                if not r.success:
                    print(f"  - {r.medicine_id}/{r.image_type}: {r.error_message}")


def main():
    """主程序"""
    # 获取API密钥
    api_key = os.getenv("SEED_IMAGER_KEY")
    if not api_key:
        print("❌ 请设置环境变量 SEED_IMAGER_KEY")
        print("   export SEED_IMAGER_KEY=your_api_key")
        sys.exit(1)

    # 创建生成器
    generator = ImageGenerator(api_key)

    # 解析命令行参数
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "--batch" and len(sys.argv) > 2:
            # 生成指定批次
            batch_name = sys.argv[2]
            batch_config = generator.config["generationBatch"]
            if batch_name in batch_config:
                batch = batch_config[batch_name]
                if "medicines" in batch:
                    generator.generate_batch(batch["name"], batch["medicines"])
                elif "scenes" in batch:
                    generator.generate_scenes(batch["scenes"])
            else:
                print(f"❌ 未知批次: {batch_name}")
                print(f"可用批次: {', '.join(batch_config.keys())}")

        elif command == "--medicine" and len(sys.argv) > 2:
            # 生成指定药物
            medicine_id = sys.argv[2]
            for img_type in ["plant", "herb"]:
                result = generator.generate_medicine_image(medicine_id, img_type)
                if not result.success:
                    print(f"❌ {medicine_id}/{img_type} 失败")

        elif command == "--scene" and len(sys.argv) > 2:
            # 生成指定场景
            scene_id = sys.argv[2]
            result = generator.generate_scene_image(scene_id)
            if not result.success:
                print(f"❌ {scene_id} 失败")

        elif command == "--all":
            # 生成所有
            generator.generate_all()

        else:
            print("用法:")
            print("  python generate_images.py --all                    # 生成所有")
            print("  python generate_images.py --batch batch1          # 生成指定批次")
            print("  python generate_images.py --medicine mahuang      # 生成指定药物")
            print("  python generate_images.py --scene qingmulin       # 生成指定场景")
    else:
        # 默认生成所有
        generator.generate_all()


if __name__ == "__main__":
    main()
