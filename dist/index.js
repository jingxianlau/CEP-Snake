"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kill = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const helpers_1 = require("./helpers");
const tickRate = 5;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
for (let i = 0; i < 75; i++) {
    let arr = [];
    for (let j = 0; j < 120; j++) {
        arr.push({
            filled: false,
            playerId: '',
            isApple: false
        });
    }
    helpers_1.grid.push(arr);
}
(0, helpers_1.genApple)(100);
app.use(express_1.default.static('public'));
io.on('connection', socket => {
    let spawn = (0, helpers_1.randomSpace)(1);
    const spawnDir = (0, helpers_1.randomDir)();
    helpers_1.players.push({
        id: socket.id,
        username: '',
        points: 0,
        colour: (0, helpers_1.randomColour)(),
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
    helpers_1.grid[spawn.x][spawn.y] = {
        filled: true,
        playerId: socket.id,
        isApple: false
    };
    io.sockets.emit('grid', helpers_1.grid);
    io.sockets.emit('players', helpers_1.players);
    socket.on('action', data => {
        const { dir } = data;
        if (!['w', 'a', 's', 'd'].includes(dir))
            return;
        const p = (0, helpers_1.findId)(socket.id);
        if (!p)
            return;
        switch (p.snake.dir) {
            case 'w':
                if (dir == 's')
                    return;
                break;
            case 'a':
                if (dir == 'd')
                    return;
                break;
            case 's':
                if (dir == 'w')
                    return;
                break;
            case 'd':
                if (dir == 'a')
                    return;
                break;
        }
        p.snake.nextDir = dir;
    });
    socket.on('ability', type => {
        const p = (0, helpers_1.findId)(socket.id);
        if (!p)
            return;
        if (type === 'dash') {
            if (p.dash != 0)
                return;
            p.dist = 3;
            p.dash = tickRate * 5;
        }
        else if (type === 'dash5') {
            if (p.mana < 20)
                return;
            p.dist = 7;
            p.mana -= 20;
        }
        else if (type === 'uturn') {
            if (p.mana < 20 || p.snake.segments.length < 2)
                return;
            const seg1 = p.snake.segments[0].coords;
            const seg2 = p.snake.segments[1].coords;
            const dx = seg1.x - seg2.x;
            const dy = seg1.y - seg2.y;
            if (dy == 0)
                p.snake.nextDir = dx < 1 ? 'w' : 's';
            else
                p.snake.nextDir = dy < 1 ? 'a' : 'd';
            p.snake.segments.reverse();
            for (let i = 0; i < p.snake.segments.length; i++)
                p.snake.segments[i].num = i;
            p.mana -= 20;
        }
    });
    socket.on('disconnect', () => {
        helpers_1.players.splice(helpers_1.players.findIndex(val => val.id === socket.id), 1);
        kill(socket.id);
    });
});
setInterval(() => {
    update();
    io.sockets.emit('grid', helpers_1.grid);
    io.sockets.emit('players', helpers_1.players);
}, 1000 / tickRate);
function update() {
    let cleared = false;
    while (!cleared) {
        cleared = true;
        const hitlist = [];
        const processed = [];
        for (let i = 0; i < helpers_1.players.length; i++) {
            const p = helpers_1.players[i];
            if (p.dist-- == 0)
                continue;
            else
                cleared = false;
            const c = (0, helpers_1.newLoc)(p, processed);
            if (c.x === -1 && c.y === -1) {
                hitlist.push(p.id);
                continue;
            }
            const hasEatenApple = helpers_1.grid[c.x][c.y].isApple;
            p.snake.segments.push({ num: p.snake.segments.length, coords: c });
            helpers_1.grid[c.x][c.y] = {
                filled: true,
                playerId: p.id,
                isApple: false
            };
            if (!hasEatenApple) {
                const tail = p.snake.segments.shift();
                if (tail)
                    (0, helpers_1.clear)(tail.coords.x, tail.coords.y);
                p.snake.segments.map(s => s.num--);
            }
            else
                (0, helpers_1.genApple)();
            p.snake.dir = p.snake.nextDir;
            processed.push(p.id);
        }
        for (const p of hitlist)
            kill(p);
    }
    helpers_1.players.map(p => {
        p.dist = 1;
        p.dash = Math.max(--p.dash, 0);
        p.mana += 1 / tickRate;
    });
}
function kill(id) {
    for (let x = 0; x < helpers_1.grid.length; x++)
        for (let y = 0; y < helpers_1.grid[x].length; y++)
            if (helpers_1.grid[x][y].playerId === id)
                (0, helpers_1.clear)(x, y);
    io.to(id).emit('dead');
}
exports.kill = kill;
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map