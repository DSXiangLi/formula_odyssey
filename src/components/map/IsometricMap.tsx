import React, { useCallback, useState } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { GameMap, Tile } from '../../systems/map/types';
import { Position } from '../../types';

interface IsometricMapProps {
  map: GameMap;
  playerPosition: Position;
  onTileClick: (tile: Tile) => void;
  tileWidth?: number;
  tileHeight?: number;
}

const TERRAIN_COLORS: Record<string, string> = {
  plains: '#8BC34A',
  forest: '#4CAF50',
  mountain: '#795548',
  water: '#2196F3',
  marsh: '#607D8B',
  cave: '#424242',
  cliff: '#9E9E9E',
};

export const IsometricMap: React.FC<IsometricMapProps> = ({
  map,
  playerPosition,
  onTileClick,
  tileWidth = 64,
  tileHeight = 32,
}) => {
  const [hoveredTile, setHoveredTile] = useState<Tile | null>(null);

  const worldToScreen = (x: number, y: number): { x: number; y: number } => {
    const screenX = (x - y) * tileWidth / 2 + 400;
    const screenY = (x + y) * tileHeight / 2 + 200;
    return { x: screenX, y: screenY };
  };

  const screenToWorld = (screenX: number, screenY: number): Position => {
    const x = (screenX - 400) / (tileWidth / 2);
    const y = (screenY - 200) / (tileHeight / 2);
    return { x: Math.round((x + y) / 2), y: Math.round((y - x) / 2) };
  };

  const render = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    const tiles: Tile[] = [];
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        tiles.push(map.tiles[y][x]);
      }
    }
    tiles.sort((a, b) => (a.position.x + a.position.y) - (b.position.x + b.position.y));

    tiles.forEach(tile => {
      const pos = worldToScreen(tile.position.x, tile.position.y);
      renderTile(ctx, tile, pos.x, pos.y);
    });

    const playerPos = worldToScreen(playerPosition.x, playerPosition.y);
    renderPlayer(ctx, playerPos.x, playerPos.y);
  }, [map, playerPosition, tileWidth, tileHeight]);

  const renderTile = (ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number) => {
    const color = tile.discoveryState === 'hidden'
      ? '#1a1a2e'
      : TERRAIN_COLORS[tile.terrain] || '#8BC34A';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - tileHeight / 2);
    ctx.lineTo(x + tileWidth / 2, y);
    ctx.lineTo(x, y + tileHeight / 2);
    ctx.lineTo(x - tileWidth / 2, y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = tile.discoveryState === 'hidden' ? '#0f0f1a' : '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (tile.medicine && tile.discoveryState === 'explored') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y - tileHeight / 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (tile.visited) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y - tileHeight / 2);
      ctx.lineTo(x + tileWidth / 2, y);
      ctx.lineTo(x, y + tileHeight / 2);
      ctx.lineTo(x - tileWidth / 2, y);
      ctx.closePath();
      ctx.fill();
    }
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(x, y - tileHeight / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#FF5722';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const canvasRef = useCanvas({
    width: 800,
    height: 600,
    onRender: render,
  });

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = screenToWorld(x, y);

    if (worldPos.x >= 0 && worldPos.x < map.size &&
        worldPos.y >= 0 && worldPos.y < map.size) {
      const tile = map.tiles[worldPos.y][worldPos.x];
      onTileClick(tile);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={handleClick}
      className="cursor-pointer"
      style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
    />
  );
};
