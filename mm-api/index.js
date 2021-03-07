const { stringify } = require('querystring');

const app = require('express')();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let prompt = '';
const players = {};

const updateState = () => {
  io.emit('state', { prompt, players: Object.values(players) });
};

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  players[socket.id] = { id: socket.id, name: socket.id, points: 0 };
  socket.emit('connection', { id: socket.id });
  updateState();

  socket.on('hello', (msg) => {
    console.log(msg);
  });

  socket.on('changeName', ({ id, name }) => {
    players[id].name = name;
    updateState();
  });

  socket.on('changePrompt', ({ prompt: _prompt }) => {
    prompt = _prompt;
    updateState();
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    updateState();
  });
});

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});
