import { randomInt } from 'crypto';

// grid traversal
const ax = [1, -1, 0, 0];
const ay = [0, 0, 1, -1];

// game state
export let grid: Space[][] = [];
export let players: Player[] = [];

export function randomColour() {
  return `rgb(${randomInt(256)}, ${randomInt(256)}, ${randomInt(256)})`;
}

export function randomDir() {
  return ['w', 'a', 's', 'd'][randomInt(4)];
}

function spaceAround(x: number, y: number): boolean {
  let ax = [-1, -1, -1, 1, 1, 1, 0, 0];
  let ay = [-1, 0, 1, -1, 0, 1, 1, -1];
  for (let i = 0; i < 8; i++) {
    if (!isEmpty(x + ax[i], y + ay[i])) return false;
  }
  return true;
}
export function randomSpace(spawnMode = 0) {
  let x, y;
  do {
    x = randomInt(grid.length);
    y = randomInt(grid[0].length);
  } while (
    grid[x][y].filled ||
    grid[x][y].isApple ||
    (spawnMode && !spaceAround(x, y))
  );
  return { x, y };
}

export function isEmpty(x: number, y: number) {
  return (
    x >= 0 &&
    y >= 0 &&
    x < grid[0].length &&
    y < grid.length &&
    !grid[x][y].filled
  );
}

export function moveSnake(x: number, y: number, nx: number, ny: number) {
  const pl = findId(grid[x][y].playerId);
  if (!pl) return;

  const isApple = grid[nx][ny].isApple;

  grid[nx][ny] = Object.assign({}, grid[x][y]);

  let segment = { x: nx, y: ny };
  for (let len = 0; len < pl.size; len++)
    for (let i = 0; i < 4; i++) {
      if (
        segment.x + ax[i] < 0 ||
        segment.y + ay[i] < 0 ||
        segment.x + ax[i] >= grid.length ||
        segment.y + ay[i] >= grid[0].length
      )
        continue;

      if (
        grid[segment.x + ax[i]][segment.y + ay[i]].filled &&
        grid[segment.x + ax[i]][segment.y + ay[i]].playerId == pl.id &&
        grid[segment.x + ax[i]][segment.y + ay[i]].segmentNum == len + 1
      ) {
        // if next segment is the end, no apple collected (lose the end)
        if (len + 1 == pl.size && !isApple) {
          pl.prev = { x: segment.x, y: segment.y };
          grid[segment.x + ax[i]][segment.y + ay[i]] = {
            filled: false,
            playerId: '',
            segmentNum: 0,
            isApple: false
          };
        } else {
          // next segment not the end, increment segnum
          grid[segment.x + ax[i]][segment.y + ay[i]].segmentNum++;
          segment.x += ax[i];
          segment.y += ay[i];
        }
        break;
      }
    }

  if (isApple) {
    pl.size++;
    genApple();
  }
}

export function genApple(num: number = 1) {
  for (let i = 0; i < num; i++) {
    let spawn = randomSpace();

    grid[spawn.x][spawn.y] = {
      filled: false,
      playerId: '',
      segmentNum: 0,
      isApple: true
    };
  }
}

export function findId(id: string): Player | null {
  let player = players.find(val => val.id === id);
  if (!player) return null;
  return player;
}
