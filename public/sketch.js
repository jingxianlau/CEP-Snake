let grid = [];
let players = [];
let p;
let dead = false;
let screenShake = false;
let screenShakeCoeff = 5;
let screenShakeTimer = 20;

function shake(coeff = 5, timer = 5) {
  screenShake = true;
  screenShakeCoeff = coeff;
  screenShakeTimer = timer;
}

function setup() {
  // Create canvas and attach to container
  canvas = createCanvas(1200, 780);
  background('black');

  // Connect to the server
  socket = io();

  // Listen for incoming drawing data
  socket.on('grid', data => {
    if (!dead) grid = data;
    p = players.find(a => a.id == socket.id);
  });
  socket.on('players', data => {
    let len, cd, oldmana;
    if (p) {
      len = p.snake.segments.length;
      cd = p.dash;
      oldmana = p.mana;
    }

    if (!dead) players = data;
    p = players.find(a => a.id == socket.id);

    if (!p) return;
    console.log(p.snake.segments.length, len);
    if (p.snake.segments.length > len) shake(2, 2);
    if (p.dash == 0 && cd !== 0) shake(3, 1);
    if (p.mana >= 20 && oldmana < 20) shake(6, 2);
  });

  socket.on('dead', () => {
    shake(20, 10);
    respawn();
    socket.disconnect();
  });
}

function draw() {
  background('#333');
  if (screenShake == true) {
    if (--screenShakeTimer == 0) screenShake = false;
    translate(
      random(-screenShakeCoeff, screenShakeCoeff),
      random(-screenShakeCoeff, screenShakeCoeff)
    );
  }
  if (grid.length == 0) return;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      fill('black');
      if (grid[i][j].filled)
        fill(
          players.find(e => e.id === grid[i][j].playerId)?.colour || 'white'
        );
      else if (grid[i][j].isApple) fill('red');
      strokeWeight(1);
      stroke('#333');
      square(j * 10, i * 10, 10);
    }
  }

  if (!p) return;

  fill('white');
  textSize(20);
  text(`Mana: ${Math.floor(p.mana)}`, 10, 775);

  textSize(15);
  text(
    `(Space) - Dash: ${
      Math.ceil(p.dash) == 0 ? 'READY' : Math.ceil(p.dash / 5) + 's'
    }`,
    125,
    772
  );
  text(`(Q) - U-Turn: 20 Mana`, 300, 772);
  text(`(E) - Super-Dash: 20 Mana`, 465, 772);
}

function keyPressed() {
  if (['w', 'a', 's', 'd'].includes(key))
    socket.emit('action', { player: socket.id, dir: key });

  if (p.dash == 0) {
    if (key == ' ') {
      shake(3, 3);
      socket.emit('ability', 'dash');
    }
  } else if (p.mana < 20) return;
  if (key == 'e') {
    shake(10, 10);
    socket.emit('ability', 'dash5');
  } else if (key == 'q') {
    shake(1, 10);
    socket.emit('ability', 'uturn');
  }
}

function respawn() {
  dead = true;
  console.log('DEAD');
}
