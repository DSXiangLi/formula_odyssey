import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Position } from '../systems/map/types';
import { WuxingType } from '../types';

interface MapTileData {
  position: { x: number; y: number };
  medicine?: {
    medicineId: string;
    rarity: string;
  };
  discoveryState: string;
}

interface MapState {
  playerPosition: Position | null;
  mapTiles: MapTileData[];
  mapSize: number;
  currentChapterWuxing: WuxingType | null;
  currentChapterId: string | null;

  // Actions
  setPlayerPosition: (position: Position) => void;
  setMapData: (tiles: MapTileData[], size: number) => void;
  updateTile: (position: Position, updates: Partial<MapTileData>) => void;
  setCurrentChapter: (chapterId: string, wuxing: WuxingType) => void;
  clearMapData: () => void;
}

export const useMapStore = create<MapState>()(
  immer(
    persist(
      (set) => ({
        playerPosition: null,
        mapTiles: [],
        mapSize: 0,
        currentChapterWuxing: null,
        currentChapterId: null,

        setPlayerPosition: (position) =>
          set((state) => {
            state.playerPosition = position;
          }),

        setMapData: (tiles, size) =>
          set((state) => {
            state.mapTiles = tiles;
            state.mapSize = size;
          }),

        updateTile: (position, updates) =>
          set((state) => {
            const tileIndex = state.mapTiles.findIndex(
              (t) => t.position.x === position.x && t.position.y === position.y
            );
            if (tileIndex >= 0) {
              Object.assign(state.mapTiles[tileIndex], updates);
            }
          }),

        setCurrentChapter: (chapterId, wuxing) =>
          set((state) => {
            state.currentChapterId = chapterId;
            state.currentChapterWuxing = wuxing;
          }),

        clearMapData: () =>
          set((state) => {
            state.playerPosition = null;
            state.mapTiles = [];
            state.mapSize = 0;
            state.currentChapterWuxing = null;
            state.currentChapterId = null;
          }),
      }),
      {
        name: 'fangling-valley-v3-storage',
        partialize: (state) => ({
          playerPosition: state.playerPosition,
          mapTiles: state.mapTiles,
          mapSize: state.mapSize,
          currentChapterWuxing: state.currentChapterWuxing,
          currentChapterId: state.currentChapterId,
        }),
      }
    )
  )
);
