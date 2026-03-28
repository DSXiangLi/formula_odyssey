import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiMentor, MentorMessage } from '../../services/ai/AIMentorService';
import { DialogueBox } from '../../components/mentor/DialogueBox';
import { MentorAvatar } from '../../components/mentor/MentorAvatar';
import { getFormulasByChapter, FormulaData } from '../../data/formulas';
import type { StageProps } from '../../types/stage';

type LearningPhase = 'intro' | 'formula_intro' | 'composition' | 'quiz' | 'complete';

interface QuizQuestion {
  medicineName: string;
  correctRole: 'jun' | 'chen' | 'zuo' | 'shi';
  explanation: string;
}

export const FormulaLearningStage: React.FC<StageProps> = ({
  chapterId,
  onComplete,
  onExit,
}) => {
  const [phase, setPhase] = useState<LearningPhase>('intro');
  const [formulas, setFormulas] = useState<FormulaData[]>([]);
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(0);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [wuxing, setWuxing] = useState<'wood' | 'fire' | 'earth' | 'metal' | 'water'>('wood');

  const currentFormula = formulas[currentFormulaIndex];

  // 初始化 - 加载方剂数据
  useEffect(() => {
    if (!chapterId) return;

    // 获取章节方剂
    const chapterFormulas = getFormulasByChapter(chapterId);
    setFormulas(chapterFormulas.slice(0, 2)); // 每章学习2个方剂

    // 根据章节ID确定五行属性
    const chapterNum = parseInt(chapterId.replace('ch', '')) || 1;
    const wuxingMap: Array<'wood' | 'fire' | 'earth' | 'metal' | 'water'> =
      ['wood', 'fire', 'earth', 'metal', 'water'];
    setWuxing(wuxingMap[(chapterNum - 1) % 5]);
  }, [chapterId]);

  // 添加导师消息
  const addMentorMessage = useCallback((content: string, emotion?: MentorMessage['emotion']) => {
    const message: MentorMessage = {
      id: `msg_${Date.now()}`,
      role: 'mentor',
      content,
      emotion,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, message]);
  }, []);

  // 生成导师讲解
  const generateMentorExplanation = useCallback(async (type: 'intro' | 'formula' | 'composition', formula?: FormulaData) => {
    setIsLoading(true);

    const context = {
      playerName: '弟子',
      chapterId: chapterId || '',
      chapterTitle: `第${chapterId?.replace('ch', '') || '一'}章`,
      collectedMedicines: [],
      knownMedicineInfo: {},
      stage: 'guiding' as const,
    };

    let content = '';

    try {
      if (type === 'intro') {
        content = `欢迎来到方剂学习阶段！我是青木先生，今天我将为你讲解本章的经典方剂。

方剂是中医临床治疗的核心，而"君臣佐使"是方剂配伍的基本原则。
- **君药**：针对主病主证起主要治疗作用的药物
- **臣药**：辅助君药加强疗效，或治疗兼证
- **佐药**：协助君臣药，或制约毒性
- **使药**：引经报使，调和诸药

让我们开始学习第一个方剂吧！`;
      } else if (type === 'formula' && formula) {
        content = `现在我们学习【${formula.name}】。

这是一个${formula.category}，主要功效是${formula.functions.join('、')}。

**主治**：${formula.indications.join('、')}

${formula.song ? `**方歌**：${formula.song}` : ''}

接下来，我们详细了解它的组成和各药的君臣佐使配伍。`;
      } else if (type === 'composition' && formula) {
        const jun = formula.composition?.filter(c => c.role === 'jun').map(c => c.medicineId).join('、') || '';
        const chen = formula.composition?.filter(c => c.role === 'chen').map(c => c.medicineId).join('、') || '';
        const zuo = formula.composition?.filter(c => c.role === 'zuo').map(c => c.medicineId).join('、') || '';
        const shi = formula.composition?.filter(c => c.role === 'shi').map(c => c.medicineId).join('、') || '';

        content = `${formula.name}的组成如下：

**君药**：${jun}
- 为方剂之主，起主要治疗作用

**臣药**：${chen}
- 辅助君药，增强疗效

**佐药**：${zuo}
- 协助君臣，或制约毒性

**使药**：${shi}
- 调和诸药，引经报使

现在来考考你，看你记住了没有！`;
      }

      // 模拟AI响应延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      addMentorMessage(content, 'happy');
    } catch (error) {
      console.error('生成导师讲解失败:', error);
      addMentorMessage('抱歉，刚才走神了。让我们继续学习吧！', 'concerned');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, addMentorMessage]);

  // 生成测验题目
  const generateQuiz = useCallback(() => {
    if (!currentFormula?.composition) return;

    // 随机选择一味药出题
    const medicines = currentFormula.composition.filter(c => c.role);
    if (medicines.length === 0) return;

    const randomMed = medicines[Math.floor(Math.random() * medicines.length)];
    const medicineName = randomMed.medicineId;

    const roleNames: Record<string, string> = {
      jun: '君药',
      chen: '臣药',
      zuo: '佐药',
      shi: '使药',
    };

    const quiz: QuizQuestion = {
      medicineName,
      correctRole: randomMed.role as 'jun' | 'chen' | 'zuo' | 'shi',
      explanation: `${medicineName}在${currentFormula.name}中作为${roleNames[randomMed.role || 'jun']}，${getRoleExplanation(randomMed.role || 'jun', medicineName, currentFormula)}`,
    };

    setCurrentQuiz(quiz);
    addMentorMessage(`在${currentFormula.name}中，**${medicineName}**是什么角色？`, 'thinking');
  }, [currentFormula, addMentorMessage]);

  // 获取角色解释
  const getRoleExplanation = (role: string, medicineName: string, formula: FormulaData): string => {
    switch (role) {
      case 'jun':
        return `是方剂之主，针对${formula.indications[0] || '主证'}起主要治疗作用`;
      case 'chen':
        return `辅助君药，增强${formula.functions[0] || '治疗'}效果`;
      case 'zuo':
        return `协助君臣药治疗兼证，或制约他药毒性`;
      case 'shi':
        return `调和诸药，引经报使`;
      default:
        return '';
    }
  };

  // 检查答案
  const checkAnswer = useCallback((selectedRole: 'jun' | 'chen' | 'zuo' | 'shi') => {
    if (!currentQuiz) return;

    const isCorrect = selectedRole === currentQuiz.correctRole;
    setQuizResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore(prev => prev + 10);
      addMentorMessage(`答对了！${currentQuiz.explanation}`, 'celebrating');
    } else {
      const roleNames: Record<string, string> = {
        jun: '君药',
        chen: '臣药',
        zuo: '佐药',
        shi: '使药',
      };
      addMentorMessage(`不对哦，正确答案是**${roleNames[currentQuiz.correctRole]}**。${currentQuiz.explanation}`, 'concerned');
    }

    // 延迟后进入下一题或下一个方剂
    setTimeout(() => {
      setQuizResult(null);
      setCurrentQuiz(null);

      if (currentFormulaIndex < formulas.length - 1) {
        // 还有下一个方剂
        setCurrentFormulaIndex(prev => prev + 1);
        setPhase('formula_intro');
      } else {
        // 所有方剂学完
        setPhase('complete');
        addMentorMessage(`恭喜你完成了本章的方剂学习！你获得了${score + (isCorrect ? 10 : 0)}分。继续加油，中医之路还很长呢！`, 'celebrating');
      }
    }, 3000);
  }, [currentQuiz, currentFormulaIndex, formulas.length, score, addMentorMessage]);

  // 处理学生消息（这里简化处理，实际可扩展为真正的对话）
  const handleStudentMessage = useCallback((content: string) => {
    const message: MentorMessage = {
      id: `msg_${Date.now()}_student`,
      role: 'student',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, message]);

    // 导师简单回复
    setTimeout(() => {
      addMentorMessage('好问题！让我们继续学习。', 'thinking');
    }, 500);
  }, [addMentorMessage]);

  // 阶段切换
  useEffect(() => {
    if (!formulas.length) return;

    switch (phase) {
      case 'intro':
        generateMentorExplanation('intro');
        setTimeout(() => setPhase('formula_intro'), 4000);
        break;
      case 'formula_intro':
        generateMentorExplanation('formula', currentFormula);
        setTimeout(() => setPhase('composition'), 5000);
        break;
      case 'composition':
        generateMentorExplanation('composition', currentFormula);
        setTimeout(() => setPhase('quiz'), 6000);
        break;
      case 'quiz':
        generateQuiz();
        break;
    }
  }, [phase, formulas, currentFormula, generateMentorExplanation, generateQuiz]);

  // 完成学习
  const handleComplete = useCallback(() => {
    onComplete?.({
      score,
      completedFormulas: formulas.map(f => f.name),
    });
  }, [onComplete, score, formulas]);

  const roleOptions: Array<{ value: 'jun' | 'chen' | 'zuo' | 'shi'; label: string; color: string }> = [
    { value: 'jun', label: '君药', color: 'bg-red-500' },
    { value: 'chen', label: '臣药', color: 'bg-orange-500' },
    { value: 'zuo', label: '佐药', color: 'bg-yellow-500' },
    { value: 'shi', label: '使药', color: 'bg-green-500' },
  ];

  if (!formulas.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-800">
        <div className="text-white text-xl">加载方剂数据...</div>
      </div>
    );
  }

  return (
    <div data-testid="formula-learning" className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header data-testid="formula-header" className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div data-testid="mentor-avatar">
              <MentorAvatar expression="happy" wuxing={wuxing} size="md" />
            </div>
            <div>
              <h1 data-testid="formula-title" className="text-2xl font-bold">方剂学习</h1>
              <p className="text-white/60">跟随青木先生学习经典方剂</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div data-testid="score-display" className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-yellow-400">⭐</span>
              <span className="font-bold ml-2">{score}分</span>
            </div>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              退出
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {phase !== 'quiz' && phase !== 'complete' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* 当前方剂信息 */}
              <div data-testid="formula-info" className="lg:col-span-1 space-y-4">
                {currentFormula && (
                  <div data-testid="current-formula" className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h2 data-testid="formula-name" className="text-xl font-bold mb-2">{currentFormula.name}</h2>
                    <p data-testid="formula-category" className="text-white/60 text-sm mb-4">{currentFormula.category}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-white/40 text-xs">功效</span>
                        <p className="text-sm">{currentFormula.functions.join('、')}</p>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs">主治</span>
                        <p className="text-sm">{currentFormula.indications.join('、')}</p>
                      </div>
                    </div>
                    {currentFormula.song && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <span className="text-white/40 text-xs">方歌</span>
                        <p className="text-sm italic">{currentFormula.song}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 进度指示 */}
                <div data-testid="progress-indicator" className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>学习进度</span>
                    <span>{currentFormulaIndex + 1} / {formulas.length}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentFormulaIndex + 1) / formulas.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 对话区域 */}
              <div data-testid="dialogue-area" className="lg:col-span-2">
                <DialogueBox
                  messages={messages}
                  wuxing={wuxing}
                  onSendMessage={handleStudentMessage}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          )}

          {/* 测验界面 */}
          {phase === 'quiz' && currentQuiz && (
            <motion.div
              key="quiz"
              data-testid="quiz-interface"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div data-testid="quiz-container" className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <h2 data-testid="quiz-title" className="text-2xl font-bold mb-2">随堂测验</h2>
                <p data-testid="quiz-question" className="text-white/60 mb-8">
                  在{currentFormula?.name}中，<span className="text-yellow-400 font-bold">{currentQuiz.medicineName}</span>是什么角色？
                </p>

                <div data-testid="quiz-options" className="grid grid-cols-2 gap-4">
                  {roleOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      data-testid={`quiz-option-${option.value}`}
                      onClick={() => quizResult === null && checkAnswer(option.value)}
                      disabled={quizResult !== null}
                      whileHover={quizResult === null ? { scale: 1.05 } : {}}
                      whileTap={quizResult === null ? { scale: 0.95 } : {}}
                      className={`p-6 rounded-xl font-bold text-lg transition-all ${
                        quizResult === null
                          ? 'bg-white/20 hover:bg-white/30'
                          : option.value === currentQuiz.correctRole
                            ? 'bg-green-500'
                            : 'bg-white/10 opacity-50'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>

                {quizResult && (
                  <motion.div
                    data-testid="quiz-feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-xl ${
                      quizResult === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    <p data-testid="quiz-result" className={`font-bold ${quizResult === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                      {quizResult === 'correct' ? '🎉 回答正确！' : '❌ 回答错误'}
                    </p>
                    <p data-testid="quiz-explanation" className="text-white/80 mt-2">{currentQuiz.explanation}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* 完成界面 */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              data-testid="complete-interface"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-[60vh] flex items-center justify-center"
            >
              <div data-testid="complete-container" className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div data-testid="complete-icon" className="text-6xl mb-4">🎉</div>
                <h2 data-testid="complete-title" className="text-3xl font-bold mb-2">学习完成！</h2>
                <p data-testid="complete-message" className="text-white/60 mb-6">
                  恭喜你完成了本章的方剂学习
                </p>
                <div data-testid="complete-stats" className="space-y-3 mb-8">
                  <div data-testid="final-score" className="flex justify-between bg-white/5 rounded-lg px-4 py-2">
                    <span className="text-white/60">最终得分</span>
                    <span data-testid="score-value" className="font-bold text-yellow-400">{score}分</span>
                  </div>
                  <div data-testid="learned-count" className="flex justify-between bg-white/5 rounded-lg px-4 py-2">
                    <span className="text-white/60">学习方剂</span>
                    <span data-testid="formula-count" className="font-bold">{formulas.length}个</span>
                  </div>
                </div>
                <button
                  data-testid="continue-button"
                  onClick={handleComplete}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  继续临床考核 →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormulaLearningStage;
