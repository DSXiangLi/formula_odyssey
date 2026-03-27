import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import type { StageProps } from '../../types/stage';
import BattleScene from '../../components/battle/BattleScene';
import { useChapterStore } from '../../stores/chapterStore';
import { getAllMedicines, getMedicineByName } from '../../data/medicines';
import { getChapterById } from '../../data/chapters';
import { getAllFormulas } from '../../data/formulas';
import { BattleMedicine, BattleFormula } from '../../systems/battle/types';

interface BattleStageProps extends Partial<StageProps> {}

const BattleStage: React.FC<BattleStageProps> = ({ chapterId: propChapterId, onComplete }) => {
  const { chapterId: urlChapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { completeStage, getChapterProgress } = useChapterStore();

  // 优先使用 props 中的 chapterId，否则从 URL 获取
  const chapterId = propChapterId || urlChapterId;

  // 获取章节配置的药材和已收集的药材
  const chapterMedicines = useMemo(() => {
    if (!chapterId) return [];

    const chapter = getChapterById(chapterId);
    const progress = getChapterProgress(chapterId);

    // 优先使用 gathering 阶段收集的药材
    const collectedMedicineIds = progress?.stageProgress?.gathering?.medicinesCollected || [];
    if (collectedMedicineIds.length > 0) {
      // 使用收集的药材
      return collectedMedicineIds.map(id => {
        const med = getMedicineByName(id) || getAllMedicines().find(m => m.id === id);
        if (!med) return null;
        return {
          id: med.id,
          name: med.name,
          pinyin: med.pinyin,
          fourQi: med.fourQi || '平',
          fiveFlavors: med.fiveFlavors?.length > 0 ? med.fiveFlavors : ['甘'],
          functions: med.functions,
        };
      }).filter(Boolean) as BattleMedicine[];
    }

    // 如果没有收集的药材，使用章节配置的药材
    if (chapter?.medicines) {
      return chapter.medicines.map(medName => {
        const med = getMedicineByName(medName);
        if (!med) return null;
        return {
          id: med.id,
          name: med.name,
          pinyin: med.pinyin,
          fourQi: med.fourQi || '平',
          fiveFlavors: med.fiveFlavors?.length > 0 ? med.fiveFlavors : ['甘'],
          functions: med.functions,
        };
      }).filter(Boolean) as BattleMedicine[];
    }

    return [];
  }, [chapterId, getChapterProgress]);

  const handleBattleComplete = (result: import('../../systems/battle/types').BattleResult) => {
    // Update chapter progress
    if (chapterId && result.victory) {
      completeStage(chapterId, 'battle');
    }

    // 如果有 onComplete 回调（通过 StageManager 使用），则调用它
    if (onComplete) {
      onComplete({
        score: result.score,
        maxCombo: result.maxCombo,
      });
    } else {
      // 否则直接导航（通过路由直接使用）
      navigate(`/chapter/${chapterId}/stage`);
    }
  };

  // Transform MedicineData to BattleMedicine
  const medicines: BattleMedicine[] = chapterMedicines.length > 0
    ? chapterMedicines
    : getAllMedicines().slice(0, 4).map(m => ({  // 降级：只取4个默认药材
        id: m.id,
        name: m.name,
        pinyin: m.pinyin,
        fourQi: m.fourQi || '平',
        fiveFlavors: m.fiveFlavors?.length > 0 ? m.fiveFlavors : ['甘'],
        functions: m.functions,
      }));

  const formulas: BattleFormula[] = getAllFormulas().slice(0, 5).map(f => ({
    id: f.id,
    name: f.name,
    pinyin: f.pinyin || f.name,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <BattleScene
        chapterId={chapterId || 'default'}
        medicines={medicines}
        formulas={formulas}
        onComplete={handleBattleComplete}
      />
    </motion.div>
  );
};

export default BattleStage;
