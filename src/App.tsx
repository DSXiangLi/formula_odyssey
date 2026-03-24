import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChapterSelect from './pages/ChapterSelect';
import ChapterEntry from './pages/ChapterEntry';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChapterSelect />} />
        <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
