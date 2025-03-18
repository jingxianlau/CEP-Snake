import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import {
  grid,
  players,
  randomColour,
  randomDir,
  randomSpace,
  isEmpty,
  findId,
  genApple,
  moveSnake
} from './helpers';

const tickRate = 2;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

for (let i = 0; i < 100; i++) {
  let arr: Space[] = [];
  for (let j = 0; j < 100; j++) {
    arr.push({
      filled: false,
      playerId: '',
      segmentNum: 0,
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
    colour: randomColour(),
    dir: spawnDir,
    nextDir: spawnDir,
    size: 1,
    prev: { x: spawn.x, y: spawn.y }
  });
  grid[spawn.x][spawn.y] = {
    filled: true,
    playerId: socket.id,
    segmentNum: 1,
    isApple: false
  };

  io.sockets.emit('grid', grid);
  io.sockets.emit('players', players);

  socket.on('action', data => {
    const { player, dir } = data;
    if (!['w', 'a', 's', 'd'].includes(dir)) return;

    const pl = findId(player);
    if (!pl) return;
    switch (pl.dir) {
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

    pl.nextDir = dir;
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
  let moved: String[] = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j].filled && !findId(grid[i][j].playerId)) {
        grid[i][j] = {
          filled: false,
          playerId: '',
          segmentNum: 0,
          isApple: false
        };
      }
      if (grid[i][j].filled && grid[i][j].segmentNum === 1) {
        if (moved.find(e => e === grid[i][j].playerId)) continue;
        moved.push(grid[i][j].playerId);
        let newCoords = null;
        const pl = findId(grid[i][j].playerId);
        if (!pl) continue;
        switch (pl.nextDir) {
          case 'w':
            if (!isEmpty(i - 1, j)) {
              kill(grid[i][j].playerId);
              continue;
            } else newCoords = { x: i - 1, y: j };
            break;
          case 'a':
            if (!isEmpty(i, j - 1)) {
              kill(grid[i][j].playerId);
              continue;
            } else newCoords = { x: i, y: j - 1 };
            break;
          case 's':
            if (!isEmpty(i + 1, j)) {
              kill(grid[i][j].playerId);
              continue;
            } else newCoords = { x: i + 1, y: j };
            break;
          case 'd':
            if (!isEmpty(i, j + 1)) {
              kill(grid[i][j].playerId);
              continue;
            } else newCoords = { x: i, y: j + 1 };
            break;
        }
        pl.dir = pl.nextDir;

        // it somehow doesn't break if it dies????
        if (!newCoords || !isEmpty(newCoords.x, newCoords.y)) continue;

        // do DFS to move tail and update segment numbers
        moveSnake(i, j, newCoords.x, newCoords.y);
      }
    }
  }
}

export function kill(id: string) {
  for (let x = 0; x < grid.length; x++)
    for (let y = 0; y < grid[x].length; y++)
      if (grid[x][y].playerId === id)
        grid[x][y] = {
          filled: false,
          playerId: '',
          segmentNum: 0,
          isApple: false
        };
  io.to(id).emit('dead');
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
