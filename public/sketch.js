let grid = [];
let players = [];
let dead = false;

function setup() {
  // Create canvas and attach to container
  canvas = createCanvas(1200, 750);
  // canvas.parent('canvas-container');
  background(200);

  // Connect to the server
  socket = io();

  // Listen for incoming drawing data
  socket.on('grid', data => {
    if (!dead) grid = data;
  });
  socket.on('players', data => {
    if (!dead) players = data;
  });

  socket.on('dead', () => {
    respawn();
    socket.disconnect();
  });
}

function draw() {
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
}

function keyPressed() {
  if (['w', 'a', 's', 'd'].includes(key))
    socket.emit('action', { player: socket.id, dir: key });
}

function respawn() {
  dead = true;
  console.log('DEAD');
}
