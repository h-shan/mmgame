const app = require('express')();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const players = {};

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  players[socket.id] = { id: socket.id, name: socket.id, points: 0 };
  socket.emit('connection', null);
  io.emit('state', { players: Object.values(players) });
  socket.on('hello', (msg) => {
    console.log(msg);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('state', { players: Object.values(players) });
  });
});

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});
