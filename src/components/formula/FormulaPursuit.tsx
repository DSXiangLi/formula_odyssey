import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@stores/gameStore';
import type { FormulaPursuit, Formula, Medicine } from '../../types/index';
import './FormulaPursuit.css';

interface FormulaPursuitProps {
  onClose: () => void;
}

// 难度配置
const difficultyConfig = {
  easy: { label: '入门', color: '#4CAF50', icon: '🌱' },
  normal: { label: '普通', color: '#2196F3', icon: '🌿' },
  hard: { label: '困难', color: '#FF9800', icon: '🔥' },
  challenge: { label: '挑战', color: '#F44336', icon: '⚡' },
};

export const FormulaPursuitPanel: React.FC<FormulaPursuitProps> = ({ onClose }) => {
  const {
    formulas,
    medicines,
    activePursuits,
    collectedMedicines,
    completePursuit,
    abandonPursuit,
    addCurrency,
  } = useGameStore();

  const [selectedPursuit, setSelectedPursuit] = useState<FormulaPursuit | null>(null);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  // 计算倒计时
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimeLeft: Record<string, number> = {};

      activePursuits.forEach((pursuit) => {
        const expiresAt = new Date(pursuit.expiresAt).getTime();
        const remaining = Math.max(0, expiresAt - now);
        newTimeLeft[pursuit.id] = remaining;
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [activePursuits]);

  // 格式化时间
  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}小时${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  // 获取方剂信息
  const getFormula = (formulaId: string): Formula | undefined => {
    return formulas.find((f) => f.id === formulaId);
  };

  // 获取药材信息
  const getMedicine = (medicineId: string): Medicine | undefined => {
    return medicines.find((m) => m.id === medicineId);
  };

  // 检查药材是否已收集
  const isMedicineCollected = (medicineId: string): boolean => {
    return collectedMedicines.includes(medicineId);
  };

  // 计算方剂收集进度
  const getProgress = (pursuit: FormulaPursuit): { current: number; total: number } => {
    const formula = getFormula(pursuit.formulaId);
    if (!formula) return { current: 0, total: 0 };

    const total = formula.composition.length;
    const current = formula.composition.filter((comp) =>
      isMedicineCollected(comp.medicineId)
    ).length;

    return { current, total };
  };

  // 检查方剂是否可完成
  const canComplete = (pursuit: FormulaPursuit): boolean => {
    const progress = getProgress(pursuit);
    return progress.current === progress.total;
  };

  // 完成追缉令
  const handleComplete = (pursuit: FormulaPursuit) => {
    if (!canComplete(pursuit)) return;

    completePursuit(pursuit.id);
    addCurrency(pursuit.rewards.currency);

    // 显示完成动画或提示
    setSelectedPursuit(null);
  };

  // 放弃追缉令
  const handleAbandon = (pursuitId: string) => {
    abandonPursuit(pursuitId);
    setSelectedPursuit(null);
  };

  return (
    <motion.div
      className="formula-pursuit-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="formula-pursuit-panel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="pursuit-header">
          <div className="pursuit-title">
            <span className="title-icon">📜</span>
            <h2>方剂追缉令</h2>
          </div>
          <p className="pursuit-subtitle">每日5:00刷新</p>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 追缉令列表 */}
        <div className="pursuit-list">
          {activePursuits.length === 0 ? (
            <div className="empty-pursuits">
              <span className="empty-icon">🌙</span>
              <p>今日暂无追缉令</p>
              <p className="empty-hint">请明日再来查看</p>
            </div>
          ) : (
            activePursuits.map((pursuit, index) => {
              const formula = getFormula(pursuit.formulaId);
              if (!formula) return null;

              const progress = getProgress(pursuit);
              const difficulty = difficultyConfig[pursuit.difficulty];
              const remaining = timeLeft[pursuit.id] || 0;

              return (
                <motion.div
                  key={pursuit.id}
                  className={`pursuit-card ${pursuit.completed ? 'completed' : ''} ${canComplete(pursuit) ? 'ready' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPursuit(pursuit)}
                >
                  {/* 难度标识 */}
                  <div
                    className="difficulty-badge"
                    style={{ backgroundColor: difficulty.color }}
                  >
                    <span className="difficulty-icon">{difficulty.icon}</span>
                    <span className="difficulty-label">{difficulty.label}</span>
                  </div>

                  {/* 方剂信息 */}
                  <div className="pursuit-info">
                    <h3 className="formula-name">
                      {formula.name}
                      <span className="formula-category">{formula.category}</span>
                    </h3>

                    {/* 组成进度 */}
                    <div className="composition-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(progress.current / progress.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {progress.current}/{progress.total}
                      </span>
                    </div>

                    {/* 组成详情 */}
                    <div className="composition-detail">
                      {formula.composition.map((comp, idx) => {
                        const medicine = getMedicine(comp.medicineId);
                        const collected = isMedicineCollected(comp.medicineId);
                        return (
                          <span
                            key={idx}
                            className={`medicine-tag ${collected ? 'collected' : 'missing'}`}
                          >
                            {collected ? '✓' : '○'} {medicine?.name || comp.medicineId}
                            {comp.amount && <span className="amount">{comp.amount}</span>}
                          </span>
                        );
                      })}
                    </div>

                    {/* 特殊要求 */}
                    {pursuit.requirements && (
                      <div className="special-requirement">
                        <span className="req-icon">⭐</span>
                        {pursuit.requirements}
                      </div>
                    )}
                  </div>

                  {/* 右侧信息 */}
                  <div className="pursuit-meta">
                    {/* 倒计时 */}
                    <div className="countdown">
                      <span className="countdown-icon">⏰</span>
                      <span className={remaining < 3600000 ? 'urgent' : ''}>
                        {formatTime(remaining)}
                      </span>
                    </div>

                    {/* 奖励预览 */}
                    <div className="reward-preview">
                      <div className="reward-item">
                        <span className="reward-icon">💎</span>
                        <span>{pursuit.rewards.currency}</span>
                      </div>
                      {pursuit.rewards.badge && (
                        <div className="reward-item badge">
                          <span className="reward-icon">🏆</span>
                          <span>{pursuit.rewards.badge}</span>
                        </div>
                      )}
                    </div>

                    {/* 状态按钮 */}
                    {pursuit.completed ? (
                      <div className="status-badge completed">✓ 已完成</div>
                    ) : canComplete(pursuit) ? (
                      <button
                        className="complete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(pursuit);
                        }}
                      >
                        领取奖励
                      </button>
                    ) : (
                      <button
                        className="goto-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 导航到探索界面收集缺失药材
                          onClose();
                        }}
                      >
                        前往收集
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* 底部统计 */}
        <div className="pursuit-stats">
          <div className="stat-item">
            <span className="stat-label">今日完成</span>
            <span className="stat-value">
              {activePursuits.filter((p) => p.completed).length}/{activePursuits.length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">预计收益</span>
            <span className="stat-value">
              💎 {activePursuits
                .filter((p) => p.completed)
                .reduce((sum, p) => sum + p.rewards.currency, 0)}
            </span>
          </div>
        </div>

        {/* 详情弹窗 */}
        <AnimatePresence>
          {selectedPursuit && (
            <PursuitDetailModal
              pursuit={selectedPursuit}
              formula={getFormula(selectedPursuit.formulaId)!}
              onClose={() => setSelectedPursuit(null)}
              onComplete={() => handleComplete(selectedPursuit)}
              onAbandon={() => handleAbandon(selectedPursuit.id)}
              canComplete={canComplete(selectedPursuit)}
              progress={getProgress(selectedPursuit)}
              remainingTime={timeLeft[selectedPursuit.id] || 0}
              getMedicine={getMedicine}
              isMedicineCollected={isMedicineCollected}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// 详情弹窗组件
interface PursuitDetailModalProps {
  pursuit: FormulaPursuit;
  formula: Formula;
  onClose: () => void;
  onComplete: () => void;
  onAbandon: () => void;
  canComplete: boolean;
  progress: { current: number; total: number };
  remainingTime: number;
  getMedicine: (id: string) => Medicine | undefined;
  isMedicineCollected: (id: string) => boolean;
}

const PursuitDetailModal: React.FC<PursuitDetailModalProps> = ({
  pursuit,
  formula,
  onClose,
  onComplete,
  onAbandon,
  canComplete,
  progress,
  remainingTime,
  getMedicine,
  isMedicineCollected,
}) => {
  const difficulty = difficultyConfig[pursuit.difficulty];

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小时${minutes}分`;
  };

  return (
    <motion.div
      className="pursuit-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="pursuit-detail-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="detail-header" style={{ borderColor: difficulty.color }}>
          <div
            className="detail-difficulty"
            style={{ backgroundColor: difficulty.color }}
          >
            {difficulty.icon} {difficulty.label}
          </div>
          <h2 className="detail-title">{formula.name}</h2>
          <p className="detail-category">{formula.category}</p>
          <button className="detail-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="detail-content">
          {/* 组成 */}
          <section className="detail-section">
            <h3>📋 方剂组成</h3>
            <div className="composition-list">
              {formula.composition.map((comp, idx) => {
                const medicine = getMedicine(comp.medicineId);
                const collected = isMedicineCollected(comp.medicineId);
                const roleNames = { jun: '君', chen: '臣', zuo: '佐', shi: '使' };

                return (
                  <div
                    key={idx}
                    className={`composition-item ${collected ? 'collected' : 'missing'}`}
                  >
                    <span className="role-tag" data-role={comp.role}>
                      {roleNames[comp.role]}
                    </span>
                    <span className="medicine-name">
                      {medicine?.name || comp.medicineId}
                    </span>
                    <span className="medicine-amount">{comp.amount}</span>
                    <span className="collect-status">
                      {collected ? '✓ 已收集' : '○ 未收集'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 功效主治 */}
          <section className="detail-section">
            <h3>💊 功效主治</h3>
            <div className="functions-list">
              <div className="function-item">
                <label>功效：</label>
                <span>{formula.functions.join('，')}</span>
              </div>
              <div className="function-item">
                <label>主治：</label>
                <span>{formula.indications.join('，')}</span>
              </div>
            </div>
          </section>

          {/* 方歌 */}
          {formula.song && (
            <section className="detail-section">
              <h3>🎵 方歌</h3>
              <div className="formula-song">{formula.song}</div>
            </section>
          )}

          {/* 特殊要求 */}
          {pursuit.requirements && (
            <section className="detail-section">
              <h3>⭐ 特殊要求</h3>
              <div className="special-req">{pursuit.requirements}</div>
            </section>
          )}

          {/* 奖励 */}
          <section className="detail-section">
            <h3>🎁 任务奖励</h3>
            <div className="reward-list">
              <div className="reward-detail">
                <span className="reward-icon">💎</span>
                <span>{pursuit.rewards.currency} 方灵石</span>
              </div>
              {pursuit.rewards.affinityBonus && (
                <div className="reward-detail">
                  <span className="reward-icon">❤️</span>
                  <span>亲密度 +{pursuit.rewards.affinityBonus}</span>
                </div>
              )}
              {pursuit.rewards.badge && (
                <div className="reward-detail">
                  <span className="reward-icon">🏆</span>
                  <span>徽章：{pursuit.rewards.badge}</span>
                </div>
              )}
            </div>
          </section>

          {/* 进度 */}
          <section className="detail-section">
            <h3>📊 收集进度</h3>
            <div className="progress-detail">
              <div className="progress-bar-large">
                <div
                  className="progress-fill-large"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <span className="progress-text-large">
                {progress.current}/{progress.total} 味药材
              </span>
            </div>
          </section>

          {/* 剩余时间 */}
          <section className="detail-section">
            <h3>⏰ 剩余时间</h3>
            <div className={`time-remaining ${remainingTime < 3600000 ? 'urgent' : ''}`}>
              {formatTime(remainingTime)}
            </div>
          </section>
        </div>

        {/* 操作按钮 */}
        <div className="detail-actions">
          {pursuit.completed ? (
            <div className="completed-message">✓ 已完成</div>
          ) : (
            <>
              <button
                className={`complete-action-btn ${canComplete ? 'ready' : 'disabled'}`}
                onClick={onComplete}
                disabled={!canComplete}
              >
                {canComplete ? '领取奖励' : '收集未完成'}
              </button>
              <button className="abandon-btn" onClick={onAbandon}>
                放弃任务
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormulaPursuitPanel;
