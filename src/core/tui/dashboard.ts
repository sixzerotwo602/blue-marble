/**
 * TUI Dashboard Renderer
 * @description Story 5.1 - Dashboard View (UX)
 */
import type { GameState } from '../model/GameState.js';
import type { Player } from '../model/Player.js';
import type { Tile } from '../model/Tile.js';

// Box drawing characters
const BOX = {
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  HORIZONTAL: '─',
  VERTICAL: '│',
  T_DOWN: '┬',
  T_UP: '┴',
  T_RIGHT: '├',
  T_LEFT: '┤',
  CROSS: '┼',
};

// Player markers (1-4)
const PLAYER_MARKERS = ['①', '②', '③', '④'];

/**
 * 콘솔 클리어
 */
export function clearConsole(): void {
  // ANSI escape code for clear
  process.stdout.write('\x1B[2J\x1B[0;0H');
}

/**
 * 타일 이름 축약 (최대 4글자)
 */
function abbreviateTileName(tile: Tile): string {
  const name = tile.name ?? `T${tile.id}`;
  if (name.length <= 4) return name.padEnd(4);
  return name.substring(0, 4);
}

/**
 * 타일에 있는 플레이어 마커 생성
 */
function getPlayerMarkers(players: Player[], tileId: number): string {
  const markers = players
    .filter(p => p.position === tileId && !p.isBankrupt)
    .map((p, i) => PLAYER_MARKERS[players.indexOf(p)] ?? '?');
  return markers.join('').padEnd(2);
}

/**
 * 40칸 보드 렌더링 (11x11 그리드)
 */
export function renderBoard(state: GameState): string[] {
  const lines: string[] = [];
  const { tiles, players } = state;

  // 상단 행 (0-10): 타일 0-10
  lines.push(renderTopRow(tiles, players));
  lines.push(renderTopRowMarkers(tiles, players));

  // 중간 행 (좌우): 좌측 39-31, 우측 11-19
  for (let row = 1; row <= 9; row++) {
    const leftTileId = 40 - row; // 39, 38, ... 31
    const rightTileId = 10 + row; // 11, 12, ... 19
    lines.push(renderMiddleRow(tiles, players, leftTileId, rightTileId));
    lines.push(renderMiddleRowMarkers(tiles, players, leftTileId, rightTileId));
  }

  // 하단 행 (30-20): 타일 30-20 (역순)
  lines.push(renderBottomRow(tiles, players));
  lines.push(renderBottomRowMarkers(tiles, players));

  return lines;
}

function renderTopRow(tiles: Tile[], players: Player[]): string {
  const cells = [];
  for (let i = 0; i <= 10; i++) {
    const tile = tiles.find(t => t.id === i);
    cells.push(abbreviateTileName(tile!));
  }
  return `${BOX.TOP_LEFT}${cells.map(c => `${c}`).join(BOX.VERTICAL)}${BOX.TOP_RIGHT}`;
}

function renderTopRowMarkers(tiles: Tile[], players: Player[]): string {
  const cells = [];
  for (let i = 0; i <= 10; i++) {
    cells.push(getPlayerMarkers(players, i).padEnd(4));
  }
  return `${BOX.VERTICAL}${cells.join(BOX.VERTICAL)}${BOX.VERTICAL}`;
}

function renderMiddleRow(tiles: Tile[], players: Player[], leftId: number, rightId: number): string {
  const leftTile = tiles.find(t => t.id === leftId);
  const rightTile = tiles.find(t => t.id === rightId);
  const leftName = abbreviateTileName(leftTile!);
  const rightName = abbreviateTileName(rightTile!);
  const middle = '    '.repeat(9);
  return `${BOX.VERTICAL}${leftName}${BOX.VERTICAL}${middle}${BOX.VERTICAL}${rightName}${BOX.VERTICAL}`;
}

function renderMiddleRowMarkers(tiles: Tile[], players: Player[], leftId: number, rightId: number): string {
  const leftMarkers = getPlayerMarkers(players, leftId).padEnd(4);
  const rightMarkers = getPlayerMarkers(players, rightId).padEnd(4);
  const middle = '    '.repeat(9);
  return `${BOX.VERTICAL}${leftMarkers}${BOX.VERTICAL}${middle}${BOX.VERTICAL}${rightMarkers}${BOX.VERTICAL}`;
}

function renderBottomRow(tiles: Tile[], players: Player[]): string {
  const cells = [];
  for (let i = 30; i >= 20; i--) {
    const tile = tiles.find(t => t.id === i);
    cells.push(abbreviateTileName(tile!));
  }
  return `${BOX.BOTTOM_LEFT}${cells.join(BOX.VERTICAL)}${BOX.BOTTOM_RIGHT}`;
}

function renderBottomRowMarkers(tiles: Tile[], players: Player[]): string {
  const cells = [];
  for (let i = 30; i >= 20; i--) {
    cells.push(getPlayerMarkers(players, i).padEnd(4));
  }
  return `${BOX.VERTICAL}${cells.join(BOX.VERTICAL)}${BOX.VERTICAL}`;
}

/**
 * 플레이어 상태 패널 렌더링
 */
export function renderPlayerPanel(state: GameState): string[] {
  const lines: string[] = [];
  const { players, currentPlayerIndex, phase, turnNumber } = state;

  lines.push(`╔════════════════════════════════╗`);
  lines.push(`║  🎲 부루마블 - Turn ${String(turnNumber).padStart(4)}     ║`);
  lines.push(`║  Phase: ${phase.padEnd(22)}║`);
  lines.push(`╠════════════════════════════════╣`);

  players.forEach((player, index) => {
    const marker = PLAYER_MARKERS[index] ?? '?';
    const current = index === currentPlayerIndex ? '▶' : ' ';
    const status = player.isBankrupt ? '💀' : '💰';
    const money = formatMoney(player.money);
    const tiles = player.ownedTileIds.length;
    const pos = player.position;

    lines.push(`║${current}${marker} ${player.name.substring(0, 10).padEnd(10)} ${status}    ║`);
    lines.push(`║  💵 ${money.padStart(12)} | 🏠 ${String(tiles).padStart(2)}칸 ║`);
    lines.push(`║  📍 위치: ${String(pos).padStart(2)}번 타일           ║`);
    if (player.jailTurnsRemaining > 0) {
      lines.push(`║  ⛓️  무인도 ${player.jailTurnsRemaining}턴 남음            ║`);
    }
    lines.push(`╟────────────────────────────────╢`);
  });

  lines.pop(); // 마지막 구분선 제거
  lines.push(`╚════════════════════════════════╝`);

  return lines;
}

/**
 * 돈 포맷 (만원 단위)
 */
function formatMoney(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만`;
  }
  return `${amount}`;
}

/**
 * 전체 대시보드 렌더링
 */
export function renderDashboard(state: GameState): string {
  const boardLines = renderBoard(state);
  const panelLines = renderPlayerPanel(state);

  // 보드와 패널을 나란히 배치
  const maxLines = Math.max(boardLines.length, panelLines.length);
  const result: string[] = [];

  for (let i = 0; i < maxLines; i++) {
    const board = boardLines[i] ?? '';
    const panel = panelLines[i] ?? '';
    result.push(`${board}  ${panel}`);
  }

  return result.join('\n');
}

/**
 * 대시보드 출력
 */
export function printDashboard(state: GameState): void {
  clearConsole();
  console.log(renderDashboard(state));
}
