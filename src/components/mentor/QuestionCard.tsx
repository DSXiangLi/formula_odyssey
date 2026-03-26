import React, { useState } from 'react';
import { Question } from '../../services/ai/QuestionService';

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setShowResult(true);
    const isCorrect = selected === question.answer;
    setTimeout(() => onAnswer(isCorrect), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg">
      <h3 className="text-lg font-bold mb-4">{question.question}</h3>

      <div className="space-y-2 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              selected === option
                ? showResult
                  ? option === question.answer
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-red-100 border-2 border-red-500'
                  : 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>

      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          提交答案
        </button>
      ) : (
        <div className={`p-4 rounded-lg ${selected === question.answer ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-medium mb-2">
            {selected === question.answer ? '✓ 回答正确！' : '✗ 回答错误'}
          </p>
          <p className="text-sm text-gray-600">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
