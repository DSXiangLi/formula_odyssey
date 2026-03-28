import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MedicineSpirit } from '../../../systems/battle/types';
import SpiritCharacter from '../SpiritCharacter';

// Mock framer-motion to avoid animation issues in tests
// Note: vi.mock is hoisted, so we define the mock inside the factory
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      'data-testid': dataTestId,
      onClick,
      className,
      style,
      ...props
    }: {
      children?: React.ReactNode;
      'data-testid'?: string;
      onClick?: () => void;
      className?: string;
      style?: React.CSSProperties;
      [key: string]: unknown;
    }) => (
      <div data-testid={dataTestId} onClick={onClick} className={className} style={style}>
        {children}
      </div>
    ),
    span: ({
      children,
      className,
      ...props
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => <span className={className}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createMockSpirit = (overrides?: Partial<MedicineSpirit>): MedicineSpirit => ({
  id: 'spirit-1',
  medicineId: 'med-1',
  name: '人参',
  displayName: '人参精灵',
  imageUrl: '/images/spirits/renshen.png',
  difficulty: 'normal',
  personality: 'gentle',
  position: { x: 100, y: 150 },
  tameProgress: 30,
  state: 'floating',
  isActive: false,
  floatPhase: 0,
  question: {
    id: 'q-1',
    type: 'recall',
    question: '这味药叫什么名字？',
    acceptableAnswers: ['人参', 'renshen'],
    hint: '补气的上品药材',
    knowledgeType: 'name',
  },
  ...overrides,
});

describe('SpiritCharacter', () => {
  it('renders spirit with basic information', () => {
    const spirit = createMockSpirit();
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    // Check main elements exist
    expect(screen.getByTestId('spirit-character-spirit-1')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-container')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-name')).toHaveTextContent('人参精灵');
    expect(screen.getByTestId('spirit-image')).toHaveAttribute('src', '/images/spirits/renshen.png');
  });

  it('displays progress bar when not tamed', () => {
    const spirit = createMockSpirit({ tameProgress: 75 });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    expect(screen.getByTestId('spirit-progress-container')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-progress-text')).toHaveTextContent('75%');
  });

  it('hides progress bar when spirit is tamed', () => {
    const spirit = createMockSpirit({ state: 'tamed', tameProgress: 100 });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    expect(screen.queryByTestId('spirit-progress-container')).not.toBeInTheDocument();
    expect(screen.getByTestId('spirit-tamed-label')).toHaveTextContent('已驯服');
  });

  it('displays tamed overlay with checkmark when tamed', () => {
    const spirit = createMockSpirit({ state: 'tamed' });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    expect(screen.getByTestId('spirit-tamed-overlay')).toBeInTheDocument();
  });

  it('shows escaped label when spirit has escaped', () => {
    const spirit = createMockSpirit({ state: 'escaped' });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    expect(screen.getByTestId('spirit-escaped-label')).toHaveTextContent('已逃跑');
  });

  it('shows connection line when active and not tamed', () => {
    const spirit = createMockSpirit({ state: 'asking' });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={true} />);

    expect(screen.getByTestId('spirit-connection-line')).toBeInTheDocument();
  });

  it('hides connection line when tamed', () => {
    const spirit = createMockSpirit({ state: 'tamed' });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={true} />);

    expect(screen.queryByTestId('spirit-connection-line')).not.toBeInTheDocument();
  });

  it('shows active ring when isActive is true', () => {
    const spirit = createMockSpirit();
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={true} />);

    expect(screen.getByTestId('spirit-active-ring')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const spirit = createMockSpirit();
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    const spiritElement = screen.getByTestId('spirit-character-spirit-1');
    fireEvent.click(spiritElement);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows fallback display when image fails to load', () => {
    const spirit = createMockSpirit();
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    const image = screen.getByTestId('spirit-image');
    // Simulate image load error
    fireEvent.error(image);

    // After error, fallback should be shown
    expect(screen.getByTestId('spirit-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-fallback')).toHaveTextContent('人');
  });

  it('applies correct border color for difficulty when active', () => {
    const normalSpirit = createMockSpirit({ difficulty: 'normal' });
    const eliteSpirit = createMockSpirit({ difficulty: 'elite', id: 'spirit-2' });
    const bossSpirit = createMockSpirit({ difficulty: 'boss', id: 'spirit-3' });

    // Test normal difficulty
    const { unmount } = render(
      <SpiritCharacter spirit={normalSpirit} onClick={vi.fn()} isActive={true} />
    );
    let container = screen.getByTestId('spirit-container');
    expect(container.className).toContain('border-blue-400');
    unmount();

    // Test elite difficulty
    const { unmount: unmount2 } = render(
      <SpiritCharacter spirit={eliteSpirit} onClick={vi.fn()} isActive={true} />
    );
    container = screen.getByTestId('spirit-container');
    expect(container.className).toContain('border-purple-400');
    unmount2();

    // Test boss difficulty
    render(<SpiritCharacter spirit={bossSpirit} onClick={vi.fn()} isActive={true} />);
    container = screen.getByTestId('spirit-container');
    expect(container.className).toContain('border-orange-400');
  });

  it('applies green border when tamed regardless of difficulty', () => {
    const spirit = createMockSpirit({ difficulty: 'boss', state: 'tamed' });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    const container = screen.getByTestId('spirit-container');
    expect(container.className).toContain('border-green-400');
  });

  it('applies grayscale filter when escaped', () => {
    const spirit = createMockSpirit({ state: 'escaped' });
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    const container = screen.getByTestId('spirit-container');
    expect(container.className).toContain('grayscale');
  });

  it('renders different progress bar colors based on tameProgress', () => {
    const lowProgress = createMockSpirit({ tameProgress: 20, id: 'spirit-1' });
    const mediumProgress = createMockSpirit({ tameProgress: 60, id: 'spirit-2' });
    const highProgress = createMockSpirit({ tameProgress: 100, id: 'spirit-3' });

    // Test low progress
    const { unmount } = render(
      <SpiritCharacter spirit={lowProgress} onClick={vi.fn()} isActive={false} />
    );
    let progressBar = screen.getByTestId('spirit-progress-bar');
    expect(progressBar.className).toContain('bg-blue-400');
    unmount();

    // Test medium progress
    const { unmount: unmount2 } = render(
      <SpiritCharacter spirit={mediumProgress} onClick={vi.fn()} isActive={false} />
    );
    progressBar = screen.getByTestId('spirit-progress-bar');
    expect(progressBar.className).toContain('bg-yellow-400');
    unmount2();

    // Test high progress
    render(<SpiritCharacter spirit={highProgress} onClick={vi.fn()} isActive={false} />);
    progressBar = screen.getByTestId('spirit-progress-bar');
    expect(progressBar.className).toContain('bg-green-400');
  });

  it('shows glow effect element', () => {
    const spirit = createMockSpirit();
    const onClick = vi.fn();

    render(<SpiritCharacter spirit={spirit} onClick={onClick} isActive={false} />);

    expect(screen.getByTestId('spirit-glow')).toBeInTheDocument();
  });
});
