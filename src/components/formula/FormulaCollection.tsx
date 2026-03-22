import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@stores/gameStore';
import type { Formula, Medicine } from '../../types/index';
import './FormulaCollection.css';

interface FormulaCollectionProps {
  onClose: () => void;
}

// 熟练度等级配置
const proficiencyConfig = [
  { level: 0, name: '未收录', color: '#9E9E9E', icon: '○' },
  { level: 1, name: '初识', color: '#4CAF50', icon: '★' },
  { level: 2, name: '熟悉', color: '#2196F3', icon: '★★' },
  { level: 3, name: '掌握', color: '#FF9800', icon: '★★★' },
  { level: 4, name: '精通', color: '#9C27B0', icon: '★★★★' },
  { level: 5, name: '化境', color: '#FFD700', icon: '★★★★★' },
];

// 方剂分类配置
const categoryConfig: Record<string, { name: string; color: string; icon: string }> = {
  '解表剂': { name: '解表剂', color: '#E3F2FD', icon: '🌬️' },
  '清热剂': { name: '清热剂', color: '#FFEBEE', icon: '🔥' },
  '补益剂': { name: '补益剂', color: '#E8F5E9', icon: '💪' },
  '祛湿剂': { name: '祛湿剂', color: '#E0F2F1', icon: '💧' },
  '理气剂': { name: '理气剂', color: '#FFF3E0', icon: '🌊' },
  '理血剂': { name: '理血剂', color: '#FCE4EC', icon: '🩸' },
  '温里剂': { name: '温里剂', color: '#FFE0B2', icon: '☀️' },
  '祛痰剂': { name: '祛痰剂', color: '#F3E5F5', icon: '🌫️' },
};

export const FormulaCollection: React.FC<FormulaCollectionProps> = ({ onClose }) => {
  const { formulas, medicines, unlockedFormulas, formulaProficiency } = useGameStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = new Set(formulas.map((f) => f.category));
    return ['all', ...Array.from(cats)];
  }, [formulas]);

  // 过滤方剂
  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory;
      const matchesSearch = formula.name.includes(searchTerm) ||
        formula.pinyin.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [formulas, selectedCategory, searchTerm]);

  // 获取方剂熟练度
  const getProficiency = (formulaId: string): number => {
    return formulaProficiency[formulaId] || 0;
  };

  // 检查方剂是否已解锁
  const isUnlocked = (formulaId: string): boolean => {
    return unlockedFormulas.includes(formulaId);
  };

  // 获取药材信息
  const getMedicine = (medicineId: string): Medicine | undefined => {
    return medicines.find((m) => m.id === medicineId);
  };

  // 获取熟练度配置
  const getProficiencyConfig = (level: number) => {
    return proficiencyConfig[Math.min(level, 5)];
  };

  // 统计
  const stats = useMemo(() => {
    const total = formulas.length;
    const unlocked = unlockedFormulas.length;
    const mastered = Object.values(formulaProficiency).filter((p) => p >= 3).length;
    return { total, unlocked, mastered };
  }, [formulas.length, unlockedFormulas.length, formulaProficiency]);

  return (
    <motion.div
      className="formula-collection-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="formula-collection-panel"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="collection-header">
          <div className="collection-title">
            <span className="title-icon">📚</span>
            <h2>方剂宝典</h2>
          </div>
          <div className="collection-stats">
            <span className="stat-item">
              <span className="stat-value">{stats.unlocked}</span>
              <span className="stat-label">/ {stats.total} 已收录</span>
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item">
              <span className="stat-value">{stats.mastered}</span>
              <span className="stat-label"> 已掌握</span>
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 搜索和分类 */}
        <div className="collection-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="搜索方剂..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? (
                  <>
                    <span className="tab-icon">📖</span>
                    <span>全部</span>
                  </>
                ) : (
                  <>
                    <span className="tab-icon">{categoryConfig[cat]?.icon || '📋'}</span>
                    <span>{cat}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 方剂网格 */}
        <div className="formula-grid">
          {filteredFormulas.map((formula, index) => {
            const unlocked = isUnlocked(formula.id);
            const proficiency = getProficiency(formula.id);
            const profConfig = getProficiencyConfig(proficiency);
            const category = categoryConfig[formula.category];

            return (
              <motion.div
                key={formula.id}
                className={`formula-card ${unlocked ? 'unlocked' : 'locked'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => unlocked && setSelectedFormula(formula)}
                style={{
                  borderColor: unlocked ? profConfig.color : 'transparent',
                }}
              >
                {/* 熟练度星级 */}
                <div
                  className="proficiency-badge"
                  style={{ backgroundColor: profConfig.color }}
                >
                  {profConfig.icon}
                </div>

                {/* 分类标识 */}
                <div
                  className="category-badge"
                  style={{ backgroundColor: category?.color || '#E0E0E0' }}
                >
                  <span className="category-icon">{category?.icon || '📋'}</span>
                  <span className="category-name">{formula.category}</span>
                </div>

                {/* 方剂名称 */}
                <h3 className="formula-name">
                  {unlocked ? formula.name : '???'}
                </h3>

                {unlocked && (
                  <>
                    {/* 组成预览 */}
                    <div className="composition-preview">
                      {formula.composition.slice(0, 4).map((comp, idx) => {
                        const medicine = getMedicine(comp.medicineId);
                        return (
                          <span key={idx} className="preview-medicine">
                            {medicine?.name || comp.medicineId}
                          </span>
                        );
                      })}
                      {formula.composition.length > 4 && (
                        <span className="more-medicines">
                          +{formula.composition.length - 4}
                        </span>
                      )}
                    </div>

                    {/* 功效 */}
                    <div className="function-preview">
                      {formula.functions.join('，').slice(0, 20)}...
                    </div>

                    {/* 熟练度条 */}
                    <div className="proficiency-bar">
                      <div
                        className="proficiency-fill"
                        style={{
                          width: `${(proficiency / 5) * 100}%`,
                          backgroundColor: profConfig.color,
                        }}
                      />
                    </div>
                  </>
                )}

                {!unlocked && (
                  <div className="locked-hint">
                    <span className="lock-icon">🔒</span>
                    <span>完成任务解锁</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 详情弹窗 */}
        <AnimatePresence>
          {selectedFormula && (
            <FormulaDetailModal
              formula={selectedFormula}
              proficiency={getProficiency(selectedFormula.id)}
              onClose={() => setSelectedFormula(null)}
              getMedicine={getMedicine}
              getProficiencyConfig={getProficiencyConfig}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// 详情弹窗组件
interface FormulaDetailModalProps {
  formula: Formula;
  proficiency: number;
  onClose: () => void;
  getMedicine: (id: string) => Medicine | undefined;
  getProficiencyConfig: (level: number) => typeof proficiencyConfig[0];
}

const FormulaDetailModal: React.FC<FormulaDetailModalProps> = ({
  formula,
  proficiency,
  onClose,
  getMedicine,
  getProficiencyConfig,
}) => {
  const profConfig = getProficiencyConfig(proficiency);
  const category = categoryConfig[formula.category];
  const [activeTab, setActiveTab] = useState<'composition' | 'function' | 'song' | 'clinical'>('composition');

  // 角色名称映射
  const roleNames: Record<string, { name: string; color: string; desc: string }> = {
    jun: { name: '君药', color: '#F44336', desc: '针对主病主证起主要治疗作用的药物' },
    chen: { name: '臣药', color: '#FF9800', desc: '辅助君药加强治疗作用的药物' },
    zuo: { name: '佐药', color: '#2196F3', desc: '协助君臣药治疗兼证或制约毒性的药物' },
    shi: { name: '使药', color: '#4CAF50', desc: '引经药或调和诸药的药物' },
  };

  return (
    <motion.div
      className="formula-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="formula-detail-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="detail-header" style={{ borderColor: profConfig.color }}>
          <div
            className="detail-proficiency"
            style={{ backgroundColor: profConfig.color }}
          >
            {profConfig.icon} {profConfig.name}
          </div>
          <div
            className="detail-category"
            style={{ backgroundColor: category?.color || '#E0E0E0' }}
          >
            <span>{category?.icon || '📋'}</span>
            <span>{formula.category}</span>
          </div>
          <h2 className="detail-formula-name">{formula.name}</h2>
          <p className="detail-pinyin">{formula.pinyin}</p>
          <button className="detail-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 熟练度进度 */}
        <div className="detail-proficiency-bar">
          <div className="proficiency-label">熟练度</div>
          <div className="proficiency-track">
            <div
              className="proficiency-progress"
              style={{
                width: `${(proficiency / 5) * 100}%`,
                backgroundColor: profConfig.color,
              }}
            />
          </div>
          <div className="proficiency-levels">
            {proficiencyConfig.map((config) => (
              <div
                key={config.level}
                className={`level-dot ${proficiency >= config.level ? 'active' : ''}`}
                style={{
                  backgroundColor: proficiency >= config.level ? config.color : '#E0E0E0',
                }}
              >
                {config.icon}
              </div>
            ))}
          </div>
        </div>

        {/* 标签页 */}
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'composition' ? 'active' : ''}`}
            onClick={() => setActiveTab('composition')}
          >
            组成
          </button>
          <button
            className={`detail-tab ${activeTab === 'function' ? 'active' : ''}`}
            onClick={() => setActiveTab('function')}
          >
            功效
          </button>
          {proficiency >= 2 && (
            <button
              className={`detail-tab ${activeTab === 'song' ? 'active' : ''}`}
              onClick={() => setActiveTab('song')}
            >
              方歌
            </button>
          )}
          {proficiency >= 1 && (
            <button
              className={`detail-tab ${activeTab === 'clinical' ? 'active' : ''}`}
              onClick={() => setActiveTab('clinical')}
            >
              临床
            </button>
          )}
        </div>

        {/* 内容区 */}
        <div className="detail-content">
          <AnimatePresence mode="wait">
            {activeTab === 'composition' && (
              <motion.div
                key="composition"
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3>方剂组成</h3>
                <div className="composition-detail-list">
                  {formula.composition.map((comp, idx) => {
                    const medicine = getMedicine(comp.medicineId);
                    const role = roleNames[comp.role];

                    return (
                      <div key={idx} className="composition-detail-item">
                        <div
                          className="role-indicator"
                          style={{ backgroundColor: role.color }}
                        >
                          <span className="role-name">{role.name}</span>
                          <span className="role-desc">{role.desc}</span>
                        </div>
                        <div className="medicine-info">
                          <span className="medicine-name-large">
                            {medicine?.name || comp.medicineId}
                          </span>
                          <span className="medicine-amount-large">{comp.amount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'function' && (
              <motion.div
                key="function"
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="function-section">
                  <h3>功效</h3>
                  <div className="function-tags">
                    {formula.functions.map((func, idx) => (
                      <span key={idx} className="function-tag">
                        {func}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="indication-section">
                  <h3>主治</h3>
                  <ul className="indication-list">
                    {formula.indications.map((ind, idx) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'song' && proficiency >= 2 && formula.song && (
              <motion.div
                key="song"
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3>方歌</h3>
                <div className="song-content">
                  {formula.song.split('，').map((line, idx) => (
                    <p key={idx} className="song-line">{line}</p>
                  ))}
                </div>
                {proficiency < 5 && (
                  <p className="unlock-hint">
                    熟练度达到化境(★★★★★)可解锁加减变化
                  </p>
                )}
              </motion.div>
            )}

            {activeTab === 'clinical' && proficiency >= 1 && (
              <motion.div
                key="clinical"
                className="tab-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3>临床应用</h3>
                <div className="clinical-info">
                  <div className="clinical-stat">
                    <span className="stat-label">已实习次数</span>
                    <span className="stat-value">{proficiency * 3} 次</span>
                  </div>
                  <div className="clinical-stat">
                    <span className="stat-label">辨证准确率</span>
                    <span className="stat-value">{85 + proficiency * 3}%</span>
                  </div>
                </div>
                <p className="clinical-hint">
                  继续通过临床实习提升熟练度，解锁更多方剂和临床应用知识。
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 操作按钮 */}
        <div className="detail-actions">
          <button className="share-btn">
            <span>📤</span> 分享
          </button>
          <button className="practice-btn">
            <span>🏥</span> 临床实习
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormulaCollection;
