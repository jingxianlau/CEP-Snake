import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import {
  grid,
  players,
  randomColour,
  randomDir,
  randomSpace,
  findId,
  genApple,
  newLoc,
  clear
} from './helpers';

const tickRate = 5;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

for (let i = 0; i < 75; i++) {
  let arr: Space[] = [];
  for (let j = 0; j < 120; j++) {
    arr.push({
      filled: false,
      playerId: '',
      isApple: false
    });
  }
  grid.push(arr);
}

genApple(100);

app.use(express.static('public'));

io.on('connection', socket => {
  let spawn = randomSpace(1);
  const spawnDir = randomDir();
  players.push({
    id: socket.id,
    username: '',
    points: 0,
    colour: randomColour(),
    snake: {
      segments: [
        {
          num: 0,
          coords: spawn
        }
      ],
      dir: spawnDir,
      nextDir: spawnDir
    },
    mana: 20,
    dash: 0,
    dist: 1
  });
  grid[spawn.x][spawn.y] = {
    filled: true,
    playerId: socket.id,
    isApple: false
  };

  io.sockets.emit('grid', grid);
  io.sockets.emit('players', players);

  socket.on('action', data => {
    const { dir } = data;
    if (!['w', 'a', 's', 'd'].includes(dir)) return;

    const p = findId(socket.id);
    if (!p) return;
    switch (p.snake.dir) {
      case 'w':
        if (dir == 's') return;
        break;
      case 'a':
        if (dir == 'd') return;
        break;
      case 's':
        if (dir == 'w') return;
        break;
      case 'd':
        if (dir == 'a') return;
        break;
    }

    p.snake.nextDir = dir;
  });

  socket.on('ability', type => {
    const p = findId(socket.id);
    if (!p) return;
    if (type === 'dash') {
      if (p.dash != 0) return;
      p.dist = 3;
      p.dash = tickRate * 5;
    } else if (type === 'dash5') {
      if (p.mana < 20) return;
      p.dist = 7;
      p.mana -= 20;
    } else if (type === 'uturn') {
      if (p.mana < 20 || p.snake.segments.length < 2) return;

      // update direction accordingly
      const seg1 = p.snake.segments[0].coords;
      const seg2 = p.snake.segments[1].coords;
      const dx = seg1.x - seg2.x;
      const dy = seg1.y - seg2.y;
      if (dy == 0) p.snake.nextDir = dx < 1 ? 'w' : 's';
      else p.snake.nextDir = dy < 1 ? 'a' : 'd';

      p.snake.segments.reverse();
      for (let i = 0; i < p.snake.segments.length; i++)
        p.snake.segments[i].num = i;

      p.mana -= 20;
    }
  });

  socket.on('disconnect', () => {
    players.splice(
      players.findIndex(val => val.id === socket.id),
      1
    );

    kill(socket.id);
  });
});

setInterval(() => {
  update();
  io.sockets.emit('grid', grid);
  io.sockets.emit('players', players);
}, 1000 / tickRate);

function update() {
  let cleared = false;
  while (!cleared) {
    cleared = true;
    const hitlist: string[] = []; // can't be killed at runtime in case multiple ppl die
    const processed: string[] = []; // helpful for edge case where snake collides with tail
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (p.dist-- == 0) continue;
      else cleared = false;

      const c = newLoc(p, processed); // gets new head location based on direction of snake
      if (c.x === -1 && c.y === -1) {
        hitlist.push(p.id);
        continue;
      }

      const hasEatenApple = grid[c.x][c.y].isApple;
      p.snake.segments.push({ num: p.snake.segments.length, coords: c });
      grid[c.x][c.y] = {
        filled: true,
        playerId: p.id,
        isApple: false
      };

      if (!hasEatenApple) {
        const tail = p.snake.segments.shift();
        if (tail) clear(tail.coords.x, tail.coords.y);
        p.snake.segments.map(s => s.num--);
      } else genApple();

      p.snake.dir = p.snake.nextDir;

      processed.push(p.id);
    }

    for (const p of hitlist) kill(p);
  }

  players.map(p => {
    p.dist = 1;
    p.dash = Math.max(--p.dash, 0);
    p.mana += 1 / tickRate;
  });
}

export function kill(id: string) {
  for (let x = 0; x < grid.length; x++)
    for (let y = 0; y < grid[x].length; y++)
      if (grid[x][y].playerId === id) clear(x, y);
  io.to(id).emit('dead');
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
