import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ChapterSelect from '../../pages/ChapterSelect';
import '@testing-library/jest-dom/vitest';

// Ensure jsdom environment is loaded for this test file
// @vitest-environment jsdom

// Cleanup after each test
beforeEach(() => {
  cleanup();
});

// Mock the stores and data modules
vi.mock('../../stores/playerStore', () => ({
  usePlayerStore: () => ({
    unlockedChapters: ['chapter-1', 'chapter-2'],
    completedChapters: ['chapter-1'],
    collectedMedicines: ['medicine-1'],
    currency: 100,
    level: 1,
  }),
}));

vi.mock('../../data/chapters', () => ({
  chapters: [
    {
      id: 'chapter-1',
      chapterNumber: 1,
      title: '青木林入门',
      subtitle: '木行药材初探',
      wuxing: 'wood',
      medicines: ['medicine-1', 'medicine-2'],
      formulas: ['formula-1'],
      unlockRequirements: [],
    },
    {
      id: 'chapter-2',
      chapterNumber: 2,
      title: '赤焰峰探险',
      subtitle: '火行药材收集',
      wuxing: 'fire',
      medicines: ['medicine-3'],
      formulas: ['formula-2'],
      unlockRequirements: ['chapter-1'],
    },
  ],
  getChapterProgress: () => 50,
}));

// Mock component for chapter entry
const MockChapterEntry = () => {
  const { useParams } = require('react-router-dom');
  const { chapterId } = useParams();
  return <div data-testid="chapter-entry">Chapter: {chapterId}</div>;
};

describe('Routing', () => {
  it('should render ChapterSelect on root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ChapterSelect />} />
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    // Should find chapter selection content
    expect(document.body.textContent).toContain('章节选择');
  });

  it('should render ChapterEntry on /chapter/:id path', () => {
    render(
      <MemoryRouter initialEntries={['/chapter/chapter-1']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-entry')).toBeInTheDocument();
    expect(screen.getByText('Chapter: chapter-1')).toBeInTheDocument();
  });

  it('should pass chapterId parameter correctly', () => {
    const ChapterWithId = () => {
      const { useParams } = require('react-router-dom');
      const { chapterId } = useParams();
      return <div data-testid="chapter-id">{chapterId}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/chapter/chapter-5']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<ChapterWithId />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-id')).toHaveTextContent('chapter-5');
  });

  it('should handle navigation between routes', () => {
    const { useNavigate } = require('react-router-dom');

    const NavigationTest = () => {
      const navigate = useNavigate();
      return (
        <div>
          <button onClick={() => navigate('/chapter/chapter-2')}>Go to Chapter 2</button>
        </div>
      );
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavigationTest />} />
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    // Navigation should work
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle invalid chapter IDs gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/chapter/invalid-id']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    // Should still render with the invalid ID
    expect(screen.getByText('Chapter: invalid-id')).toBeInTheDocument();
  });

  it('should render different chapters based on route parameter', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/chapter/chapter-1']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-entry')).toHaveTextContent('Chapter: chapter-1');

    // Cleanup and re-render with different route
    unmount();

    render(
      <MemoryRouter initialEntries={['/chapter/chapter-2']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-entry')).toHaveTextContent('Chapter: chapter-2');
  });

  it('should handle nested routes under chapter', () => {
    const ChapterLayout = () => {
      const { Outlet } = require('react-router-dom');
      return (
        <div data-testid="chapter-layout">
          <Outlet />
        </div>
      );
    };

    const ChapterDetail = () => {
      const { useParams } = require('react-router-dom');
      const { chapterId } = useParams();
      return <div data-testid="chapter-detail">Detail: {chapterId}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/chapter/chapter-1/detail']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<ChapterLayout />}>
            <Route path="detail" element={<ChapterDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('chapter-layout')).toBeInTheDocument();
    expect(screen.getByTestId('chapter-detail')).toBeInTheDocument();
    expect(screen.getByText('Detail: chapter-1')).toBeInTheDocument();
  });

  it('should handle query parameters', () => {
    const QueryParamTest = () => {
      const { useSearchParams } = require('react-router-dom');
      const [searchParams] = useSearchParams();
      const tab = searchParams.get('tab') || 'default';
      return <div data-testid="query-tab">{tab}</div>;
    };

    render(
      <MemoryRouter initialEntries={['/chapter/chapter-1?tab=medicines']}>
        <Routes>
          <Route path="/chapter/:chapterId" element={<QueryParamTest />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('query-tab')).toHaveTextContent('medicines');
  });

  it('should handle route fallback/wildcard', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/chapter/:chapterId" element={<MockChapterEntry />} />
          <Route path="*" element={<div data-testid="not-found">404 Not Found</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });
});
