import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChapterSelect from './pages/ChapterSelect';
import ChapterEntry from './pages/ChapterEntry';
import StageManager from './pages/StageManager';
import BattleStage from './pages/stages/BattleStage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChapterSelect />} />
        <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
        {/* 阶段管理路由 - v3.0 新架构 */}
        <Route path="/chapter/:chapterId/stage" element={<StageManager />} />
        {/* 战斗关卡路由 */}
        <Route path="/chapter/:chapterId/battle" element={<BattleStage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
