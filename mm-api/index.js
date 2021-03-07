const app = require('express')();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('socket connected');
  socket.on('hello', (msg) => {
    console.log(msg);
  });
});

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});
