import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpiritQuestion, AnswerEvaluation } from '../../../systems/battle/types';
import QuestionBubble from '../QuestionBubble';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      'data-testid': dataTestId,
      className,
      ...props
    }: {
      children?: React.ReactNode;
      'data-testid'?: string;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid={dataTestId} className={className}>
        {children}
      </div>
    ),
    span: ({
      children,
      'data-testid': dataTestId,
      className,
      ...props
    }: {
      children?: React.ReactNode;
      'data-testid'?: string;
      className?: string;
      [key: string]: unknown;
    }) => (
      <span data-testid={dataTestId} className={className}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createMockQuestion = (overrides?: Partial<SpiritQuestion>): SpiritQuestion => ({
  id: 'q-1',
  type: 'recall',
  question: '这味药叫什么名字？',
  acceptableAnswers: ['人参', 'renshen'],
  hint: '补气的上品药材',
  knowledgeType: 'name',
  ...overrides,
});

const createMockEvaluation = (overrides?: Partial<AnswerEvaluation>): AnswerEvaluation => ({
  score: 5,
  isCorrect: true,
  feedback: '很好！你认出了这味珍贵的药材。',
  bonusInfo: '人参被誉为"百草之王"，主要产于长白山地区。',
  ...overrides,
});

describe('QuestionBubble', () => {
  it('renders question bubble with basic elements', () => {
    const question = createMockQuestion();

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    // Check main elements exist
    expect(screen.getByTestId('question-bubble')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-header')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-avatar')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-name')).toHaveTextContent('人参精灵');
    expect(screen.getByTestId('question-text')).toHaveTextContent('这味药叫什么名字？');
  });

  it('displays correct spirit emoji based on name', () => {
    const question = createMockQuestion();

    const { rerender } = render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.getByTestId('spirit-avatar')).toHaveTextContent('🌿');

    rerender(
      <QuestionBubble
        spiritName="枸杞精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.getByTestId('spirit-avatar')).toHaveTextContent('🫐');
  });

  it('displays default emoji when spirit name is not in emoji map', () => {
    const question = createMockQuestion();

    render(
      <QuestionBubble
        spiritName="未知药灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.getByTestId('spirit-avatar')).toHaveTextContent('🧚');
  });

  it('displays question text with quotes', () => {
    const question = createMockQuestion({ question: '猜猜我是什么药材？' });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    const questionText = screen.getByTestId('question-text');
    expect(questionText).toHaveTextContent('猜猜我是什么药材？');
  });

  it('displays choice options when question type is choice', () => {
    const question = createMockQuestion({
      type: 'choice',
      options: ['人参', '黄芪', '当归', '白术'],
    });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.getByTestId('choice-options')).toBeInTheDocument();
    expect(screen.getByTestId('choice-option-0')).toHaveTextContent('人参');
    expect(screen.getByTestId('choice-option-1')).toHaveTextContent('黄芪');
    expect(screen.getByTestId('choice-option-2')).toHaveTextContent('当归');
    expect(screen.getByTestId('choice-option-3')).toHaveTextContent('白术');
  });

  it('does not display choice options for non-choice questions', () => {
    const question = createMockQuestion({ type: 'recall' });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.queryByTestId('choice-options')).not.toBeInTheDocument();
  });

  it('displays hint section when showHint is true', () => {
    const question = createMockQuestion({ hint: '这是一种补气药材' });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={true}
      />
    );

    expect(screen.getByTestId('hint-section')).toBeInTheDocument();
    expect(screen.getByTestId('hint-text')).toHaveTextContent('这是一种补气药材');
  });

  it('does not display hint section when showHint is false', () => {
    const question = createMockQuestion();

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.queryByTestId('hint-section')).not.toBeInTheDocument();
  });

  it('displays correct evaluation feedback', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation({ isCorrect: true, score: 5 });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    expect(screen.getByTestId('evaluation-section')).toBeInTheDocument();
    expect(screen.getByTestId('evaluation-icon')).toHaveTextContent('✓');
    expect(screen.getByTestId('evaluation-result')).toHaveTextContent('回答正确！');
    expect(screen.getByTestId('evaluation-score')).toHaveTextContent('得分: 5/5分');
    expect(screen.getByTestId('evaluation-feedback')).toHaveTextContent('很好！你认出了这味珍贵的药材。');
  });

  it('displays incorrect evaluation feedback', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation({
      isCorrect: false,
      score: 2,
      feedback: '不太对，再想想看~',
    });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    expect(screen.getByTestId('evaluation-section')).toBeInTheDocument();
    expect(screen.getByTestId('evaluation-icon')).toHaveTextContent('✗');
    expect(screen.getByTestId('evaluation-result')).toHaveTextContent('回答错误');
    expect(screen.getByTestId('evaluation-score')).toHaveTextContent('得分: 2/5分');
    expect(screen.getByTestId('evaluation-feedback')).toHaveTextContent('不太对，再想想看~');
  });

  it('displays bonus info when provided in evaluation', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation({
      bonusInfo: '这味药被称为"百草之王"',
    });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    expect(screen.getByTestId('bonus-info')).toBeInTheDocument();
    expect(screen.getByTestId('bonus-info')).toHaveTextContent('这味药被称为"百草之王"');
  });

  it('does not display bonus info section when bonusInfo is not provided', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation({ bonusInfo: undefined });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    expect(screen.queryByTestId('bonus-info')).not.toBeInTheDocument();
  });

  it('hides choice options when evaluation is present', () => {
    const question = createMockQuestion({
      type: 'choice',
      options: ['人参', '黄芪', '当归', '白术'],
    });
    const evaluation = createMockEvaluation();

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    expect(screen.queryByTestId('choice-options')).not.toBeInTheDocument();
  });

  it('hides hint section when evaluation is present', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation();

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={true}
      />
    );

    expect(screen.queryByTestId('hint-section')).not.toBeInTheDocument();
  });

  it('applies correct background color for correct evaluation', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation({ isCorrect: true });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    const bubble = screen.getByTestId('question-bubble');
    expect(bubble.className).toContain('bg-green-50');
    expect(bubble.className).toContain('border-green-300');
  });

  it('applies correct background color for incorrect evaluation', () => {
    const question = createMockQuestion();
    const evaluation = createMockEvaluation({ isCorrect: false });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={evaluation}
        showHint={false}
      />
    );

    const bubble = screen.getByTestId('question-bubble');
    expect(bubble.className).toContain('bg-red-50');
    expect(bubble.className).toContain('border-red-300');
  });

  it('applies default white background when no evaluation', () => {
    const question = createMockQuestion();

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    const bubble = screen.getByTestId('question-bubble');
    expect(bubble.className).toContain('bg-white');
    expect(bubble.className).toContain('border-gray-200');
  });

  it('displays different score values correctly', () => {
    const question = createMockQuestion();
    const scores: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

    const { rerender } = render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={createMockEvaluation({ score: 1 })}
        showHint={false}
      />
    );

    scores.forEach((score) => {
      rerender(
        <QuestionBubble
          spiritName="人参精灵"
          question={question}
          evaluation={createMockEvaluation({ score })}
          showHint={false}
        />
      );
      expect(screen.getByTestId('evaluation-score')).toHaveTextContent(`得分: ${score}/5分`);
    });
  });

  it('handles judgment type questions correctly', () => {
    const question = createMockQuestion({ type: 'judge' });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.queryByTestId('choice-options')).not.toBeInTheDocument();
    expect(screen.getByTestId('question-text')).toBeInTheDocument();
  });

  it('handles free type questions correctly', () => {
    const question = createMockQuestion({ type: 'free' });

    render(
      <QuestionBubble
        spiritName="人参精灵"
        question={question}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.queryByTestId('choice-options')).not.toBeInTheDocument();
    expect(screen.getByTestId('question-text')).toBeInTheDocument();
  });
});
