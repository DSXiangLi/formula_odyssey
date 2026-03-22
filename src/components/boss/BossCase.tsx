import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosisStep } from './DiagnosisStep';
import { BossResult } from './BossResult';
import { BossIntro } from './BossIntro';
import type { ClinicalCase, Formula, Medicine, WuxingType } from '../../types';
import {
  Crown,
  Scroll,
  Sword,
  Shield,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

// 奖励类型
export interface Reward {
  diamonds: number;
  skillId?: string;
  skillName?: string;
  chapterUnlock?: string;
}

interface BossCaseProps {
  chapterId: string;
  chapterName: string;
  chapterWuxing: WuxingType;
  caseData: ClinicalCase;
  chapterFormulas: Formula[];
  onComplete: (success: boolean, rewards: Reward) => void;
  onExit: () => void;
}

// 治法选项（8种常用治法）
const TREATMENT_OPTIONS = [
  { id: 'pungent_warm', name: '辛温解表', description: '用于风寒表证' },
  { id: 'pungent_cool', name: '辛凉解表', description: '用于风热表证' },
  { id: 'release_muscle', name: '解肌发表', description: '调和营卫' },
  { id: 'clear_heat', name: '清热泻火', description: '用于实热证' },
  { id: 'tonify_qi', name: '益气健脾', description: '用于脾胃气虚' },
  { id: 'nourish_blood', name: '补血和血', description: '用于血虚证' },
  { id: 'drastic_purge', name: '峻下热结', description: '用于阳明腑实' },
  { id: 'warm_lung', name: '温肺化饮', description: '解表散寒，温肺化饮' },
];

// 五行色彩配置
const WUXING_COLORS: Record<WuxingType, { primary: string; light: string; gradient: string }> = {
  wood: {
    primary: '#2E7D32',
    light: '#81C784',
    gradient: 'from-green-600 to-green-400',
  },
  fire: {
    primary: '#C62828',
    light: '#EF5350',
    gradient: 'from-red-600 to-orange-400',
  },
  earth: {
    primary: '#F9A825',
    light: '#FFD54F',
    gradient: 'from-yellow-600 to-yellow-400',
  },
  metal: {
    primary: '#78909C',
    light: '#B0BEC5',
    gradient: 'from-slate-500 to-slate-300',
  },
  water: {
    primary: '#1565C0',
    light: '#42A5F5',
    gradient: 'from-blue-700 to-blue-400',
  },
};

export const BossCase: React.FC<BossCaseProps> = ({
  chapterId,
  chapterName,
  chapterWuxing,
  caseData,
  chapterFormulas,
  onComplete,
  onExit,
}) => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [selectedFormula, setSelectedFormula] = useState<string>('');
  const [selectedJun, setSelectedJun] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rewards, setRewards] = useState<Reward>({ diamonds: 0 });

  const colors = WUXING_COLORS[chapterWuxing];

  // 获取当前选中方剂的所有君药选项
  const getJunOptions = (): { id: string; name: string; description: string }[] => {
    const formula = chapterFormulas.find(f => f.name === selectedFormula);
    if (!formula) return [];

    return formula.composition
      .filter(c => c.role === 'jun')
      .map(c => ({
        id: c.medicineId,
        name: c.medicineId, // 这里简化处理，实际应该通过medicineId查药名
        description: `${c.amount} - 君药`,
      }));
  };

  // 构建方剂选项
  const formulaOptions = chapterFormulas.map(f => ({
    id: f.id,
    name: f.name,
    description: f.functions[0] || '经典方剂',
  }));

  // 验证答案
  const validateAnswers = () => {
    const treatmentCorrect = selectedTreatment === caseData.correctTreatment;
    const formulaCorrect = selectedFormula === caseData.correctFormula;
    const junCorrect = selectedJun === caseData.correctJun ||
      caseData.correctJun.includes(selectedJun) ||
      selectedJun.includes(caseData.correctJun);

    const allCorrect = treatmentCorrect && formulaCorrect && junCorrect;
    setIsSuccess(allCorrect);

    if (allCorrect) {
      setRewards({
        diamonds: 500,
        skillId: `skill_${chapterId}`,
        skillName: getChapterSkillName(chapterName),
        chapterUnlock: getNextChapterId(chapterId),
      });
    }

    setShowResult(true);
    onComplete(allCorrect, rewards);
  };

  // 获取章节技能名称
  const getChapterSkillName = (name: string): string => {
    const skillMap: Record<string, string> = {
      '解表剂山谷': '望气之眼',
      '清热剂山谷': '清热精通',
      '泻下剂山谷': '泻下明辨',
      '祛风湿剂山谷': '风湿专精',
      '化湿剂山谷': '化湿妙手',
      '利水渗湿剂山谷': '利水通淋',
      '温里剂山谷': '温阳散寒',
      '理气剂山谷': '理气解郁',
      '消食剂山谷': '消食导滞',
      '驱虫剂山谷': '驱虫安蛔',
      '止血剂山谷': '止血圣手',
      '活血化瘀剂山谷': '活血通络',
      '化痰止咳平喘剂山谷': '化痰止咳',
      '安神剂山谷': '安神定志',
      '平肝息风剂山谷': '平肝息风',
      '开窍剂山谷': '开窍醒神',
      '补气剂山谷': '补气益脾',
      '补血剂山谷': '补血养血',
      '补阳剂山谷': '补肾壮阳',
      '补阴剂山谷': '滋阴润燥',
    };
    return skillMap[name] || '神秘技能';
  };

  // 获取下一章ID
  const getNextChapterId = (currentId: string): string | undefined => {
    const match = currentId.match(/chapter_(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return nextNum <= 20 ? `chapter_${nextNum}` : undefined;
    }
    return undefined;
  };

  // 处理步骤完成
  const handleStepComplete = () => {
    if (currentStep === 1 && selectedTreatment) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedFormula) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedJun) {
      validateAnswers();
    }
  };

  // 处理重新开始
  const handleRetry = () => {
    setCurrentStep(1);
    setSelectedTreatment('');
    setSelectedFormula('');
    setSelectedJun('');
    setShowResult(false);
    setIsSuccess(false);
  };

  if (showIntro) {
    return (
      <BossIntro
        chapterName={chapterName}
        chapterWuxing={chapterWuxing}
        caseInfo={caseData.patientInfo}
        onStart={() => setShowIntro(false)}
        onExit={onExit}
      />
    );
  }

  if (showResult) {
    return (
      <BossResult
        success={isSuccess}
        correctAnswers={{
          treatment: caseData.correctTreatment,
          formula: caseData.correctFormula,
          junMedicine: caseData.correctJun,
        }}
        playerAnswers={{
          treatment: selectedTreatment,
          formula: selectedFormula,
          junMedicine: selectedJun,
        }}
        rewards={rewards}
        explanation={caseData.explanation}
        chapterWuxing={chapterWuxing}
        onNextChapter={() => onComplete(isSuccess, rewards)}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border-2 shadow-2xl"
        style={{ borderColor: colors.primary }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Boss战标题栏 */}
        <div
          className={`relative p-6 bg-gradient-to-r ${colors.gradient} rounded-t-2xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sword className="w-6 h-6" />
                  Boss挑战
                </h1>
                <p className="text-white/80">{chapterName} · 终极考验</p>
              </div>
            </div>
            <button
              onClick={onExit}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                    currentStep === step
                      ? 'bg-white text-slate-900 scale-110'
                      : currentStep > step
                      ? 'bg-green-400 text-slate-900'
                      : 'bg-white/30 text-white'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {step === 1 ? '治法' : step === 2 ? '方剂' : '君药'}
                </span>
                {step < 3 && (
                  <div
                    className={`w-16 h-0.5 ${
                      currentStep > step ? 'bg-green-400' : 'bg-white/30'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 病案详情 */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="w-5 h-5" style={{ color: colors.light }} />
              <h3 className="text-lg font-bold text-white">病案详情</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">患者</p>
                <p className="text-white font-medium">{caseData.patientInfo}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">脉象</p>
                <p className="text-white font-medium">{caseData.pulse}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">舌象</p>
                <p className="text-white font-medium">{caseData.tongue}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">症状</p>
                <div className="flex flex-wrap gap-1">
                  {caseData.symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-700 text-slate-200 text-xs rounded-full"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 当前步骤 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {currentStep === 1 && (
                <DiagnosisStep
                  step={1}
                  title="第一步：辨证论治"
                  description="根据病案信息，选择正确的治法"
                  options={TREATMENT_OPTIONS}
                  selected={selectedTreatment}
                  onSelect={setSelectedTreatment}
                  wuxingColor={colors.primary}
                />
              )}

              {currentStep === 2 && (
                <DiagnosisStep
                  step={2}
                  title="第二步：选方用药"
                  description="选择最适合的方剂"
                  options={formulaOptions}
                  selected={selectedFormula}
                  onSelect={setSelectedFormula}
                  wuxingColor={colors.primary}
                />
              )}

              {currentStep === 3 && (
                <DiagnosisStep
                  step={3}
                  title="第三步：确定君药"
                  description="该方剂的君药是什么？"
                  options={getJunOptions()}
                  selected={selectedJun}
                  onSelect={setSelectedJun}
                  wuxingColor={colors.primary}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                上一步
              </button>
            )}

            <button
              onClick={handleStepComplete}
              disabled={
                (currentStep === 1 && !selectedTreatment) ||
                (currentStep === 2 && !selectedFormula) ||
                (currentStep === 3 && !selectedJun)
              }
              className={`ml-auto px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                ((currentStep === 1 && selectedTreatment) ||
                  (currentStep === 2 && selectedFormula) ||
                  (currentStep === 3 && selectedJun))
                  ? `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {currentStep === 3 ? (
                <>
                  <Shield className="w-5 h-5" />
                  提交诊断
                </>
              ) : (
                <>
                  下一步
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* 警告提示 */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-yellow-400 text-sm">
              Boss挑战需要三步全部正确才能通关，请谨慎选择！
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BossCase;
