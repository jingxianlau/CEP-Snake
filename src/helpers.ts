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
    (spawnMode && !spaceAround(x, y)) // ensure 3x3 open space when spawning
  );
  return { x, y };
}

// if has player or is border
// apples count as empty
export function isEmpty(x: number, y: number) {
  return (
    x >= 0 &&
    y >= 0 &&
    x < grid.length &&
    y < grid[0].length &&
    !grid[x][y].filled
  );
}

export function clear(x: number, y: number) {
  if (x >= 0 && y >= 0 && x < grid.length && y < grid[0].length)
    grid[x][y] = {
      filled: false,
      playerId: '',
      isApple: false
    };
}

export function genApple(num: number = 1) {
  for (let i = 0; i < num; i++) {
    let spawn = randomSpace();

    grid[spawn.x][spawn.y] = {
      filled: false,
      playerId: '',
      isApple: true
    };
  }
}

export function findId(id: string): Player | null {
  let player = players.find(val => val.id === id);
  if (!player) return null;
  return player;
}

// returns new location of snake head
// also processes deaths
// returns { x: -1, y: -1 } if it dies
export function newLoc(p: Player, processed: string[], recurse = false) {
  const head = p.snake.segments[p.snake.segments.length - 1];
  const { x, y } = head.coords;
  switch (p.snake.nextDir) {
    case 'w':
      if (!isEmpty(x - 1, y)) return confirmKill({ x: x - 1, y: y });
      else return { x: x - 1, y: y };
    case 'a':
      if (!isEmpty(x, y - 1)) return confirmKill({ x: x, y: y - 1 });
      else return { x: x, y: y - 1 };
    case 's':
      if (!isEmpty(x + 1, y)) return confirmKill({ x: x + 1, y: y });
      else return { x: x + 1, y: y };
    case 'd':
      if (!isEmpty(x, y + 1)) return confirmKill({ x: x, y: y + 1 });
      else return { x: x, y: y + 1 };
  }

  // EDGE CASE (snake hits tail)
  function confirmKill(c: { x: number; y: number }) {
    if (recurse) return c; // stop recursion chain, since we only care abt if its an apple (see below)
    if (c.x < 0 || c.y < 0 || c.x >= grid.length || c.y >= grid[0].length)
      return { x: -1, y: -1 }; // died of natural causes

    const killer = players.find(p => p.id === grid[c.x][c.y].playerId);
    if (
      killer?.snake.segments[0].coords.x === c.x &&
      killer?.snake.segments[0].coords.y === c.y && // tail is hit
      !processed.includes(killer.id) // hasn't been processed yet
    ) {
      const c2 = newLoc(killer, processed, true);
      if (
        c2.x === -1 &&
        c2.y === -1 &&
        !grid[c2.x][c2.y].isApple // person it collided with isn't getting an apple (edge case passed)
      )
        return c; // bro still lives
    }
    return { x: -1, y: -1 };
  }

  return { x: -1, y: -1 }; // should never run
}
