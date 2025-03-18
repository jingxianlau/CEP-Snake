"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newLoc = exports.findId = exports.genApple = exports.clear = exports.isEmpty = exports.randomSpace = exports.randomDir = exports.randomColour = exports.randomInt = exports.players = exports.grid = void 0;
exports.grid = [];
exports.players = [];
function randomInt(n) {
    return Math.floor(Math.random() * n);
}
exports.randomInt = randomInt;
function randomColour() {
    return `rgb(${randomInt(256)}, ${randomInt(256)}, ${randomInt(256)})`;
}
exports.randomColour = randomColour;
function randomDir() {
    return ['w', 'a', 's', 'd'][randomInt(4)];
}
exports.randomDir = randomDir;
function spaceAround(x, y) {
    let ax = [-1, -1, -1, 1, 1, 1, 0, 0];
    let ay = [-1, 0, 1, -1, 0, 1, 1, -1];
    for (let i = 0; i < 8; i++) {
        if (!isEmpty(x + ax[i], y + ay[i]))
            return false;
    }
    return true;
}
function randomSpace(spawnMode = 0) {
    let x, y;
    do {
        x = randomInt(exports.grid.length);
        y = randomInt(exports.grid[0].length);
    } while (exports.grid[x][y].filled ||
        exports.grid[x][y].isApple ||
        (spawnMode && !spaceAround(x, y)));
    return { x, y };
}
exports.randomSpace = randomSpace;
function isEmpty(x, y) {
    return (x >= 0 &&
        y >= 0 &&
        x < exports.grid.length &&
        y < exports.grid[0].length &&
        !exports.grid[x][y].filled);
}
exports.isEmpty = isEmpty;
function clear(x, y) {
    if (x >= 0 && y >= 0 && x < exports.grid.length && y < exports.grid[0].length)
        exports.grid[x][y] = {
            filled: false,
            playerId: '',
            isApple: false
        };
}
exports.clear = clear;
function genApple(num = 1) {
    for (let i = 0; i < num; i++) {
        let spawn = randomSpace();
        exports.grid[spawn.x][spawn.y] = {
            filled: false,
            playerId: '',
            isApple: true
        };
    }
}
exports.genApple = genApple;
function findId(id) {
    let player = exports.players.find(val => val.id === id);
    if (!player)
        return null;
    return player;
}
exports.findId = findId;
function newLoc(p, processed, recurse = false) {
    const head = p.snake.segments[p.snake.segments.length - 1];
    let { x, y } = head.coords;
    switch (p.snake.nextDir) {
        case 'w':
            x--;
            break;
        case 'a':
            y--;
            break;
        case 's':
            x++;
            break;
        case 'd':
            y++;
            break;
        default:
            return { x: -1, y: -1 };
    }
    if (!isEmpty(x, y))
        return confirmKill({ x, y });
    else
        return { x, y };
    function confirmKill(c) {
        if (recurse)
            return c;
        if (c.x < 0 || c.y < 0 || c.x >= exports.grid.length || c.y >= exports.grid[0].length)
            return { x: -1, y: -1 };
        const killer = exports.players.find(p => p.id === exports.grid[c.x][c.y].playerId);
        if ((killer === null || killer === void 0 ? void 0 : killer.snake.segments[0].coords.x) === c.x &&
            (killer === null || killer === void 0 ? void 0 : killer.snake.segments[0].coords.y) === c.y &&
            !processed.includes(killer.id)) {
            const c2 = newLoc(killer, processed, true);
            if (c2.x === -1 &&
                c2.y === -1 &&
                !exports.grid[c2.x][c2.y].isApple)
                return c;
        }
        return { x: -1, y: -1 };
    }
}
exports.newLoc = newLoc;
//# sourceMappingURL=helpers.js.map