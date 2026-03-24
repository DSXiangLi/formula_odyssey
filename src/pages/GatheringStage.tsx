import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChapterStore } from '../stores/chapterStore';
import { usePlayerStore } from '../stores/playerStore';
import { MapGenerator } from '../systems/map/MapGenerator';
import { GameMap, Tile, Position } from '../systems/map/types';
import { IsometricMap } from '../components/map/IsometricMap';
import { DiggingMinigame } from '../components/minigames/DiggingMinigame';
import { TappingMinigame } from '../components/minigames/TappingMinigame';
import { LassoMinigame } from '../components/minigames/LassoMinigame';
import { getChapterById } from '../data/chapters';
import { CollectionType, WuxingType } from '../types';
import { Medicine } from '../types/medicine';
import { DiggingResult } from '../systems/minigames/DiggingGame';
import { TappingResult } from '../systems/minigames/TappingGame';
import { LassoResult } from '../systems/minigames/LassoGame';

// Medicine data import
import medicineData from '../../design-output/药灵数据配置.json';

interface CollectedMedicine {
  medicineId: string;
  name: string;
  amount: number;
}

export const GatheringStage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  // Stores
  const chapterStore = useChapterStore();
  const playerStore = usePlayerStore();

  // Local state
  const [gameMap, setGameMap] = useState<GameMap | null>(null);
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showMinigame, setShowMinigame] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<{ medicine: Medicine; rarity: string } | null>(null);
  const [collectedMedicines, setCollectedMedicines] = useState<CollectedMedicine[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Get chapter data
  const chapter = useMemo(() => {
    if (!chapterId) return null;
    return getChapterById(chapterId);
  }, [chapterId]);

  // Get chapter progress
  const chapterProgress = useMemo(() => {
    if (!chapterId) return null;
    return chapterStore.getChapterProgress(chapterId);
  }, [chapterId, chapterStore]);

  // Get medicines for this chapter
  const chapterMedicines = useMemo(() => {
    if (!chapter) return [];
    return chapter.medicines
      .map(name => medicineData.medicines.find((m: any) => m.name === name))
      .filter(Boolean) as Medicine[];
  }, [chapter]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!chapter || chapter.medicines.length === 0) return 0;
    const collected = chapterProgress?.collectedMedicines || [];
    const chapterMedNames = new Set(chapter.medicines);
    const collectedInChapter = collected.filter(name => chapterMedNames.has(name));
    return Math.round((collectedInChapter.length / chapter.medicines.length) * 100);
  }, [chapter, chapterProgress]);

  const isComplete = useMemo(() => {
    if (!chapter) return false;
    const collected = chapterProgress?.collectedMedicines || [];
    const chapterMedNames = new Set(chapter.medicines);
    return chapter.medicines.every(name => collected.includes(name));
  }, [chapter, chapterProgress]);

  // Generate map on mount
  useEffect(() => {
    if (!chapter || !chapterId) return;

    const generator = new MapGenerator();
    const mapConfig = {
      chapterId,
      wuxing: chapter.wuxing,
      size: 6,
      difficulty: 'normal' as const,
      medicineDensity: 0.25,
      eventFrequency: 0.1,
      weatherEnabled: true,
      medicines: chapterMedicines,
    };

    const newMap = generator.generate(mapConfig);
    setGameMap(newMap);
    setPlayerPosition(newMap.playerStart);

    // Initialize chapter progress if needed
    chapterStore.setCurrentChapter(chapterId);

    // Reveal tiles around player start
    revealTilesAround(newMap.playerStart, newMap);
  }, [chapter, chapterId]);

  // Check for completion
  useEffect(() => {
    if (isComplete && !showCompleteModal) {
      setShowCompleteModal(true);
    }
  }, [isComplete]);

  // Reveal tiles around a position
  const revealTilesAround = (position: Position, map: GameMap) => {
    const revealRadius = 2;
    const updatedTiles = [...map.tiles];

    for (let dy = -revealRadius; dy <= revealRadius; dy++) {
      for (let dx = -revealRadius; dx <= revealRadius; dx++) {
        const x = position.x + dx;
        const y = position.y + dy;

        if (x >= 0 && x < map.size && y >= 0 && y < map.size) {
          const tile = updatedTiles[y][x];
          if (tile.discoveryState === 'hidden') {
            tile.discoveryState = 'discovered';
          }
        }
      }
    }

    setGameMap({ ...map, tiles: updatedTiles });
  };

  // Get adjacent positions
  const getAdjacentPositions = (pos: Position): Position[] => {
    return [
      { x: pos.x, y: pos.y - 1 }, // up
      { x: pos.x, y: pos.y + 1 }, // down
      { x: pos.x - 1, y: pos.y }, // left
      { x: pos.x + 1, y: pos.y }, // right
    ];
  };

  // Check if position is adjacent
  const isAdjacent = (from: Position, to: Position): boolean => {
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  // Handle tile click
  const handleTileClick = useCallback((tile: Tile) => {
    if (!gameMap) return;

    // Check if tile is accessible
    if (!tile.accessible) {
      showNotification('无法通过此处');
      return;
    }

    // Check if tile is adjacent to player
    if (!isAdjacent(playerPosition, tile.position)) {
      showNotification('需要先移动到相邻位置');
      return;
    }

    // Move player to tile
    movePlayer(tile.position);

    // Check for medicine on the tile
    if (tile.medicine && tile.discoveryState === 'explored') {
      const medicine = medicineData.medicines.find((m: any) =>
        m.id === tile.medicine?.medicineId || m.name === tile.medicine?.medicineId
      );

      if (medicine) {
        setCurrentMedicine({
          medicine,
          rarity: tile.medicine.rarity,
        });
        setSelectedTile(tile);
        setShowMinigame(true);
      }
    }
  }, [gameMap, playerPosition]);

  // Move player
  const movePlayer = (newPosition: Position) => {
    if (!gameMap) return;

    setPlayerPosition(newPosition);

    // Mark tile as visited and explored
    const updatedTiles = [...gameMap.tiles];
    const tile = updatedTiles[newPosition.y][newPosition.x];
    tile.visited = true;
    tile.discoveryState = 'explored';

    setGameMap({ ...gameMap, tiles: updatedTiles });

    // Reveal surrounding tiles
    revealTilesAround(newPosition, { ...gameMap, tiles: updatedTiles });
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  };

  // Get minigame component based on collection type
  const getMinigameComponent = () => {
    if (!currentMedicine || !selectedTile?.medicine) return null;

    const collectionType = selectedTile.medicine.collectionType;
    const rarity = currentMedicine.rarity;

    const handleMinigameComplete = (result: DiggingResult | TappingResult | LassoResult) => {
      handleCollectionComplete(result.success, currentMedicine.medicine, rarity);
    };

    const handleMinigameCancel = () => {
      setShowMinigame(false);
      setSelectedTile(null);
      setCurrentMedicine(null);
    };

    switch (collectionType) {
      case CollectionType.Digging:
        return (
          <DiggingMinigame
            rarity={rarity}
            onComplete={handleMinigameComplete as (result: DiggingResult) => void}
          />
        );
      case CollectionType.Tapping:
        return (
          <TappingMinigame
            rarity={rarity}
            onComplete={handleMinigameComplete as (result: TappingResult) => void}
            onCancel={handleMinigameCancel}
          />
        );
      case CollectionType.Lasso:
        return (
          <LassoMinigame
            rarity={rarity}
            onComplete={handleMinigameComplete as (result: LassoResult) => void}
            onCancel={handleMinigameCancel}
          />
        );
      default:
        // Default to digging for searching type
        return (
          <DiggingMinigame
            rarity={rarity}
            onComplete={handleMinigameComplete as (result: DiggingResult) => void}
          />
        );
    }
  };

  // Handle collection complete
  const handleCollectionComplete = (success: boolean, medicine: Medicine, rarity: string) => {
    setShowMinigame(false);
    setSelectedTile(null);
    setCurrentMedicine(null);

    if (success && chapterId) {
      // Add to collected medicines
      setCollectedMedicines(prev => {
        const existing = prev.find(m => m.medicineId === medicine.id);
        if (existing) {
          return prev.map(m =>
            m.medicineId === medicine.id
              ? { ...m, amount: m.amount + 1 }
              : m
          );
        }
        return [...prev, { medicineId: medicine.id, name: medicine.name, amount: 1 }];
      });

      // Update chapter progress
      chapterStore.collectMedicineInChapter(chapterId, medicine.name);

      // Update player data
      playerStore.collectMedicine(medicine.id);

      // Award currency based on rarity
      const currencyReward = {
        common: 10,
        uncommon: 20,
        rare: 50,
        epic: 100,
      }[rarity] || 10;

      playerStore.addCurrency(currencyReward);
      playerStore.addExperience(50);

      // Increase wuxing affinity
      if (chapter?.wuxing) {
        playerStore.increaseWuxingAffinity(chapter.wuxing, 5);
      }

      showNotification(`成功采集 ${medicine.name}！获得 ${currencyReward} 方灵石`);

      // Check if all medicines collected
      const updatedCollected = [...(chapterProgress?.collectedMedicines || []), medicine.name];
      const allCollected = chapter?.medicines.every(name =>
        updatedCollected.includes(name)
      );

      if (allCollected) {
        setTimeout(() => setShowCompleteModal(true), 1000);
      }
    } else {
      showNotification('采集失败，再试一次');
    }
  };

  // Complete stage and navigate
  const handleCompleteStage = () => {
    if (chapterId) {
      // Complete the gathering stage
      chapterStore.completeStage(chapterId, `${chapterId}-gathering`);

      // Award completion bonus
      playerStore.addCurrency(100);
      playerStore.addExperience(200);

      showNotification('采集阶段完成！获得 100 方灵石奖励');

      // Navigate back to chapter entry
      setTimeout(() => {
        navigate(`/chapter/${chapterId}`);
      }, 1500);
    }
  };

  // Get wuxing theme colors
  const getWuxingColors = (wuxing: WuxingType) => {
    const colors: Record<WuxingType, { primary: string; light: string; bg: string }> = {
      [WuxingType.Wood]: { primary: '#2E7D32', light: '#81C784', bg: 'bg-green-50' },
      [WuxingType.Fire]: { primary: '#C62828', light: '#EF5350', bg: 'bg-red-50' },
      [WuxingType.Earth]: { primary: '#F9A825', light: '#FFD54F', bg: 'bg-yellow-50' },
      [WuxingType.Metal]: { primary: '#78909C', light: '#B0BEC5', bg: 'bg-gray-50' },
      [WuxingType.Water]: { primary: '#1565C0', light: '#42A5F5', bg: 'bg-blue-50' },
    };
    return colors[wuxing] || colors[WuxingType.Wood];
  };

  if (!chapter || !gameMap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  const themeColors = getWuxingColors(chapter.wuxing);

  return (
    <div className={`min-h-screen ${themeColors.bg} p-4`}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/chapter/${chapterId}`)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              返回
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{chapter.title}</h1>
              <p className="text-sm text-gray-600">{chapter.subtitle} · 山谷采药</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">采集进度</div>
              <div className="text-lg font-bold" style={{ color: themeColors.primary }}>
                {chapterProgress?.collectedMedicines.filter(name =>
                  chapter.medicines.includes(name)
                ).length || 0} / {chapter.medicines.length}
              </div>
            </div>
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: themeColors.primary,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left sidebar - Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Target Medicines */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">目标药材</h2>
            <div className="space-y-2">
              {chapter.medicines.map((medicineName, index) => {
                const isCollected = chapterProgress?.collectedMedicines.includes(medicineName);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isCollected ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        isCollected
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isCollected ? '✓' : index + 1}
                    </div>
                    <span className={isCollected ? 'text-green-700 line-through' : 'text-gray-700'}>
                      {medicineName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">操作说明</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 点击相邻地块移动</li>
              <li>• 探索地块发现药材</li>
              <li>• 黄色标记表示有药材</li>
              <li>• 完成小游戏采集药材</li>
            </ul>
          </div>

          {/* Collected This Session */}
          {collectedMedicines.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">本次采集</h2>
              <div className="space-y-1">
                {collectedMedicines.map((med, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{med.name}</span>
                    <span className="text-amber-600">x{med.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center - Map */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <IsometricMap
              map={gameMap}
              playerPosition={playerPosition}
              onTileClick={handleTileClick}
              tileWidth={64}
              tileHeight={32}
            />
          </div>
        </div>
      </div>

      {/* Minigame Modal */}
      <AnimatePresence>
        {showMinigame && currentMedicine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
            >
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  发现 {currentMedicine.medicine.name}！
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  完成小游戏来采集这味药材
                </p>
              </div>
              {getMinigameComponent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                采集完成！
              </h2>
              <p className="text-gray-600 mb-6">
                恭喜你收集齐了本章所有药材！<br />
                获得 100 方灵石奖励
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-4">
                  已收集: {chapter.medicines.join('、')}
                </div>
                <button
                  onClick={handleCompleteStage}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  完成阶段
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GatheringStage;
