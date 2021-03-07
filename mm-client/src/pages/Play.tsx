import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Col,
  Container,
  Form,
  Row,
  Toast
} from 'react-bootstrap';
import { io, Socket } from 'socket.io-client';

import { rt2d } from '../global/util';
import Player from '../models/Player';
import PlayerItem from '../components/PlayerItem';

class Quote {
  bid: number = 0;
  ask: number = 0;
}

class GameState {
  phase: string = '';
  prompt: string = '';
  players: Player[] = [];
  width: number = 0;
  mmId: string = '';
  quote: Quote = new Quote();
  trueValue: number = 0;
}

const PlayPage: React.FC = () => {
  const [idMe, setIdMe] = useState('unset');
  const [playerMe, setPlayerMe] = useState(new Player());
  const [marketMaker, setMarketMaker] = useState(new Player());
  const [socket, setSocket] = useState((null as unknown) as Socket);
  const [gameState, setGameState] = useState(new GameState());
  const [bidWidth, setBidWidth] = useState(0);
  const [quoteBid, setQuoteBid] = useState(0);
  const [quoteAsk, setQuoteAsk] = useState(0);
  const [trueValue, setTrueValue] = useState(0);

  const [showBidWidthTooLargeToast, setShowBidWidthTooLargeToast] = useState(
    false
  );

  const [showQuoteTooWideToast, setShowQuoteTooWideToast] = useState(false);

  useEffect(() => {
    const _socket = io('http://localhost:3000');
    _socket.on('connection', ({ id }: { id: string }) => {
      console.log('received connection');
      setIdMe(id);
      console.log('I am ', id);
    });

    _socket.on('state', (state: GameState) => {
      setGameState(state);
      console.log(state);
    });

    setSocket(_socket);
    console.log('socket');
  }, []);

  useEffect(() => {
    const player = gameState.players.find((player) => player.id === idMe);
    if (player) {
      setPlayerMe(player);
    }
    const _marketMaker = gameState.players.find(
      (player) => player.id === gameState.mmId
    );
    if (_marketMaker) {
      setMarketMaker(_marketMaker);
    }
  }, [gameState, idMe]);

  const changePrompt = (e: any) => {
    console.log('changePrompt', e.target.value);
    socket.emit('changePrompt', { prompt: e.target.value });
  };

  const changeTrueValue = (e: any) => {
    console.log('changeTrueValue', e.target.value);
    socket.emit('changeTrueValue', { trueValue: e.target.value });
  };

  const submitWidth = () => {
    if (gameState.width && bidWidth > gameState.width * 0.9) {
      setShowBidWidthTooLargeToast(true);
      return;
    }
    socket.emit('bidWidth', { width: bidWidth });
  };

  const submitDoneBidding = () => {
    socket.emit('doneBidding');
  };

  const doneBidding = () => {
    return playerMe.action === 'READY';
  };

  const submitQuotes = () => {
    if (quoteAsk < quoteBid || quoteAsk - quoteBid > gameState.width) {
      setShowQuoteTooWideToast(true);
      return;
    }
    socket.emit('submitQuotes', { bid: quoteBid, ask: quoteAsk });
  };

  const buySell = (action: string) => {
    socket.emit('buySell', { action });
  };

  const resolve = () => {
    socket.emit('resolve');
  };

  return (
    <>
      <Container>
        <Row>
          <Form.Control
            id="prompt"
            type="text"
            placeholder="Prompt"
            value={gameState.prompt}
            onChange={changePrompt}
          />
        </Row>
        {gameState.phase === 'BID_WIDTH' && (
          <Row>
            <Col xs={6}>
              <Toast
                onClose={() => setShowBidWidthTooLargeToast(false)}
                show={showBidWidthTooLargeToast}
                delay={3000}
                autohide>
                <Toast.Header>
                  <strong className="mr-auto">Bid width too large!</strong>
                </Toast.Header>
                <Toast.Body>
                  Maximium bid width is {rt2d(0.9 * gameState.width)} because
                  current min width is {rt2d(gameState.width)}.
                </Toast.Body>
              </Toast>
              <Form.Control
                type="number"
                value={bidWidth}
                placeholder="Width"
                disabled={doneBidding()}
                onChange={(e) => {
                  setBidWidth(Number(e.target.value));
                }}
              />
              {gameState.width !== 0 && (
                <Form.Text className="text-muted">
                  Current best width: {gameState.width} - Max bid width:{' '}
                  {rt2d(gameState.width * 0.9)}
                </Form.Text>
              )}
            </Col>
            <Col xs={4}>
              <ButtonToolbar>
                <ButtonGroup>
                  <Button onClick={submitWidth} disabled={bidWidth <= 0}>
                    Submit Width Bid
                  </Button>
                </ButtonGroup>
                <ButtonGroup></ButtonGroup>
              </ButtonToolbar>
            </Col>
            <Col xs={2}>
              <Button disabled={doneBidding()} onClick={submitDoneBidding}>
                Done
              </Button>
            </Col>
          </Row>
        )}
        {gameState.phase === 'MAKE_MARKET' && gameState.mmId === idMe && (
          <>
            <Row>
              <Toast
                onClose={() => setShowQuoteTooWideToast(false)}
                show={showQuoteTooWideToast}
                delay={3000}
                autohide>
                <Toast.Header>
                  <strong className="mr-auto">Quote width is too large!</strong>
                </Toast.Header>
                <Toast.Body>
                  Current quotes has width {rt2d(quoteAsk - quoteBid)}. Maximum
                  width is {rt2d(gameState.width)}
                </Toast.Body>
              </Toast>
            </Row>
            <Row>
              <Col>
                <Form.Label>Bid</Form.Label>
                <Form.Control
                  type="number"
                  disabled={gameState.mmId !== idMe}
                  value={quoteBid}
                  onChange={(e) => setQuoteBid(Number(e.target.value))}
                />
              </Col>
              <Col>
                <Form.Label>Ask</Form.Label>
                <Form.Control
                  type="number"
                  disabled={gameState.mmId !== idMe}
                  value={quoteAsk}
                  onChange={(e) => setQuoteAsk(Number(e.target.value))}
                />
              </Col>
              <Col>
                <Button
                  disabled={gameState.mmId !== idMe}
                  onClick={submitQuotes}>
                  Submit
                </Button>
              </Col>
            </Row>
          </>
        )}
        {gameState.phase === 'MAKE_MARKET' && gameState.mmId !== idMe && (
          <h2>Waiting for Marketmaker ({marketMaker.name})...</h2>
        )}
        {gameState.phase === 'BUY_SELL' && (
          <>
            <Row>
              <Col>
                <Form.Label>Bid</Form.Label>
                <Form.Control
                  type="number"
                  value={gameState.quote.bid}
                  disabled
                />
                <Button
                  disabled={gameState.mmId === idMe}
                  onClick={() => buySell('SELL')}>
                  Sell at {gameState.quote.bid}
                </Button>
              </Col>
              <Col>
                <Form.Label>Ask</Form.Label>
                <Form.Control
                  type="number"
                  value={gameState.quote.ask}
                  disabled
                />
                <Button
                  disabled={gameState.mmId === idMe}
                  onClick={() => buySell('BUY')}>
                  Buy at {gameState.quote.ask}
                </Button>
              </Col>
            </Row>
          </>
        )}
        {gameState.phase === 'RESOLVE' && (
          <>
            <Row>
              <Col>
                <Form.Label>True Value</Form.Label>
                <Form.Control
                  type="number"
                  value={gameState.trueValue}
                  onChange={changeTrueValue}
                />
              </Col>
              <Col>
                <Button onClick={resolve}>Resolve</Button>
              </Col>
            </Row>
          </>
        )}
        {/* <Row>
          <Col>Log</Col>
        </Row> */}
        <Row>
          <h2>Scoreboard</h2>
        </Row>
        <Row>
          <Col>
            {playerMe && (
              <PlayerItem
                key={playerMe.id}
                player={playerMe}
                self={true}
                socket={socket}
              />
            )}
            {gameState.players
              .filter((player) => player.id !== idMe)
              .map((player) => (
                <PlayerItem
                  key={player.id}
                  player={player}
                  self={false}
                  socket={socket}
                />
              ))}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PlayPage;
