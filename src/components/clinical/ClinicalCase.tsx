import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import type { ClinicalCase, Formula } from '../../types';
import {
  Stethoscope,
  User,
  Activity,
  Droplets,
  Heart,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  Award,
  BookOpen,
} from 'lucide-react';
import styles from './ClinicalCase.module.css';

// 治法选项
const TREATMENT_OPTIONS = [
  '辛温解表',
  '辛凉解表',
  '解肌发表',
  '清热泻火',
  '益气健脾',
  '补血和血',
  '峻下热结',
  '解表散寒，温肺化饮',
  '和胃降逆，开结消痞',
  '温中祛寒，补气健脾',
];

// 方剂选项（从store获取）
const FORMULA_OPTIONS = [
  '麻黄汤',
  '桂枝汤',
  '四君子汤',
  '四物汤',
  '大承气汤',
  '小青龙汤',
  '参苓白术散',
  '银翘散',
  '半夏泻心汤',
  '理中丸',
];

interface ClinicalCaseProps {
  caseId: string;
  onClose: () => void;
  onComplete?: (result: {
    score: number;
    reward: number;
    proficiencyGain: number;
  }) => void;
}

export const ClinicalCaseComponent: React.FC<ClinicalCaseProps> = ({
  caseId,
  onClose,
  onComplete,
}) => {
  const {
    clinicalCases,
    submitDiagnosis,
    completeClinicalCase,
    getFormulaById,
  } = useGameStore();

  const [currentCase, setCurrentCase] = useState<ClinicalCase | null>(null);
  const [currentFormula, setCurrentFormula] = useState<Formula | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [selectedFormula, setSelectedFormula] = useState<string>('');
  const [selectedJun, setSelectedJun] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    treatmentCorrect: boolean;
    formulaCorrect: boolean;
    junCorrect: boolean;
    score: number;
    explanation: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  // 加载病案数据
  useEffect(() => {
    const caseData = clinicalCases.find(c => c.id === caseId);
    if (caseData) {
      setCurrentCase(caseData);
      const formula = getFormulaById(caseData.formulaId);
      setCurrentFormula(formula || null);
    }
  }, [caseId, clinicalCases, getFormulaById]);

  // 获取君药选项
  const getJunOptions = () => {
    if (!currentFormula) return [];
    return currentFormula.composition
      .filter(c => c.role === 'jun')
      .map(c => {
        const medicine = useGameStore.getState().getMedicineById(c.medicineId);
        return medicine?.name || c.medicineId;
      });
  };

  // 处理提交
  const handleSubmit = () => {
    if (!currentCase) return;

    const submitResult = submitDiagnosis(
      caseId,
      selectedTreatment,
      selectedFormula,
      selectedJun.join(',')
    );

    // 计算详细结果
    const treatmentCorrect = selectedTreatment === currentCase.correctTreatment;
    const formulaCorrect = selectedFormula === currentCase.correctFormula;
    const correctJunList = currentCase.correctJun.split(/[,、，]/).map(s => s.trim());
    const junCorrect = selectedJun.length > 0 && selectedJun.every(j =>
      correctJunList.some(cj => j.includes(cj) || cj.includes(j))
    );

    setResult({
      treatmentCorrect,
      formulaCorrect,
      junCorrect,
      score: submitResult.score,
      explanation: currentCase.explanation,
    });

    setShowResult(true);

    // 完成病案
    completeClinicalCase(caseId, submitResult.score);

    // 回调通知父组件
    if (onComplete) {
      const reward = submitResult.score >= 5 ? 200 : submitResult.score >= 4 ? 100 : 50;
      const proficiencyGain = submitResult.score >= 4 ? 2 : 1;
      onComplete({
        score: submitResult.score,
        reward,
        proficiencyGain,
      });
    }
  };

  // 处理君药选择
  const toggleJunSelection = (junName: string) => {
    setSelectedJun(prev => {
      if (prev.includes(junName)) {
        return prev.filter(j => j !== junName);
      }
      return [...prev, junName];
    });
  };

  // 使用提示
  const useHint = () => {
    setShowHint(true);
    // 扣除50方灵石
    useGameStore.getState().addCurrency(-50);
  };

  if (!currentCase) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>加载病案中...</p>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* 头部 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Stethoscope className={styles.headerIcon} />
            <h2 className={styles.title}>临床实习</h2>
            <span className={styles.caseId}>病案 {caseId}</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="question"
              className={styles.content}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 患者信息卡片 */}
              <div className={styles.patientCard}>
                <div className={styles.patientHeader}>
                  <User className={styles.patientIcon} />
                  <h3 className={styles.patientTitle}>患者信息</h3>
                </div>
                <p className={styles.patientInfo}>
                  {typeof currentCase.patientInfo === 'string'
                    ? currentCase.patientInfo
                    : `${currentCase.patientInfo.name}，${currentCase.patientInfo.age}岁，${currentCase.patientInfo.gender === 'male' ? '男' : '女'}`}
                </p>

                {/* 症状 */}
                <div className={styles.symptomSection}>
                  <div className={styles.sectionLabel}>
                    <Activity className={styles.sectionIcon} />
                    <span>症状</span>
                  </div>
                  <div className={styles.symptomList}>
                    {currentCase.symptoms.map((symptom, index) => (
                      <span key={index} className={styles.symptomTag}>
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 舌象脉象 */}
                <div className={styles.examGrid}>
                  <div className={styles.examItem}>
                    <div className={styles.examLabel}>
                      <Droplets className={styles.examIcon} />
                      <span>舌象</span>
                    </div>
                    <p className={styles.examValue}>
                      {typeof currentCase.tongue === 'string'
                        ? currentCase.tongue
                        : `${currentCase.tongue.color}，${currentCase.tongue.coating}${currentCase.tongue.shape ? '，' + currentCase.tongue.shape : ''}`}
                    </p>
                  </div>
                  <div className={styles.examItem}>
                    <div className={styles.examLabel}>
                      <Heart className={styles.examIcon} />
                      <span>脉象</span>
                    </div>
                    <p className={styles.examValue}>
                      {typeof currentCase.pulse === 'string'
                        ? currentCase.pulse
                        : `${currentCase.pulse.type}脉，${currentCase.pulse.description}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 答题区域 */}
              <div className={styles.answerSection}>
                {/* 治法选择 */}
                <div className={styles.answerGroup}>
                  <h4 className={styles.answerTitle}>请选择治法</h4>
                  <div className={styles.optionGrid}>
                    {TREATMENT_OPTIONS.map(treatment => (
                      <button
                        key={treatment}
                        className={`${styles.optionButton} ${
                          selectedTreatment === treatment ? styles.selected : ''
                        }`}
                        onClick={() => setSelectedTreatment(treatment)}
                      >
                        {treatment}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 方剂选择 */}
                <div className={styles.answerGroup}>
                  <h4 className={styles.answerTitle}>请选择方剂</h4>
                  <div className={styles.optionGrid}>
                    {FORMULA_OPTIONS.map(formula => (
                      <button
                        key={formula}
                        className={`${styles.optionButton} ${
                          selectedFormula === formula ? styles.selected : ''
                        }`}
                        onClick={() => setSelectedFormula(formula)}
                      >
                        {formula}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 君药选择 */}
                {currentFormula && (
                  <div className={styles.answerGroup}>
                    <h4 className={styles.answerTitle}>请选择君药</h4>
                    <div className={styles.optionGrid}>
                      {getJunOptions().map(jun => (
                        <button
                          key={jun}
                          className={`${styles.optionButton} ${
                            selectedJun.includes(jun) ? styles.selected : ''
                          }`}
                          onClick={() => toggleJunSelection(jun)}
                        >
                          {selectedJun.includes(jun) && (
                            <CheckCircle className={styles.checkIcon} />
                          )}
                          {jun}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 提示 */}
              {showHint && (
                <motion.div
                  className={styles.hintBox}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <HelpCircle className={styles.hintIcon} />
                  <p>提示：{currentCase.correctTreatment}</p>
                </motion.div>
              )}

              {/* 操作按钮 */}
              <div className={styles.actionBar}>
                <button
                  className={styles.hintButton}
                  onClick={useHint}
                  disabled={showHint}
                >
                  <HelpCircle className={styles.buttonIcon} />
                  使用提示 (-50💎)
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  disabled={!selectedTreatment || !selectedFormula || selectedJun.length === 0}
                >
                  提交辨证
                  <ChevronRight className={styles.buttonIcon} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              className={styles.resultContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 结果卡片 */}
              <div className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  {result && result.score >= 4 ? (
                    <>
                      <Award className={styles.successIcon} />
                      <h3 className={styles.resultTitle}>辨证成功</h3>
                    </>
                  ) : (
                    <>
                      <BookOpen className={styles.partialIcon} />
                      <h3 className={styles.resultTitle}>辨证完成</h3>
                    </>
                  )}
                </div>

                {/* 得分详情 */}
                <div className={styles.scoreGrid}>
                  <div className={`${styles.scoreItem} ${result?.treatmentCorrect ? styles.correct : ''}`}>
                    <div className={styles.scoreLabel}>治法</div>
                    {result?.treatmentCorrect ? (
                      <CheckCircle className={styles.scoreIcon} />
                    ) : (
                      <XCircle className={styles.wrongIcon} />
                    )}
                  </div>
                  <div className={`${styles.scoreItem} ${result?.formulaCorrect ? styles.correct : ''}`}>
                    <div className={styles.scoreLabel}>方剂</div>
                    {result?.formulaCorrect ? (
                      <CheckCircle className={styles.scoreIcon} />
                    ) : (
                      <XCircle className={styles.wrongIcon} />
                    )}
                  </div>
                  <div className={`${styles.scoreItem} ${result?.junCorrect ? styles.correct : ''}`}>
                    <div className={styles.scoreLabel}>君药</div>
                    {result?.junCorrect ? (
                      <CheckCircle className={styles.scoreIcon} />
                    ) : (
                      <XCircle className={styles.wrongIcon} />
                    )}
                  </div>
                </div>

                {/* 解析 */}
                <div className={styles.explanationBox}>
                  <h4 className={styles.explanationTitle}>辨证解析</h4>
                  <p className={styles.explanationText}>{result?.explanation}</p>
                </div>

                {/* 正确答案 */}
                <div className={styles.answerSummary}>
                  <div className={styles.answerRow}>
                    <span className={styles.answerLabel}>治法：</span>
                    <span className={styles.answerValue}>{currentCase.correctTreatment}</span>
                  </div>
                  <div className={styles.answerRow}>
                    <span className={styles.answerLabel}>方剂：</span>
                    <span className={styles.answerValue}>{currentCase.correctFormula}</span>
                  </div>
                  <div className={styles.answerRow}>
                    <span className={styles.answerLabel}>君药：</span>
                    <span className={styles.answerValue}>{currentCase.correctJun}</span>
                  </div>
                </div>

                {/* 奖励 */}
                <div className={styles.rewardBox}>
                  <div className={styles.rewardItem}>
                    <span className={styles.rewardLabel}>获得方灵石</span>
                    <span className={styles.rewardValue}>
                      {result && result.score >= 5 ? '200' : result && result.score >= 4 ? '100' : '50'}💎
                    </span>
                  </div>
                  <div className={styles.rewardItem}>
                    <span className={styles.rewardLabel}>熟练度</span>
                    <span className={styles.rewardValue}>
                      +{result && result.score >= 4 ? '2' : '1'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 关闭按钮 */}
              <button className={styles.closeResultButton} onClick={onClose}>
                完成
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// 病案列表组件
export const ClinicalCaseList: React.FC<{
  onSelectCase: (caseId: string) => void;
}> = ({ onSelectCase }) => {
  const { clinicalCases, formulas, player, getFormulaProficiency } = useGameStore();

  // 按方剂分组病案
  const casesByFormula = clinicalCases.reduce((acc, c) => {
    if (!acc[c.formulaId]) {
      acc[c.formulaId] = [];
    }
    acc[c.formulaId].push(c);
    return acc;
  }, {} as Record<string, ClinicalCase[]>);

  return (
    <div className={styles.listContainer}>
      <h2 className={styles.listTitle}>临床实习病案</h2>
      <div className={styles.formulaList}>
        {Object.entries(casesByFormula).map(([formulaId, cases]) => {
          const formula = formulas.find(f => f.id === formulaId);
          const proficiency = getFormulaProficiency(formulaId);
          const completedCount = cases.filter(c =>
            player.completedCases?.includes(c.id)
          ).length;

          return (
            <div key={formulaId} className={styles.formulaCard}>
              <div className={styles.formulaHeader}>
                <div className={styles.formulaInfo}>
                  <h3 className={styles.formulaName}>{formula?.name}</h3>
                  <span className={styles.formulaCategory}>{formula?.category}</span>
                </div>
                <div className={styles.proficiencyBadge}>
                  <span className={styles.proficiencyLabel}>熟练度</span>
                  <div className={styles.proficiencyBar}>
                    <div
                      className={styles.proficiencyFill}
                      style={{ width: `${(proficiency / 5) * 100}%` }}
                    />
                  </div>
                  <span className={styles.proficiencyValue}>{proficiency}/5</span>
                </div>
              </div>

              <div className={styles.caseList}>
                {cases.map((c, index) => {
                  const isCompleted = player.completedCases?.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      className={`${styles.caseItem} ${isCompleted ? styles.completed : ''}`}
                      onClick={() => onSelectCase(c.id)}
                    >
                      <span className={styles.caseNumber}>病案 {index + 1}</span>
                      <span className={styles.casePatient}>
                        {typeof c.patientInfo === 'string'
                          ? c.patientInfo
                          : `${c.patientInfo.name}，${c.patientInfo.age}岁`}
                      </span>
                      {isCompleted && <CheckCircle className={styles.completedIcon} />}
                    </button>
                  );
                })}
              </div>

              <div className={styles.progressBar}>
                <span className={styles.progressText}>
                  已完成 {completedCount}/{cases.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClinicalCaseComponent;
