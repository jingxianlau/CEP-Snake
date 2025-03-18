"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newLoc = exports.findId = exports.genApple = exports.clear = exports.isEmpty = exports.randomSpace = exports.randomDir = exports.randomColour = exports.players = exports.grid = void 0;
const crypto_1 = require("crypto");
const ax = [1, -1, 0, 0];
const ay = [0, 0, 1, -1];
exports.grid = [];
exports.players = [];
function randomColour() {
    return `rgb(${(0, crypto_1.randomInt)(256)}, ${(0, crypto_1.randomInt)(256)}, ${(0, crypto_1.randomInt)(256)})`;
}
exports.randomColour = randomColour;
function randomDir() {
    return ['w', 'a', 's', 'd'][(0, crypto_1.randomInt)(4)];
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
        x = (0, crypto_1.randomInt)(exports.grid.length);
        y = (0, crypto_1.randomInt)(exports.grid[0].length);
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
    const { x, y } = head.coords;
    switch (p.snake.nextDir) {
        case 'w':
            if (!isEmpty(x - 1, y))
                return confirmKill({ x: x - 1, y: y });
            else
                return { x: x - 1, y: y };
        case 'a':
            if (!isEmpty(x, y - 1))
                return confirmKill({ x: x, y: y - 1 });
            else
                return { x: x, y: y - 1 };
        case 's':
            if (!isEmpty(x + 1, y))
                return confirmKill({ x: x + 1, y: y });
            else
                return { x: x + 1, y: y };
        case 'd':
            if (!isEmpty(x, y + 1))
                return confirmKill({ x: x, y: y + 1 });
            else
                return { x: x, y: y + 1 };
    }
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
    return { x: -1, y: -1 };
}
exports.newLoc = newLoc;
//# sourceMappingURL=helpers.js.map