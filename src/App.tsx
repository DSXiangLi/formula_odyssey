import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChapterSelect from './pages/ChapterSelect';
import { GatheringStage } from './pages/GatheringStage';

// Placeholder for ChapterEntry (will be implemented in later phase)
const ChapterEntry: React.FC = () => {
  const chapterId = window.location.pathname.split('/').pop();
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">章节入口</h1>
        <p className="text-gray-600 mb-4">章节ID: {chapterId}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          返回章节选择
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChapterSelect />} />
        <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
        <Route path="/chapter/:chapterId/gathering" element={<GatheringStage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
