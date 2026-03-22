import React from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';

interface DiagnosisOption {
  id: string;
  name: string;
  description: string;
}

interface DiagnosisStepProps {
  step: number;
  title: string;
  description: string;
  options: DiagnosisOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  wuxingColor: string;
}

export const DiagnosisStep: React.FC<DiagnosisStepProps> = ({
  step,
  title,
  description,
  options,
  selected,
  onSelect,
  wuxingColor,
}) => {
  return (
    <div className="space-y-4">
      {/* 标题区 */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: wuxingColor }}
        >
          {step}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>

      {/* 选项网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onSelect(option.name)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selected === option.name
                ? 'bg-slate-800 border-opacity-100'
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
            }`}
            style={{
              borderColor: selected === option.name ? wuxingColor : undefined,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 选中指示器 */}
            {selected === option.name && (
              <motion.div
                className="absolute top-3 right-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: wuxingColor }}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </motion.div>
            )}

            <div className="pr-8">
              <h4 className="text-lg font-semibold text-white mb-1">
                {option.name}
              </h4>
              <p className="text-slate-400 text-sm">{option.description}</p>
            </div>

            {/* 选中时的光效 */}
            {selected === option.name && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  boxShadow: `0 0 20px ${wuxingColor}40`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* 已选提示 */}
      {selected && (
        <motion.div
          className="p-3 rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: `${wuxingColor}20`,
            borderLeft: `4px solid ${wuxingColor}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Target className="w-5 h-5" style={{ color: wuxingColor }} />
          <span className="text-white">
            已选择：<span className="font-bold">{selected}</span>
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
        </motion.div>
      )}
    </div>
  );
};

export default DiagnosisStep;
