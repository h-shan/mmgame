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
let trueValue = 0;
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
    },
    trueValue
  });
};

const checkAllDoneBid = () => {
  return Object.values(players).every(
    (player) => player.id === mmId || player.action === 'READY'
  );
};

const checkAllDoneBuySell = () => {
  return Object.values(players).every(
    (player) =>
      player.id === mmId || player.action === 'BUY' || player.action === 'SELL'
  );
};

const resetRound = () => {
  prompt = '';
  width = 0;
  phase = 'BID_WIDTH';
  mmId = '';
  quoteBid = quoteAsk = 0;
  trueValue = 0;
};

// action is: NONE | READY | BUY | SELL
// phase is BID_WIDTH | MAKE_MARKET | BUY_SELL | RESOLVE

io.on('connection', (socket) => {
  const id = socket.id;
  console.log('socket connected', socket.id);
  players[id] = {
    id,
    name: 'Player ' + id.substring(0, 4),
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
    players[id].action = 'READY';
    if (checkAllDoneBid()) {
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

  socket.on('buySell', ({ action }) => {
    if (action !== 'BUY' && action !== 'SELL') {
      console.error('Invalid action', action);
      return;
    }
    players[id].action = action;
    if (checkAllDoneBuySell()) {
      phase = 'RESOLVE';
      updateState();
    }
  });

  socket.on('changeTrueValue', ({ trueValue: _trueValue }) => {
    trueValue = _trueValue;
    updateState();
  });

  socket.on('resolve', () => {
    Object.values(players).forEach((player) => {
      if (player.id === mmId) {
        return;
      }
      // make this mmCredit configurable
      const mmCredit = 2;
      let aggressorPnl;
      if (player.action === 'BUY') {
        aggressorPnl = trueValue - quoteAsk - mmCredit;
      } else if (player.action === 'SELL') {
        aggressorPnl = quoteBid - trueValue - mmCredit;
      }

      console.log(`aggressorPnl for ${player.name} = ${aggressorPnl}`);

      player.points += aggressorPnl;
      players[mmId].points -= aggressorPnl;
    });

    resetRound();
    updateState();
  });

  socket.on('disconnect', () => {
    if (id === mmId) {
      console.log('Marketmaker disconnected: Resetting...');
      resetRound();
    }
    delete players[id];
    updateState();
  });
});

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});
