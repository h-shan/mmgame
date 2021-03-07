const { stringify } = require('querystring');

const app = require('express')();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let mmId = '';
let phase = 'BID_WIDTH';
let prompt = '';
let width = 0;
let quoteBid = 0;
let quoteAsk = 0;
const players = {};

const updateState = () => {
  io.emit('state', {
    prompt,
    players: Object.values(players),
    width,
    phase,
    mmId,
    quote: {
      bid: quoteBid,
      ask: quoteAsk
    }
  });
};

const checkAllReady = () => {
  return Object.values(players).every(
    (player) => player.id === mmId || player.action === 'READY'
  );
};

const resetRound = () => {
  prompt = '';
  width = 0;
  phase = 'BID_WIDTH';
  mmId = '';
};

// action is: NONE | READY | BUY | SELL
// phase is BID_WIDTH | MAKE_MARKET | BUY_SELL

io.on('connection', (socket) => {
  const id = socket.id;
  console.log('socket connected', socket.id);
  players[id] = {
    id,
    name: id,
    points: 0,
    action: 'NONE'
  };
  socket.emit('connection', { id });
  updateState();

  socket.on('hello', (msg) => {
    console.log(msg);
  });

  socket.on('changeName', ({ name }) => {
    players[id].name = name;
    updateState();
  });

  socket.on('changePrompt', ({ prompt: _prompt }) => {
    prompt = _prompt;
    updateState();
  });

  socket.on('bidWidth', ({ width: _width }) => {
    width = _width;
    mmId = id;
    console.log(`id=${id}, width=${width}`);
    updateState();
  });

  socket.on('doneBidding', () => {
    players[id].ready = true;
    if (checkAllReady()) {
      phase = 'MAKE_MARKET';
    }
    updateState();
  });

  socket.on('submitQuotes', ({ bid, ask }) => {
    quoteBid = bid;
    quoteAsk = ask;
    phase = 'BUY_SELL';
    console.log(`Received quotes - bid: ${bid} ask: ${ask}`);
    updateState();
  });

  socket.on('disconnect', () => {
    if (id === mmId && phase === 'MAKE_MARKET') {
      console.log('Marketmaker disconnected: Resetting...');
      resetRound();
    }
    delete players[socket.id];
    updateState();
  });
});

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});
