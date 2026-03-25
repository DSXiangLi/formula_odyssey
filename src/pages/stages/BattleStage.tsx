import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';
import BattleScene from '../../components/battle/BattleScene';
import { useChapterStore } from '../../stores/chapterStore';
import { getAllMedicines } from '../../data/medicines';
import { getAllFormulas } from '../../data/formulas';
import { BattleMedicine, BattleFormula } from '../../systems/battle/types';

const BattleStage: React.FC<StageProps> = ({ chapterId, onComplete }) => {
  const { completeStage } = useChapterStore();

  const handleBattleComplete = (result: import('../../systems/battle/types').BattleResult) => {
    // Update chapter progress
    if (chapterId && result.victory) {
      completeStage(chapterId, 'battle');
    }

    // Call stage complete callback
    onComplete({
      score: result.score,
      maxCombo: result.maxCombo,
    });
  };

  // Transform MedicineData to BattleMedicine
  const medicines: BattleMedicine[] = getAllMedicines().slice(0, 10).map(m => {
    const natureParts = m.nature.split('、');
    const fiveFlavors = natureParts.filter(p => ['辛', '甘', '酸', '苦', '咸'].some(f => p.includes(f)));
    const fourQi = natureParts.find(p => ['寒', '热', '温', '凉', '平'].some(q => p.includes(q))) || '平';
    return {
      id: m.id,
      name: m.name,
      pinyin: m.pinyin,
      fourQi,
      fiveFlavors: fiveFlavors.length > 0 ? fiveFlavors : ['甘'],
      functions: m.functions,
    };
  });

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
